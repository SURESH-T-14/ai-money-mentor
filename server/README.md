# Finance Data Processing and Access Control Backend

This backend implements a finance dashboard API with role-based access control, transaction management, dashboard summaries, validation, and MongoDB persistence.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication

## Roles and Access

- viewer: read-only access to transactions and dashboard summary
- analyst: read-only access to transactions and dashboard summary
- admin: full access (manage users + create/update/delete transactions)

User status:

- active: can authenticate and access APIs
- inactive: blocked from login and protected APIs

## Setup

1. Install dependencies:
   - `npm install`
2. Create `.env` in `server` folder:
   - `MONGO_URI=<your_mongodb_uri>`
   - `JWT_SECRET=<your_jwt_secret>`
   - `PORT=5000` (optional)
   - `GOOGLE_CLIENT_ID=<optional>`
   - `OPENAI_API_KEY=<optional for AI endpoint>`
3. Start server:
   - `npm run dev`

## Seed Demo Data

Run:

- `npm run seed`

This creates demo users and sample financial data for the admin user.

Demo credentials:

- admin: `admin@finance.local` / `Admin@123`
- analyst: `analyst@finance.local` / `Analyst@123`
- viewer: `viewer@finance.local` / `Viewer@123`

## Postman Collection

Import this file:

- `postman/Finance-Backend.postman_collection.json`

Recommended execution flow in Postman:

1. Login Admin (stores `token` automatically)
2. Login Analyst and Login Viewer (stores role tokens)
3. Run Users and Transactions folder requests
4. Run RBAC Checks folder to verify role restrictions

## API Overview

Base URL: `/api`

### Auth

- `POST /auth/register`
  - body: `{ name, email, password }`
- `POST /auth/login`
  - body: `{ email, password }`
- `POST /auth/google`
  - body: `{ credential }`

### Users

- `GET /users/me`
  - any authenticated user
- `GET /users`
  - admin only
- `POST /users`
  - admin only
  - body: `{ name, email, password, role?, status? }`
- `PATCH /users/:id`
  - admin only
  - body supports: `{ name?, role?, status?, password? }`

### Transactions

- `GET /transactions`
  - roles: viewer, analyst, admin
  - query params:
    - `type=income|expense`
    - `category=<category>`
    - `startDate=<ISO date>`
    - `endDate=<ISO date>`
    - `minAmount=<number>`
    - `maxAmount=<number>`
    - `page=<number>` (default 1)
    - `limit=<number>` (default 20, max 100)
- `POST /transactions`
  - admin only
  - body: `{ amount, type?, category, date?, description?, notes? }`
  - `type` defaults to `expense`
- `PUT /transactions/:id`
  - admin only
  - partial update supported
- `DELETE /transactions/:id`
  - admin only

### Dashboard Summary

- `GET /transactions/summary`
  - roles: viewer, analyst, admin
  - returns:
    - `totalIncome`
    - `totalExpenses`
    - `netBalance`
    - `categoryTotals`
    - `recentActivity` (latest 5)
    - `monthlyTrends`

## Access Control Mechanism

- JWT verification middleware authenticates user from `x-auth-token` header
- Active user check is enforced at middleware level
- Role authorization middleware (`authorize`) restricts endpoints by allowed roles

## Validation and Errors

- Basic request validation is implemented in controllers
- Invalid input returns `400`
- Unauthorized/forbidden returns `401/403`
- Missing resources return `404`
- Server errors return `500`

## Persistence

- MongoDB is used for persistent data storage via Mongoose models
- Models: `User`, `Transaction`, `Budget`

## Assumptions

- Existing frontend compatibility is preserved where possible
- Transaction `type` defaults to `expense` when omitted
- Analysts are read-only users with access to insights/summary
