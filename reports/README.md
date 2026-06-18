# 📊 Specmatic Test Reports

This directory contains **native Specmatic reports** generated directly by the Specmatic testing framework during CI/CD runs.

## Directory Structure

```
reports/
├── README.md                          # This file
├── screenshots/                       # Test execution screenshots
│   ├── contract.svg
│   ├── positive-only.svg
│   └── resiliency.svg
├── none/                              # Contract Test Reports (3 tests)
│   ├── specmatic_report.html
│   ├── test_report.json
│   └── [diagnostic files]
├── positiveOnly/                      # Positive-Only Resiliency (42 tests)
│   ├── specmatic_report.html
│   ├── test_report.json
│   └── [diagnostic files]
└── all/                               # Full Resiliency Tests (600+ tests)
    ├── specmatic_report.html
    ├── test_report.json
    └── [diagnostic files]
```

## Report Types

- **`none/`** - Contract Tests (Validates API contracts - 3 tests)
- **`positiveOnly/`** - Positive Resiliency Tests (Happy path scenarios - 42 tests)
- **`all/`** - Full Resiliency Tests (Comprehensive edge cases - 600+ tests)

## Report Contents

Each mode directory contains native Specmatic-generated files:

- **`specmatic_report.html`** - Interactive HTML dashboard with test results, visualizations, and detailed metrics
- **`test_report.json`** - Machine-readable test data in CTRF (Common Test Report Format)
- **`specmatic_report.json`** - Native Specmatic report format
- **Additional files** - Schema files, coverage reports, and diagnostic outputs

## How Reports Are Generated

The test reports are generated automatically when running Specmatic tests via:

```bash
# Contract tests
bash scripts/run-specmatic-mode.sh none

# Positive-only resiliency tests
bash scripts/run-specmatic-mode.sh positiveOnly

# Full resiliency tests (all modes)
bash scripts/run-specmatic-mode.sh all
```

Or using npm scripts:
```bash
npm run test:contract
npm run test:resiliency:positive
npm run test:resiliency:all
npm run test:specmatic  # Runs all three
```

## Viewing Reports

1. **Open HTML Report**: Open `reports/{mode}/specmatic_report.html` in your web browser
2. **CI Artifacts**: GitHub Actions automatically uploads these reports as artifacts for each workflow run
3. **Local Development**: After running tests locally, reports are immediately available in the respective mode directories

## Report Details

Each Specmatic report includes:

- **Test Summary**: Total tests, passed, failed, skipped, and other relevant metrics
- **API Coverage**: Which API endpoints were covered by tests
- **Test Execution Timeline**: Performance metrics and test execution details
- **Failure Analysis**: Detailed information about any test failures
- **Compliance Check**: Schema compliance and compatibility checks
- **Error Details**: Stack traces and debugging information for failed tests

## Integration with CI/CD

The GitHub Actions workflow (`.github/workflows/specmatic.yml`) automatically:
1. Runs Specmatic tests in three modes (contract, positive-only resiliency, full resiliency)
2. Generates native Specmatic reports in each mode directory
3. Uploads reports as workflow artifacts for easy access
4. Can publish reports to [Specmatic Insights](https://insights.specmatic.io/) for ecosystem governance (with proper configuration)

## Screenshots

Screenshots captured from Specmatic Studio, generated HTML reports, or GitHub Actions logs are stored under `screenshots/`.

## What Changed

**Previous Approach**: Custom Python-generated HTML reports

**Current Approach**: Native Specmatic reports from the `build/reports/specmatic/` directory

**Benefits**:
- Uses official Specmatic-generated reports (more authoritative)
- Removes external Python dependency from CI pipeline  
- Better alignment with Specmatic best practices
- Improved report visualizations and metrics
- Easier integration with Specmatic Insights and other tools
- More comprehensive debugging information

## Troubleshooting

### Reports Directory is Empty

If the `reports/` directory is empty after running tests:

1. Ensure Docker is running: `docker --version`
2. Check Docker permissions: `docker run hello-world`
3. Verify Specmatic image: `docker images | grep specmatic`
4. Check test output for error messages
5. Ensure the `specmatic/schema-resiliency/examples/` directory exists

### Report Generation Fails

If Specmatic fails to generate reports:

1. Check the Specmatic Docker output for errors
2. Verify the `specmatic.yaml` configuration is valid
3. Ensure the `APP_URL` environment variable is set correctly
4. Check that the backend service is running and healthy
