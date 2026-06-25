# Quick Start: Running Specmatic Contract & Resiliency Tests

This guide helps you run tests locally in under 5 minutes.

---

## 🚀 Step 1: Start the Backend in Test Mode

For Specmatic tests to pass, the server **MUST** run with `NODE_ENV=test` so it can auto-seed required test resources and accept mock tokens.

Select the command corresponding to your operating system and shell:

### A. Mac & Linux (Bash / Zsh)
```bash
cd server
NODE_ENV=test MONGO_URI=mongodb://localhost:27017/aimoneymentor PORT=5000 npm run dev
```

### B. Windows (PowerShell)
```powershell
cd server
$env:NODE_ENV="test"
$env:MONGO_URI="mongodb://localhost:27017/aimoneymentor"
$env:PORT="5000"
npm run dev
```

### C. Windows (cmd)
```cmd
cd server
set NODE_ENV=test
set MONGO_URI=mongodb://localhost:27017/aimoneymentor
set PORT=5000
npm run dev
```

*The server will be running on `http://localhost:5000` with auto-seeding enabled.*

---

## 🧪 Step 2: Run the Specmatic Tests

Open a separate terminal window and execute the desired test suite from the repository root:

### A. Mac & Linux (Bash)
```bash
# Contract Tests (none mode)
bash scripts/run-specmatic-mode.sh none

# Positive Resiliency Tests (positiveOnly mode)
bash scripts/run-specmatic-mode.sh positiveOnly

# Full Resiliency Tests (all mode)
bash scripts/run-specmatic-mode.sh all
```

### B. Windows (PowerShell)
```powershell
# Contract Tests (none mode)
powershell -ExecutionPolicy Bypass -File scripts/run-specmatic-mode.ps1 none

# Positive Resiliency Tests (positiveOnly mode)
powershell -ExecutionPolicy Bypass -File scripts/run-specmatic-mode.ps1 positiveOnly

# Full Resiliency Tests (all mode)
powershell -ExecutionPolicy Bypass -File scripts/run-specmatic-mode.ps1 all
```

---

## 🐳 Docker Alternative (Fully Isolated Sandbox)

If you do not want to install Node/MongoDB locally, you can run both the database container and the backend container pre-configured in test mode via Docker Compose:

```bash
# Run from repository root or server directory
docker compose -f server/docker-compose.test.yml up -d
```
*This starts the server on `http://localhost:5000` and MongoDB container in the background. You can then run any of the Specmatic tests from Step 2.*

To stop the containers:
```bash
docker compose -f server/docker-compose.test.yml down
```

---

## 🔍 Troubleshooting: 36 Failures / Not Implemented Remarks

If you see `Not Implemented` remarks or failures for transaction update/delete requests under your Specmatic resiliency reports:
1. **Root Cause**: The backend server is not running in test mode (`NODE_ENV=test`) or was started without MongoDB. Consequently, authorization checks fail, returning `401 Unauthorized` responses which Specmatic marks as failures.
2. **Resolution**: Terminate your active backend server and restart it using the exact commands in **Step 1** above (setting `NODE_ENV=test`). If using Docker, use the command under the **Docker Alternative** section.
