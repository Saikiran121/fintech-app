# Account Service

A Python microservice built with **FastAPI** that manages bank accounts — creation, balance operations, and branch assignment — as part of the NexBank fintech platform.

## Tech Stack
- **Language**: Python 3.10+
- **Framework**: FastAPI
- **Server**: Uvicorn
- **Validation**: Pydantic v2
- **Port**: `8082`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/accounts` | Create a new account |
| `GET` | `/accounts/{user_id}` | Get all accounts for a user |
| `GET` | `/accounts/details/{account_id}` | Get account by account ID |
| `POST` | `/accounts/{account_id}/update_balance` | Deposit / withdraw funds |

### Allowed Branches
`Hyderabad` · `Bangalore` · `Pune` · `Bidar` · `Chennai`

---

## Local Development

### Prerequisites
- Python 3.10+
- `pip`

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Security Audit

Scan for known vulnerabilities in installed packages using `pip-audit`:

```bash
# Install pip-audit if not already installed
pip install pip-audit

# Run audit against requirements.txt
pip-audit -r requirements.txt
```

### 3. Lint

Use `flake8` for style checks and `pylint` for deeper static analysis:

```bash
# Install linters
pip install flake8 pylint

# Style check (PEP8)
flake8 main.py --max-line-length=120

# Static analysis
pylint main.py
```

### 4. Unit Tests

Run the test suite using `pytest`:

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run all tests
pytest tests/ -v

# Run with coverage report
pytest tests/ -v --cov=main --cov-report=term-missing
```

### 5. Run Locally

```bash
uvicorn main:app --host 0.0.0.0 --port 8082 --reload
```

The API docs will be available at: `http://localhost:8082/docs`

### 6. Build Docker Image

```bash
docker build -t account-service:latest .
```

### 7. Package (Distribution Archive)

To create a distributable `.tar.gz` package of the source:

```bash
# Install build tools
pip install build

# Create source distribution
python -m build --sdist

# Output will be in dist/
ls dist/
```

---

## Running with Docker Compose

From the monorepo root:

```bash
# Start only the account service
docker compose up account-service

# Start the full stack
docker compose up -d --build
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8082` | Port the service listens on |

---

## Project Structure

```
account-service/
├── main.py           # FastAPI application
├── requirements.txt  # Python dependencies
├── Dockerfile        # Container definition
├── Jenkinsfile       # CI/CD pipeline
└── README.md         # This file
```
