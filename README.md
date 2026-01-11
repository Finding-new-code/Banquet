# CYNERZA Aggregator - Banquet Management System

Production-ready NestJS backend for the CYNERZA Banquet Management Aggregator platform. This system manages users, banquet owners, customer profiles, and banquet listings with a robust and modular architecture.

## 🚀 Key Features

*   **Modular Architecture**: Built with NestJS modules (Auth, Users, Owners, Banquets, Health).
*   **Database**: MongoDB integration using Mongoose ODM with specialized schemas.
*   **Authentication**: Complete JWT-based auth flow with Access/Refresh tokens and OTP verification.
*   **Security**: Rate limiting (Throttler), Helmet headers, CORS configuration, and Bcrypt hashing.
*   **Robust Configuration**: Centralized configuration with environment validation.
*   **Validation**: Global validation pipes using `class-validator` and `class-transformer`.
*   **Documentation**: Automated OpenAPI (Swagger) documentation.
*   **Health Checks**: Integrated health monitoring for database and system resources.

## 🛠 Technology Stack

*   **Framework**: [NestJS](https://nestjs.com/) (Node.js)
*   **Database**: [MongoDB](https://www.mongodb.com/)
*   **ODM**: [Mongoose](https://mongoosejs.com/)
*   **Authentication**: Passport, JWT
*   **Validation**: Joi, Class-Validator
*   **Documentation**: Swagger / OpenAPI

## 📂 Project Structure

```bash
.
├── src/
│   ├── config/         # Centralized Configuration
│   ├── domain/         # Domain Interfaces (DDD)
│   ├── infrastructure/ # Database & External Services
│   ├── modules/        # Feature Modules (Auth, Banquets, etc.)
│   ├── common/         # Shared Filters, Guards, Interceptors
│   ├── main.ts         # Application Entry Point
│   └── app.module.ts   # Root Module
├── test/               # E2E Tests
└── package.json
```

## ⚙️ Getting Started

### Prerequisites

*   **Node.js**: v16+ recommended
*   **npm** or **yarn**
*   **MongoDB**: Local instance or MongoDB Atlas connection string

### Installation

1.  Clone the repository and install dependencies:
    ```bash
    npm install
    ```

### Environment Configuration

Create a `.env` file in the root directory. You can use the following template based on the configuration schema:

```properties
# Application
NODE_ENV=development
PORT=3000
APP_NAME="CYNERZA Backend API"
APP_VERSION=1.0.0

# Database
MONGODB_URI=mongodb://localhost:27017/cynerza_db

# Security & Authentication
JWT_ACCESS_SECRET=your_strong_access_secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=your_strong_refresh_secret
JWT_REFRESH_EXPIRATION=7d
BCRYPT_ROUNDS=12

# OTP Settings
OTP_LENGTH=6
OTP_EXPIRATION=300
OTP_MAX_ATTEMPTS=3

# Rate Limiting & Throttling
LOGIN_ATTEMPT_LIMIT=5
LOGIN_ATTEMPT_WINDOW=900
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:4200
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Documentation
SWAGGER_ENABLED=true
SWAGGER_PATH=api/docs

# Health Checks
HEALTH_CHECK_ENABLED=true
DISK_THRESHOLD_PERCENT=90
MEMORY_HEAP_THRESHOLD=150MB
```

### Running the Application

```bash
# development
npm run start

# watch mode (recommended for dev)
npm run start:dev

# production mode
npm run start:prod
```

## 🧪 Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## 📚 API Documentation

When the application is running (and `SWAGGER_ENABLED=true`), you can access the interactive API documentation at:

```
http://localhost:3000/api/docs
```

## 📄 License

This project is UNLICENSED.
