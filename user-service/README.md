# User Service

A Go microservice that manages user registration, verification (via OTP), and authentication for the NexBank fintech platform.

## Tech Stack
- **Language**: Go 1.21+
- **HTTP Library**: Standard `net/http`
- **Port**: `8081`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/register` | Register a new user (initializes OTP) |
| `POST` | `/verify` | Verify account using 6-digit OTP |
| `POST` | `/login` | Authenticate user (requires verification) |
| `GET` | `/users/{id}` | Get user profile (masked password) |

---

## Local Development

### Prerequisites
- Go 1.21 or higher

### 1. Install Dependencies

This service uses Go modules and has zero external dependencies (std library only).

```bash
go mod tidy
```

### 2. Security Audit

Use `govulncheck` to scan for known vulnerabilities:

```bash
# Install tool if missing
go install golang.org/x/vuln/cmd/govulncheck@latest

# Run scan
govulncheck ./...
```

### 3. Lint

Use `staticcheck` for Go linting:

```bash
go install honnef.co/go/tools/cmd/staticcheck@latest
staticcheck ./...
```

### 4. Unit Tests

```bash
go test -v ./...
```

### 5. Run Locally

```bash
go run main.go
```

The service will be available at `http://localhost:8081`

---

## Running with Docker Compose

From the monorepo root:

```bash
# Start only the user service
docker compose up user-service

# Start the full stack
docker compose up -d --build
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NOTIFICATION_SERVICE_URL` | `http://notification-service:8084` | URL for sending OTP emails |

---

## Project Structure

```
user-service/
├── main.go          # Main application logic
├── main_test.go     # Unit tests
├── go.mod           # Go module definition
├── Dockerfile       # Container definition
└── README.md        # This file
```
