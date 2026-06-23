# AI Money Mentor

**A standalone personal finance dashboard application with Spec Driven Development & Contract Testing**

AI Money Mentor is a personal finance dashboard application with a React frontend and a Node.js/Express backend.

It helps users track transactions, review spending and income trends, and get finance-focused AI guidance.

---

## 🎯 About This Project

This project demonstrates **Spec Driven Development (SDD)** using:
- **OpenAPI 3.0** specification (`server/specs/openapi.yaml`)
- **Specmatic** contract testing framework for automated API validation
- **Comprehensive test coverage** with positive and resiliency scenarios
- **CI/CD integration** with GitHub Actions for continuous testing

**Status**: ✅ **All Tests Passing** - 100% contract compliance achieved!

---

## Features

- User authentication (email/password and Google login)
- Role-based access control (viewer, analyst, admin)
- User status support (active and inactive)
- Transaction management (create, read, update, delete)
- Transaction filtering and pagination
- Dashboard summary analytics:
  - total income
  - total expenses
  - net balance
  - category totals
  - recent activity
  - monthly trends
- AI money mentor chat endpoint with finance-topic guardrails
- Seed script for demo users and sample data
- Postman collection for quick API testing

## Tech Stack

Frontend:
- React
- Axios
- Recharts

Backend:
- Node.js
- Express
- MongoDB
- Mongoose
- JWT

## Project Structure

- client: React frontend
- server: Node.js/Express backend

## Prerequisites

- Node.js 18+
- npm
- MongoDB connection string

## Setup

1. Clone repository and open project root.
2. Install frontend dependencies:

```bash
cd client
npm install
```

3. Install backend dependencies:

```bash
cd ../server
npm install
```

4. Create server environment file at server/.env:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
GOOGLE_CLIENT_ID=optional
OPENAI_API_KEY=optional
```

## Run the App

Run backend:

```bash
cd server
npm run dev
```

Run frontend (new terminal):

```bash
cd client
npm start
```

Default URLs:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Demo Data

Seed sample data:

```bash
cd server
npm run seed
```

Demo users:
- admin@finance.local / Admin@123
- analyst@finance.local / Analyst@123
- viewer@finance.local / Viewer@123

## API Overview

Base URL: http://localhost:5000/api

Auth:
- POST /auth/register
- POST /auth/login
- POST /auth/google

Users:
- GET /users/me
- GET /users (admin)
- POST /users (admin)
- PATCH /users/:id (admin)

Transactions:
- GET /transactions
- POST /transactions (admin)
- PUT /transactions/:id (admin)
- DELETE /transactions/:id (admin)
- GET /transactions/summary

AI:
- POST /ai/chat

## Postman Collection

Import file:
- server/postman/Finance-Backend.postman_collection.json

## Contract Testing & Specification

This project uses **Specmatic** for automated contract testing:

### OpenAPI Specification

The API is fully defined in `server/specs/openapi.yaml` and serves as the source of truth for all operations.

### Run Contract Tests

```bash
cd server
npm run test:contract     # Test against provided examples
npm run test:resiliency   # Full resiliency testing
```

### Test Results

All tests pass with 100% compliance:
- ✅ Contract Tests: 135 scenarios
- ✅ Positive Resiliency Tests: 1,803+ scenarios
- ✅ Full Resiliency Tests: 1,803+ scenarios (negative + edge cases)

**Key Achievement**: API validates all constraints (minLength, maxLength, enum values, formats) exactly as specified.

## Notes

- Frontend API base URL is currently hardcoded in client/src/utils/api.js to http://localhost:5000/api.
- For deployment, update that file to use your deployed backend URL.

## License

This project is for learning and portfolio use.
