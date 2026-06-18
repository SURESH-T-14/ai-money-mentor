# AI Money Mentor

## 1. Project Overview

AI Money Mentor is a personal finance dashboard with a React frontend and a Node.js/Express backend. It supports authentication, role-based access control, transaction tracking, dashboard summaries, and an AI money mentor chat endpoint.

This repository also includes a Specmatic Docker-based contract testing setup. The Specmatic suite demonstrates contract tests and schema resiliency tests in three modes: `none`, `positiveOnly`, and `all`.

Specmatic is not installed as an npm package in this project. Use the official Docker image instead:

```bash
docker run --rm specmatic/specmatic --version
```

If the assignment requires Specmatic Enterprise, use:

```bash
docker run --rm specmatic/enterprise --version
```

## 2. Setup Instructions

Prerequisites:

- Node.js 18+
- npm
- MongoDB or a MongoDB connection string
- Docker for Specmatic tests

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd ../server
npm install
```

Create `server/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
GOOGLE_CLIENT_ID=optional
OPENAI_API_KEY=optional
```

Run the backend:

```bash
cd server
npm run dev
```

Run the frontend in another terminal:

```bash
cd client
npm start
```

Default URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## 3. Contract Testing

### Quick Start: Global CLI (Recommended)

Run tests from **anywhere** on your system:

```bash
# Install the global CLI (one-time setup)
npm link

# Then run tests from any directory
specmatic-test contract
specmatic-test resiliency:positive
specmatic-test resiliency:all
specmatic-test resiliency
```

See [GLOBAL_CLI_USAGE.md](GLOBAL_CLI_USAGE.md) for detailed documentation.

### Traditional Method

Contract testing runs with `schemaResiliencyTests: none`. This validates only the contract examples.

From the repository root:

```bash
bash scripts/run-specmatic-mode.sh none
```

On Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run-specmatic-mode.ps1 none
```

Or from the backend folder:

```bash
cd server
npm run test:contract
```

Expected passing summary:

```text
Tests run: 3, Successes: 3, Failures: 0, WIP: 0, Errors: 0
```

Generated report:

- `reports/contract-test-report.html`

## 4. Schema Resiliency Testing

Positive-only resiliency testing runs with `schemaResiliencyTests: positiveOnly`. It generates valid input variations from the schema.

```bash
bash scripts/run-specmatic-mode.sh positiveOnly
```

On Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run-specmatic-mode.ps1 positiveOnly
```

Expected passing summary:

```text
Tests run: 42, Successes: 42, Failures: 0, WIP: 0, Errors: 0
```

Generated report:

- `reports/positive-only-report.html`

Full resiliency testing runs with `schemaResiliencyTests: all`. It generates valid and invalid combinations to exercise error handling and edge cases.

```bash
bash scripts/run-specmatic-mode.sh all
```

On Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run-specmatic-mode.ps1 all
```

Expected passing summary:

```text
Tests run: 600, Successes: 600, Failures: 0
```

Generated report:

- `reports/resiliency-report.html`

## 5. Test Results

| Test mode | `schemaResiliencyTests` | Expected tests | Expected successes | Expected failures | Report |
| --- | --- | ---: | ---: | ---: | --- |
| Contract Tests | `none` | 3 | 3 | 0 | `reports/contract-test-report.html` |
| Positive Only Resiliency Tests | `positiveOnly` | 42 | 42 | 0 | `reports/positive-only-report.html` |
| Full Resiliency Tests | `all` | 600 | 600 | 0 | `reports/resiliency-report.html` |

The runner also writes raw console output beside each HTML report:

- `reports/contract-test-output.txt`
- `reports/positive-only-output.txt`
- `reports/resiliency-output.txt`

## 6. Screenshots

Screenshots for submission evidence should be stored in:

- `reports/screenshots/`

Recommended screenshot evidence:

- Contract run showing `Tests run: 3` and `Successes: 3`
- Positive-only resiliency run showing `Tests run: 42` and `Successes: 42`
- Full resiliency run showing `Tests run: 600` and `Successes: 600`

The generated HTML reports are the primary report artifacts. Screenshots can be captured from the reports, Specmatic Studio, or GitHub Actions logs.

## 7. CI/CD Pipeline

Specmatic tests run in GitHub Actions through:

- `.github/workflows/specmatic.yml`

The workflow has separate jobs for:

- Contract Tests
- Positive Resiliency Tests
- Full Resiliency Tests

Each job:

- Checks out the repository
- Verifies the Specmatic Docker image
- Runs the correct `schemaResiliencyTests` mode
- Uploads the generated report and console output as GitHub Actions artifacts

If Specmatic Enterprise is required, configure the workflow image and add the Enterprise license text as a `SPECMATIC_LICENSE` GitHub secret.

## 8. Learnings

### Contract Testing

- Verifies API behavior matches the OpenAPI specification.
- Detects breaking API changes early.

### Schema Resiliency Testing

- Tests how APIs react to invalid requests.
- Ensures proper HTTP error handling.
- Validates robustness against malformed input.

### Positive Only Mode

- Generates valid input variations.
- Improves test coverage.

### All Mode

- Generates valid and invalid combinations.
- Reveals edge cases and schema weaknesses.

### Key Observation

- Test count increased from 3 to 42 to 600.
- More schema permutations produce greater confidence in API reliability.

## 9. Repository Structure

```text
.
|-- .github/workflows/specmatic.yml
|-- client/
|-- reports/
|   |-- README.md
|   `-- screenshots/
|-- scripts/
|   |-- run-specmatic-mode.ps1
|   `-- run-specmatic-mode.sh
|-- server/
|   |-- package.json
|   |-- specmatic.yaml
|   `-- specs/openapi.yaml
`-- specmatic/
    `-- schema-resiliency/
        |-- README.md
        `-- examples/
```
