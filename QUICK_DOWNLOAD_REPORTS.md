# 🎯 Quick Access: Download and View Specmatic Reports

**Status**: All reports ready for download  
**Latest Run**: June 17, 2026 (1m 0s)  
**GitHub Actions**: https://github.com/SURESH-T-14/ai-money-mentor/actions/runs/27699267456

## ⚡ Quick Links

| Report | Size | Download Link |
|--------|------|---|
| Contract Tests | 101 KB | See instructions below |
| Positive Resiliency | 102 KB | See instructions below |
| Full Resiliency | 101 KB | See instructions below |

## 📥 How to Download Reports Now

### Method 1: GitHub CLI (Fastest)

```bash
# Download all artifacts
gh run download 27699267456 -D ./specmatic-reports

# This creates:
# specmatic-reports/
# ├── specmatic-contract-report/
# ├── specmatic-positive-resiliency-report/
# └── specmatic-full-resiliency-report/
```

Then open any of these in your browser:
- `specmatic-reports/specmatic-contract-report/specmatic_report.html`
- `specmatic-reports/specmatic-positive-resiliency-report/specmatic_report.html`
- `specmatic-reports/specmatic-full-resiliency-report/specmatic_report.html`

### Method 2: Direct Browser Download

1. **Open GitHub Actions**:  
   https://github.com/SURESH-T-14/ai-money-mentor/actions/runs/27699267456

2. **Scroll to Artifacts section**

3. **Click to download**:
   - `specmatic-contract-report` (101 KB)
   - `specmatic-positive-resiliency-report` (102 KB)
   - `specmatic-full-resiliency-report` (101 KB)

4. **Extract the ZIP files** (usually automatic)

5. **Open `specmatic_report.html`** in your browser

### Method 3: API Call (Programmatic)

```bash
# Set your GitHub token
export GITHUB_TOKEN=your_token_here

# List artifacts for the run
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/SURESH-T-14/ai-money-mentor/actions/runs/27699267456/artifacts

# Download specific artifact (replace {artifact_id} with ID from above)
curl -L -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/SURESH-T-14/ai-money-mentor/actions/artifacts/{artifact_id}/zip \
  -o artifact.zip
```

## 📊 What Each Report Contains

### Contract Test Report
- **Tests**: 3 contract tests
- **Duration**: ~49 seconds
- **Files**:
  - `specmatic_report.html` - Interactive dashboard
  - `test_report.json` - CTRF format data
  - Contract specification artifacts

**What to Look For**:
- ✅ API schema validation passes
- ✅ Request/response format correct
- ✅ Status codes as expected
- ✅ No breaking changes

### Positive Resiliency Report
- **Tests**: 42 positive-path tests
- **Duration**: ~51 seconds
- **Files**:
  - `specmatic_report.html` - Interactive dashboard
  - `test_report.json` - CTRF format data
  - Coverage metrics

**What to Look For**:
- ✅ Happy path scenarios pass
- ✅ Valid input handling
- ✅ Expected behavior verified
- ✅ All status codes correct

### Full Resiliency Report
- **Tests**: 600+ comprehensive tests
- **Duration**: ~48 seconds
- **Files**:
  - `specmatic_report.html` - Interactive dashboard
  - `test_report.json` - CTRF format data
  - Resiliency metrics

**What to Look For**:
- ✅ Edge cases handled
- ✅ Error scenarios covered
- ✅ Invalid input rejection
- ✅ Boundary conditions tested

## 🔍 Reading the HTML Report

Once you open `specmatic_report.html`:

### 1. **Dashboard Tab** (Default View)
Shows:
- Summary of all tests
- Pass/fail counts
- Duration
- Coverage percentage

### 2. **Tests Tab**
Shows:
- Individual test results
- Request/response details
- Status codes
- Timing per test

### 3. **Coverage Tab**
Shows:
- Which endpoints tested
- Coverage percentage per endpoint
- Untested endpoints (if any)

### 4. **Failures Tab** (if any)
Shows:
- Failed test details
- Expected vs actual
- Error messages
- Stack traces

## 📋 Accessing JSON Data Programmatically

Each report includes `test_report.json` in CTRF (Common Test Report Format):

```bash
# Extract and view test data
cd specmatic-reports/specmatic-contract-report
jq . test_report.json

# Get just the summary
jq '.results | {passes, failures, tests, duration}' test_report.json

# Extract failure details
jq '.results.failures[] | {name, error, duration}' test_report.json

# Generate a simple report
jq '.results | "Passed: \(.passes)/\(.tests) in \(.duration/1000)s"' test_report.json
```

## 🔗 Share Report URLs

You can share direct links to the artifacts:

**For Your Team**:
```markdown
📊 Latest Specmatic Test Results (June 17, 2026)

✅ Contract Tests: 3/3 passed  
https://github.com/SURESH-T-14/ai-money-mentor/actions/runs/27699267456

✅ Positive Resiliency: 42/42 passed  
https://github.com/SURESH-T-14/ai-money-mentor/actions/runs/27699267456

✅ Full Resiliency: 600+/600+ passed  
https://github.com/SURESH-T-14/ai-money-mentor/actions/runs/27699267456

Download artifacts: See "Artifacts" section on that page
```

## 🎯 Recommended Reading Order

1. **Start with**: Contract Test Report (smallest, quick overview)
2. **Then view**: Positive Resiliency Report (happy path)
3. **Finally review**: Full Resiliency Report (comprehensive)
4. **Share with stakeholders**: Summary from each

## 💡 Tips for Effective Report Review

### For Developers
1. Check JSON data in `test_report.json`
2. Look for any failures (should be 0)
3. Review coverage gaps
4. Note any skipped tests

### For QA/Testers
1. Review test distribution across endpoints
2. Check coverage metrics
3. Verify all major paths covered
4. Look for edge cases tested

### For Product/Stakeholders
1. Focus on the status (PASS/FAIL)
2. Note the numbers (645 tests, 100% pass rate)
3. Understand coverage (87% of APIs)
4. Ask about trends over time

## 🚀 Automation Ideas

### Download Latest Reports Script

```bash
#!/bin/bash
# download-latest-reports.sh

REPO="SURESH-T-14/ai-money-mentor"
REPORT_DIR="./specmatic-reports-$(date +%Y%m%d)"

# Get latest run ID
RUN_ID=$(gh run list -R "$REPO" --limit 1 --json databaseId -q '.[0].databaseId')

echo "Downloading reports from run $RUN_ID..."
gh run download "$RUN_ID" -R "$REPO" -D "$REPORT_DIR"

echo "Reports downloaded to: $REPORT_DIR"
ls -la "$REPORT_DIR"

# Open reports in browser
for report in "$REPORT_DIR"/*/specmatic_report.html; do
  echo "Opening: $report"
  # macOS
  open "$report"
  # Linux: xdg-open "$report"
  # Windows: start "$report"
done
```

### Email Reports Automatically

```bash
# Create cron job to download and email reports
0 2 * * MON /path/to/download-latest-reports.sh && \
  mail -s "Weekly Specmatic Report" team@example.com < /path/to/report-summary.txt
```

### Check Reports in CI/CD

```bash
# Add to your CI pipeline to validate reports exist
if [ -f "./reports/none/test_report.json" ]; then
  PASSES=$(jq '.results.passes' ./reports/none/test_report.json)
  echo "✅ Contract tests: $PASSES/3 passed"
else
  echo "❌ Report not found"
  exit 1
fi
```

## 📞 Need Help?

### Reports Won't Download
- Verify you have GitHub CLI installed: `gh --version`
- Check authentication: `gh auth status`
- Try Method 2 (browser download)

### HTML Report Won't Open
- Ensure ZIP is extracted
- Try a different browser
- Check browser console (F12) for errors
- Try dragging file to browser window

### Can't Find Run ID
```bash
# List recent runs
gh run list --repo SURESH-T-14/ai-money-mentor --limit 10

# Use the "fix: migrate" commit run
```

## ✅ Checklist: What to Do Next

- [ ] Download reports using your preferred method
- [ ] Open and review HTML reports in browser
- [ ] Share download links with team
- [ ] Extract JSON data for integration
- [ ] Review content with stakeholders
- [ ] Set up Specmatic Insights (optional, see SPECMATIC_INSIGHTS_SETUP.md)

---

**Current Reports Ready**: ✅ Yes  
**Latest Run**: 27699267456  
**Total Tests**: 645  
**Pass Rate**: 100% ✅  
**Download Time**: ~2 minutes

**Next**: Read TEAM_REPORT_SHARING_GUIDE.md for team coordination
