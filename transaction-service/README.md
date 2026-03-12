# Transaction Service

A Node.js microservice built with **Express** that handles financial transfers between accounts as part of the NexBank fintech platform.

## Tech Stack
- **Language**: Node.js
- **Framework**: Express
- **HTTP Client**: Axios
- **Port**: `8083`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/transactions/transfer` | Transfer funds between accounts |
| `GET` | `/transactions/:account_id` | Get transaction history for an account |

### POST `/transactions/transfer` — Request Body

```json
{
  "from_account_id": "12345678901",
  "to_account_id": "09876543210",
  "amount": 100.0,
  "user_id": "user123"
}
```

---

## Local Development

### Prerequisites
- Node.js 18+
- `npm`

### 1. Install Dependencies

```bash
npm install
```

### 2. Security Audit

Check for vulnerabilities in dependencies using `npm audit`:

```bash
npm audit
```

### 3. Lint

Use `eslint` for code quality:

```bash
npm run lint
```

### 4. Unit Tests

Run the test suite using `jest`:

```bash
npm test
```

### 5. Run Locally

```bash
npm start
```

The service will be available at `http://localhost:8083`

---

## Running with Docker Compose

From the monorepo root:

```bash
# Start only the transaction service
docker compose up transaction-service

# Start the full stack
docker compose up -d --build
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8083` | Port the service listens on |
| `ACCOUNT_SERVICE_URL` | `http://account-service:8082` | URL of the account service |
| `NOTIFICATION_SERVICE_URL` | `http://notification-service:8084` | URL of the notification service |

---

## Project Structure

```
transaction-service/
├── index.js          # Express application
├── package.json      # Node.js dependencies
├── Dockerfile        # Container definition
├── tests/            # Unit tests
└── README.md         # This file
```
