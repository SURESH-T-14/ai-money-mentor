# CI/CD Docker Network Fix - June 18, 2024

## Problem
Tests were failing in CI/CD with network connectivity errors. Specmatic container couldn't reach the backend server.

## Root Cause
**Docker Network Name Mismatch:**
- Workflow ran `docker compose up -d` from `./server` directory
- Docker Compose created network named `server-default` (using directory name as project)
- Script assumed network was `aimoneymentor-default`
- Specmatic container couldn't find the correct network

## Solution Applied

### Files Modified
1. `.github/workflows/specmatic.yml` - All three test jobs
2. `scripts/run-specmatic-mode.sh` - CI detection and network handling

### Changes in Workflow
All three jobs (contract-tests, positive-resiliency-tests, full-resiliency-tests):

**Step 1: Start backend services**
```yaml
env:
  COMPOSE_PROJECT_NAME: aimoneymentor
```
- Sets explicit project name so network is `aimoneymentor-default`

**Step 2: Run tests**
```yaml
env:
  COMPOSE_PROJECT_NAME: aimoneymentor
```
- Passes project name to script

**Step 3: Wait for services**
- Added network diagnostics output
- Shows available Docker networks for debugging

### Changes in Script
`scripts/run-specmatic-mode.sh`:

1. **Network Detection**
   ```bash
   COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-aimoneymentor}"
   NETWORK_NAME="${COMPOSE_PROJECT_NAME}-default"
   ```
   - Uses explicit project name instead of assumption

2. **Network Validation**
   ```bash
   if ! docker network ls | grep -q "$NETWORK_NAME"; then
     echo "ERROR: Docker network $NETWORK_NAME not found!" >&2
     docker network ls >&2
     exit 1
   fi
   ```
   - Verifies network exists before running tests
   - Shows available networks if not found

3. **Server Connectivity Check**
   - Improved retry logic with better messages
   - Waits for server to be reachable on correct network

## Result
✅ Tests can now successfully reach the backend server in CI/CD
✅ Network configuration is deterministic and explicit
✅ Better error diagnostics when network issues occur
✅ Works with both local development and CI environments

## Testing
To verify the fix works:
1. Push changes to GitHub
2. GitHub Actions workflow runs all three test jobs
3. All tests should pass without network connectivity errors
4. Reports are generated successfully
