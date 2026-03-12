# Notification Service

A Ruby microservice built with **Sinatra** that handles email notifications — sending OTP verification emails and generic alerts — as part of the NexBank fintech platform.

## Tech Stack
- **Language**: Ruby
- **Framework**: Sinatra
- **Server**: Puma (via Rackup)
- **Email**: Ruby `net/smtp` (Gmail SMTP with STARTTLS)
- **Port**: `8084`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/notify` | Send email or log a notification |

### POST `/notify` — Request Body

```json
{
  "user_id": "42",
  "email": "user@example.com",
  "subject": "NexBank Verification Code",
  "message": "Your OTP is: 483920"
}
```

- If `email` is present → sends a real email via Gmail SMTP
- If `email` is absent → logs a mock notification to stdout

---

## Local Development

### Prerequisites
- Ruby 3.x
- Bundler (`gem install bundler`)

### 1. Install Dependencies

```bash
bundle install
```

### 2. Configure Environment Variables

Create a `.env` file (already present, **never commit it to Git**):

```env
SMTP_USER=your-sender@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

> **Note**: Use a [Gmail App Password](https://myaccount.google.com/apppasswords) — not your regular Gmail password. 2FA must be enabled on the Gmail account.

### 3. Security Audit

Use `bundler-audit` to check for known vulnerabilities in gems:

```bash
gem install bundler-audit

# Update the advisory database
bundle-audit update

# Run audit
bundle-audit check
```

### 4. Lint

Use `rubocop` for Ruby style checks:

```bash
gem install rubocop

# Run against all Ruby files
rubocop app.rb config.ru
```

### 5. Unit Tests

Use `rspec` and `rack-test` for endpoint testing:

```bash
gem install rspec rack-test

# Run tests
rspec spec/
```

### 6. Run Locally

```bash
bundle exec rackup config.ru -p 8084
```

The service will be available at `http://localhost:8084`

### 7. Build Docker Image

```bash
docker build -t notification-service:latest .
```

### 8. Test SMTP Manually

A test script is included for quick SMTP verification:

```bash
ruby test_smtp.rb
```

---

## Running with Docker Compose

From the monorepo root:

```bash
# Start only the notification service
docker compose up notification-service

# Start the full stack
docker compose up -d --build
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SMTP_USER` | Yes | Gmail address used to send emails |
| `SMTP_PASS` | Yes | Gmail App Password |
| `SMTP_HOST` | No | SMTP server (default: `smtp.gmail.com`) |
| `SMTP_PORT` | No | SMTP port (default: `587`) |

---

## Project Structure

```
notification-service/
├── app.rb          # Sinatra application
├── config.ru       # Rack entry point
├── Gemfile         # Ruby dependencies
├── Dockerfile      # Container definition
├── .env            # SMTP secrets (gitignored)
├── test_smtp.rb    # Manual SMTP test script
└── README.md       # This file
```
