package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
)

type User struct {
	ID         string `json:"id"`
	Username   string `json:"username"`
	Password   string `json:"password"` // Mock: unhashed for demo
	Email      string `json:"email"`
	IsVerified bool   `json:"is_verified"`
	OTP        string `json:"-"`
}

var (
	users  = make(map[string]User)
	nextID = 1
	mutex  sync.Mutex
)

func main() {
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("User Service is healthy"))
	})

	http.HandleFunc("/register", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var user User
		if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		mutex.Lock()
		// Check for uniqueness
		for _, u := range users {
			if u.Username == user.Username {
				mutex.Unlock()
				http.Error(w, "Username already exists", http.StatusConflict) // 409
				return
			}
			if u.Email == user.Email {
				mutex.Unlock()
				http.Error(w, "Email already exists", http.StatusConflict) // 409
				return
			}
		}

		user.ID = fmt.Sprintf("%d", nextID)
		nextID++
		user.IsVerified = false
		user.OTP = fmt.Sprintf("%06d", 100000+nextID*7%900000) // Mock 6 digit OTP
		users[user.ID] = user
		mutex.Unlock()

		// Call notification service
		go func(u User) {
			notifURL := os.Getenv("NOTIFICATION_SERVICE_URL")
			if notifURL == "" {
				notifURL = "http://notification-service:8084"
			}
			payload, _ := json.Marshal(map[string]string{
				"user_id": u.ID,
				"email":   u.Email,
				"subject": "NexBank Verification Code",
				"message": fmt.Sprintf("Your registration code is: %s", u.OTP),
			})
			http.Post(notifURL+"/notify", "application/json", bytes.NewBuffer(payload))
		}(user)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(user)
	})

	http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var creds struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		mutex.Lock()
		defer mutex.Unlock()
		for _, u := range users {
			if u.Username == creds.Username && u.Password == creds.Password {
				if !u.IsVerified {
					http.Error(w, "Account not verified", http.StatusForbidden)
					return
				}

				w.Header().Set("Content-Type", "application/json")
				json.NewEncoder(w).Encode(map[string]string{"token": "mock-jwt-token-123", "id": u.ID})
				return
			}
		}

		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
	})

	http.HandleFunc("/verify", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var payload struct {
			Username string `json:"username"`
			OTP      string `json:"otp"`
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		mutex.Lock()
		defer mutex.Unlock()
		for id, u := range users {
			if u.Username == payload.Username {
				if u.IsVerified {
					http.Error(w, "User already verified", http.StatusBadRequest)
					return
				}
				if u.OTP == payload.OTP {
					u.IsVerified = true
					users[id] = u
					w.Header().Set("Content-Type", "application/json")
					json.NewEncoder(w).Encode(map[string]bool{"verified": true})
					return
				}
				http.Error(w, "Invalid OTP code", http.StatusUnauthorized)
				return
			}
		}

		http.Error(w, "User not found", http.StatusNotFound)
	})

	http.HandleFunc("/users/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		id := r.URL.Path[len("/users/"):]
		mutex.Lock()
		user, exists := users[id]
		mutex.Unlock()

		if !exists {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		// mask password
		user.Password = ""

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	})

	port := "8081"
	log.Printf("User Service listening on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
