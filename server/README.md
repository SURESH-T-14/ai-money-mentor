# Finance Data Processing and Access Control Backend

This is the Node.js/Express backend for the AI Money Mentor application. It features JWT authentication, role-based access control (RBAC), transaction management, dashboard summaries, schema validation, and MongoDB persistence.

---

## 📋 Features & Access Levels

- **viewer**: Read-only access to transactions and dashboard summary.
- **analyst**: Read-only access to transactions and dashboard summary.
- **admin**: Full permissions (manage users, perform create/update/delete operations on transactions).

User status limits:
- **active**: Fully authorized to authenticate and access endpoints.
- **inactive**: Blocked from logging in or calling secure endpoints.

---

## 🛠️ Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in this directory (`server/.env`):
```env
MONGO_URI=mongodb://localhost:27017/aimoneymentor
JWT_SECRET=your_jwt_secret_here
PORT=5000
GOOGLE_CLIENT_ID=optional-google-oauth-client-id
OPENAI_API_KEY=optional-openai-key-for-chat
```

### 3. Start the Server

#### A. Development Mode
Starts the server in development mode.
- **Mac / Linux / Windows (Bash)**:
  ```bash
  npm run dev
  ```
- **Windows (PowerShell)**:
  ```powershell
  npm run dev
  ```

#### B. Test Mode (Required for Specmatic Testing)
Sets `NODE_ENV=test` which enables database auto-seeding and mock authentication checks (bypasses JWT verification signature checks to accept the dummy JWT tokens sent by Specmatic).
- **Mac / Linux / Windows (Bash)**:
  ```bash
  NODE_ENV=test npm run dev
  ```
- **Windows (PowerShell)**:
  ```powershell
  $env:NODE_ENV="test"; npm run dev
  ```
- **Windows (cmd)**:
  ```cmd
  set NODE_ENV=test && npm run dev
  ```

---

## 🐳 Database Setup Options

MongoDB is required for persistence. Choose one of the options below:

### Option 1: Docker (Recommended for Testing & Dev Isolation)
To run MongoDB in a Docker container along with the backend server running in test mode:
```bash
# Run from repository root or server directory
docker compose -f docker-compose.test.yml up -d
```
*Access the test database at `mongodb://admin:password@localhost:27017`.*

### Option 2: Local MongoDB Service
- **Windows**: Make sure `MongoDB Server` service is running in `services.msc`.
- **Mac (Homebrew)**: `brew services start mongodb-community`.
- **Linux (systemd)**: `sudo systemctl start mongod`.

### Option 3: MongoDB Atlas Cluster
Use your MongoDB Atlas cluster URI in `.env` as `MONGO_URI`.

---

## 📊 Database Seeding (Optional)

In regular development mode, seed standard credentials and sample financial transactions with:
```bash
npm run seed
```
Demo logins:
- **admin**: `admin@finance.local` / `Admin@123`
- **analyst**: `analyst@finance.local` / `Analyst@123`
- **viewer**: `viewer@finance.local` / `Viewer@123`

*Note: In `test` mode, database seeding for Specmatic mock tests happens automatically on server start.*

---

## 🧪 Testing

Specmatic contract/resiliency tests require the server to be running in **Test Mode** (`NODE_ENV=test`). To run tests, start the server in test mode, then run:

> [!IMPORTANT]
> **State & DB Cleanliness**: Specmatic tests and mutations modify resources in the database. Running different test suites or running them in succession can cause failures due to state mismatch. **Always restart the backend server or container sandbox** (e.g. `docker compose -f docker-compose.test.yml down && docker compose -f docker-compose.test.yml up -d`) between successive runs to ensure a clean database seed from scratch.

### Windows (PowerShell)
```powershell
npm run test:contract           # Runs Contract Tests
npm run test:resiliency:positive # Runs Positive Resiliency Tests
npm run test:resiliency:all      # Runs Full Resiliency Tests
```

### Mac / Linux / Windows (Bash)
```bash
bash ../scripts/run-specmatic-mode.sh none            # Contract Tests
bash ../scripts/run-specmatic-mode.sh positiveOnly    # Positive Resiliency Tests
bash ../scripts/run-specmatic-mode.sh all             # Full Resiliency Tests
```

---

## 📁 API Endpoints

- **Auth**:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/google`
- **Users** (Admin only):
  - `GET /api/users`
  - `POST /api/users`
  - `PATCH /api/users/:id`
  - `GET /api/users/me` (All authenticated roles)
- **Transactions**:
  - `GET /api/transactions` (All authenticated roles)
  - `POST /api/transactions` (Admin only)
  - `PUT /api/transactions/:id` (Admin only)
  - `DELETE /api/transactions/:id` (Admin only)
  - `GET /api/transactions/summary` (All authenticated roles)
- **AI Chat Advisor**:
  - `POST /api/ai/chat` (All authenticated roles)
