# AI Money Mentor - Backend Assessment Submission

This repository contains a finance dashboard project. For this assessment, the backend in the server folder is the primary submission and is designed to satisfy the Finance Data Processing and Access Control assignment.

## Submission Scope

- Backend folder: server
- Stack: Node.js, Express, MongoDB, Mongoose, JWT
- Focus: API design, role-based access control, financial records processing, summary analytics, validation, and reliability

## Evaluation Criteria Mapping

### 1. Backend Design

Implemented with clear separation of concerns:

- Models: user, transaction, budget
- Middleware: authentication and role authorization
- Controllers: auth, users, transactions, AI advisor
- Routes: grouped by domain under api/auth, api/users, api/transactions, api/ai

### 2. Logical Thinking

Business rules and access control are explicit:

- Roles: viewer, analyst, admin
- Status: active and inactive users
- Inactive users are blocked from protected APIs
- Viewer and analyst are read-only for records and summaries
- Admin can manage users and create/update/delete transactions

### 3. Functionality

Implemented APIs include:

- Authentication: register, login, google login
- User management: profile, list users, create user, update user
- Financial records: create, list, update, delete transactions
- Filtering and pagination for transaction listing
- Dashboard summary: total income, total expenses, net balance, category totals, recent activity, monthly trends
- AI finance chat endpoint with money-topic guardrails

### 4. Code Quality

- Consistent naming and modular structure
- Dedicated middleware for auth and authorization
- Reusable validation helpers in transaction logic
- Focused controllers by domain responsibility

### 5. Database and Data Modeling

Persistence uses MongoDB with Mongoose schemas:

- User: name, email, password, role, status
- Transaction: user, amount, type, category, date, description, notes
- Budget: user, category, goal

### 6. Validation and Reliability

- Required field checks in auth/user/transaction flows
- Query and payload validation for transaction filters and updates
- Invalid IDs and invalid input handled with 400 responses
- Unauthorized and forbidden states handled with 401 and 403
- Not found handled with 404
- Server failures handled with 500

### 7. Documentation

- This root README explains architecture and assignment mapping
- Backend usage and endpoint details are in server/README.md
- Postman collection included for API walkthrough
- Seed script included for evaluator-friendly setup

### 8. Additional Thoughtfulness

Included practical evaluator features:

- Seed script to create demo users and sample data
- Postman collection with token automation and RBAC checks
- Role-based permission matrix reflected directly in route protection

## Quick Start (Backend)

1. Open terminal in server folder.
2. Install dependencies:
   npm install
3. Configure environment in server/.env:
   - MONGO_URI=<mongodb_connection_string>
   - JWT_SECRET=<jwt_secret>
   - PORT=5000
   - GOOGLE_CLIENT_ID=<optional>
   - OPENAI_API_KEY=<optional>
4. Seed demo data:
   npm run seed
5. Run server:
   npm run dev

## Demo Credentials (after seed)

- admin@finance.local / Admin@123
- analyst@finance.local / Analyst@123
- viewer@finance.local / Viewer@123

## API Testing

Import Postman collection:

- server/postman/Finance-Backend.postman_collection.json

Recommended order:

1. Login Admin
2. Login Analyst
3. Login Viewer
4. Run transactions and summary
5. Run RBAC checks

## Key Assumptions and Tradeoffs

- Assignment scope prioritized backend clarity and correctness over production hardening.
- Access control is role-based at route level and status-aware.
- Validation is implemented in controllers without a separate validation library to keep setup simple.
- Tests are not yet included; Postman collection and seed flow provide reproducible manual verification.

## Project Structure

- client: frontend app
- server: backend submission for this assignment
