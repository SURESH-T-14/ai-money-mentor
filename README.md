# AI Money Mentor

A comprehensive personal finance dashboard built with a **React frontend** and a **Node.js/Express backend** featuring role-based access control, transaction tracking, dashboard summaries, and AI-driven insights.

This repository includes a Docker-based **Specmatic Contract & Resiliency Testing Suite** to validate API conformance and schema robustness.

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Database Setup Options](#2-database-setup-options)
3. [Environment Configuration](#3-environment-configuration)
4. [Setting Up & Running the Application](#4-setting-up--running-the-application)
5. [Specmatic Contract & Resiliency Testing](#5-specmatic-contract--resiliency-testing)
6. [Why NODE_ENV=test is Required](#6-why-node_envtest-is-required)
7. [Command Reference Table](#7-command-reference-table)

---

## 1. Prerequisites

Before starting, ensure you have the following installed on your system:
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Docker** (Required for running Specmatic tests and recommended for the test database)
- **MongoDB** (A connection string to a local instance, Docker container, or Atlas cluster)

---

## 2. Database Setup Options

The backend requires MongoDB to persist transactions and user roles. You can use any of the three options below:

### Option A: Docker (Recommended for Tests & Isolated Dev)
If you have Docker running, you can start a pre-configured MongoDB container along with the backend server running in test mode with a single command. This completely avoids manual database installations.
```bash
docker compose -f server/docker-compose.test.yml up -d
```
*The database will be exposed on port `27017` with credentials `admin` / `password`.*

### Option B: Local MongoDB Server
If you have MongoDB Community Server installed locally on your machine, ensure the service is running:
- **Windows**: Verify that the `MongoDB Server` service is running in `services.msc` or start it via cmd:
  ```cmd
  net start MongoDB
  ```
- **Mac (Homebrew)**:
  ```bash
  brew services start mongodb-community
  ```
- **Linux (systemd)**:
  ```bash
  sudo systemctl start mongod
  ```
*Your connection string will typically be: `mongodb://localhost:27017/aimoneymentor`.*

### Option C: MongoDB Atlas (Cloud)
1. Sign up for a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free tier cluster (M0) and set up a database user and IP access whitelist (`0.0.0.0/0` for testing).
3. Copy the connection string under the **Connect** tab (e.g., `mongodb+srv://<username>:<password>@cluster0.mongodb.net/aimoneymentor`).

---

## 3. Environment Configuration

Create a file named `.env` in the `server` directory and configure the environment variables:

```env
# MongoDB Connection String (Replace with your Atlas or Local URL)
MONGO_URI=mongodb://localhost:27017/aimoneymentor

# JWT Secret Key (Any secure random string)
JWT_SECRET=your_jwt_secret_here

# Port to run the server on
PORT=5000

# Google OAuth & OpenAI Keys (Optional/Dummy values allowed for local testing)
GOOGLE_CLIENT_ID=optional-google-client-id
OPENAI_API_KEY=optional-openai-api-key
```

---

## 4. Setting Up & Running the Application

### 1. Install Dependencies

Install frontend client dependencies:
```bash
cd client
npm install
```

Install backend server dependencies:
```bash
cd ../server
npm install
```

### 2. Start the Application

You can start the backend server in either **Development Mode** (for regular UI/Postman testing) or **Test Mode** (specifically required for Specmatic testing).

#### A. Running in Development Mode
Starts the server with standard authentication checks and your local database.
- **Mac / Linux / Windows (Bash)**:
  ```bash
  npm run dev
  ```
- **Windows (PowerShell)**:
  ```powershell
  npm run dev
  ```

#### B. Running in Test Mode (Crucial for Specmatic Tests)
Sets `NODE_ENV=test` to enable auto-seeding and mock authentication.
- **Mac / Linux / Windows (Bash)**:
  ```bash
  NODE_ENV=test MONGO_URI=mongodb://localhost:27017/aimoneymentor PORT=5000 npm run dev
  ```
- **Windows (PowerShell)**:
  ```powershell
  $env:NODE_ENV="test"; $env:MONGO_URI="mongodb://localhost:27017/aimoneymentor"; $env:PORT="5000"; npm run dev
  ```
- **Windows (cmd)**:
  ```cmd
  set NODE_ENV=test && set MONGO_URI=mongodb://localhost:27017/aimoneymentor && set PORT=5000 && npm run dev
  ```

#### C. Running the Frontend
In a separate terminal, start the React client:
```bash
cd client
npm start
```
*Access the UI at `http://localhost:3000`.*

---

## 5. Specmatic Contract & Resiliency Testing

> [!IMPORTANT]
> To avoid getting `Not Implemented` failures in your Specmatic resiliency report, you **MUST** run the backend server in **Test Mode** (`NODE_ENV=test`) before launching the test suite. If the server runs in standard dev mode, it returns `401 Unauthorized` for mock JWTs, resulting in test validation failures.
>
> **Test State & Database Cleanliness**: Specmatic tests and request mutations modify, update, and delete database resources. Running different test modes in succession without resetting the database can result in failures due to state mismatch. **Always restart the backend server or container sandbox** (e.g., `docker compose -f server/docker-compose.test.yml down && docker compose -f server/docker-compose.test.yml up -d`) between test runs to ensure a clean database seed from scratch.

### Quick Start with Global CLI
You can install and use the repository's helper CLI to easily run tests from any terminal window:
```bash
# Link the CLI globally (one-time setup)
npm link

# Run tests
specmatic-test contract             # Runs Contract Tests (none mode)
specmatic-test resiliency:positive   # Runs Positive Resiliency Tests (positiveOnly mode)
specmatic-test resiliency:all        # Runs Full Resiliency Tests (all mode)
```

### Traditional Script Execution

Ensure the backend server is running in another terminal in **Test Mode**, then run the tests from the repository root:

#### Mac / Linux / Windows (Bash)
```bash
# Contract Tests
bash scripts/run-specmatic-mode.sh none

# Positive Resiliency Tests
bash scripts/run-specmatic-mode.sh positiveOnly

# Full Resiliency Tests
bash scripts/run-specmatic-mode.sh all
```

#### Windows (PowerShell)
```powershell
# Contract Tests
powershell -ExecutionPolicy Bypass -File scripts/run-specmatic-mode.ps1 none

# Positive Resiliency Tests
powershell -ExecutionPolicy Bypass -File scripts/run-specmatic-mode.ps1 positiveOnly

# Full Resiliency Tests
powershell -ExecutionPolicy Bypass -File scripts/run-specmatic-mode.ps1 all
```

---

## 6. Why `NODE_ENV=test` is Required

When executing Specmatic Contract/Resiliency tests, the tests issue requests to modify, create, and delete resources using hardcoded mock user tokens and transaction IDs (e.g. `000000000000000000000002`).

Running the server with `NODE_ENV=test` adjusts backend behavior to support this verification safely:
1. **Auto-Seeding**: The server automatically seeds the database with the mock test users and transaction IDs (defined in `server/server.js`) required by the Specmatic contract examples.
2. **Mock JWT Verification**: The authentication middleware (`server/middleware/auth.js`) detects the test environment and accepts the dummy JWT token signature `Bearer (string)` sent by Specmatic, creating a mock admin session. If the server is in development mode, this check is rejected with `401 Unauthorized`, causing the tests to fail.

---

## 7. Command Reference Table

| Task | Mac / Linux / Windows (Bash) | Windows (PowerShell) | Windows (cmd) |
| :--- | :--- | :--- | :--- |
| **Start server (Dev Mode)** | `npm run dev` | `npm run dev` | `npm run dev` |
| **Start server (Test Mode)** | `NODE_ENV=test npm run dev` | `$env:NODE_ENV="test"; npm run dev` | `set NODE_ENV=test && npm run dev` |
| **Seed database manually** | `npm run seed` | `npm run seed` | `npm run seed` |
| **Run Contract Tests** | `bash scripts/run-specmatic-mode.sh none` | `.\scripts\run-specmatic-mode.ps1 none` | `powershell -File scripts/run-specmatic-mode.ps1 none` |
| **Run Positive Resiliency** | `bash scripts/run-specmatic-mode.sh positiveOnly` | `.\scripts\run-specmatic-mode.ps1 positiveOnly` | `powershell -File scripts/run-specmatic-mode.ps1 positiveOnly` |
| **Run Full Resiliency** | `bash scripts/run-specmatic-mode.sh all` | `.\scripts\run-specmatic-mode.ps1 all` | `powershell -File scripts/run-specmatic-mode.ps1 all` |
| **Start Docker Backend** | `docker compose -f server/docker-compose.test.yml up -d` | `docker compose -f server/docker-compose.test.yml up -d` | `docker compose -f server/docker-compose.test.yml up -d` |

---
