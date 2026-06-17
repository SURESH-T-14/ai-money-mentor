# 🔌 Specmatic Insights Integration Setup

**Purpose**: Centralized API test governance and ecosystem monitoring  
**Status**: Ready to configure  
**Effort**: ~15 minutes

## What is Specmatic Insights?

Specmatic Insights is a centralized platform that:

- 📊 **Aggregates test reports** from all repositories and pipelines
- 📈 **Tracks metrics over time** - see trends and improvements
- 🚪 **Enforces quality gates** - block deployments if quality drops
- 🤝 **Team collaboration** - share results across teams
- 🌐 **API ecosystem dashboard** - visualize your entire API landscape
- 📜 **Contract management** - enforce backward compatibility
- 🔍 **Coverage tracking** - measure API coverage over time

## Prerequisites

1. ✅ Specmatic account (free tier available)
2. ✅ GitHub repository with Specmatic tests (you have this!)
3. ✅ GitHub Actions workflow (you have this!)
4. ✅ Specmatic API token

## 📋 Step-by-Step Setup

### Step 1: Create Specmatic Insights Account

1. Go to: https://insights.specmatic.io/
2. Click "Sign Up" or "Get Started"
3. Create account with email/GitHub
4. Verify email
5. Create organization workspace

**Estimated Time**: 3 minutes

### Step 2: Generate API Token

1. Log into Specmatic Insights
2. Navigate to: **Settings → API Tokens**
3. Click: **Generate New Token**
4. Configure:
   - **Name**: `ai-money-mentor-ci`
   - **Scope**: `reports:publish`
   - **Expiration**: 90 days (or never)
5. **Copy and save** the token securely

**Estimated Time**: 2 minutes

### Step 3: Add Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to: **Settings → Secrets and variables → Actions**
3. Click: **New repository secret**
4. Fill in:
   - **Name**: `SPECMATIC_API_TOKEN`
   - **Value**: [Paste token from Step 2]
5. Click: **Add secret**

**Estimated Time**: 2 minutes

### Step 4: Get Workspace ID

1. In Specmatic Insights, go to: **Settings → Workspace**
2. Copy the **Workspace ID**
3. Save it for the next step

**Estimated Time**: 1 minute

### Step 5: Update GitHub Workflow

Edit `.github/workflows/specmatic.yml` and add to the end:

```yaml
  publish-to-insights:
    name: Publish Reports to Specmatic Insights
    needs: [contract-tests, positive-resiliency-tests, full-resiliency-tests]
    runs-on: ubuntu-latest
    if: success()  # Only publish if all tests passed
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Download Contract Report
        uses: actions/download-artifact@v4
        with:
          name: specmatic-contract-report
          path: reports/none
      
      - name: Download Positive Resiliency Report
        uses: actions/download-artifact@v4
        with:
          name: specmatic-positive-resiliency-report
          path: reports/positiveOnly
      
      - name: Download Full Resiliency Report
        uses: actions/download-artifact@v4
        with:
          name: specmatic-full-resiliency-report
          path: reports/all
      
      - name: Publish to Specmatic Insights
        env:
          SPECMATIC_API_TOKEN: ${{ secrets.SPECMATIC_API_TOKEN }}
          SPECMATIC_WORKSPACE_ID: [your-workspace-id]
        run: |
          docker run --rm \
            -v "${{ github.workspace }}/reports:/reports" \
            -e SPECMATIC_API_TOKEN \
            specmatic/specmatic insights publish \
              --reports-dir /reports \
              --workspace-id $SPECMATIC_WORKSPACE_ID
```

**Alternative (if Specmatic CLI not available)**:

```yaml
  publish-to-insights:
    name: Publish Reports to Specmatic Insights
    needs: [contract-tests, positive-resiliency-tests, full-resiliency-tests]
    runs-on: ubuntu-latest
    if: success()
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Download Artifacts
        uses: actions/download-artifact@v4
        with:
          path: reports
      
      - name: Publish via API
        env:
          SPECMATIC_API_TOKEN: ${{ secrets.SPECMATIC_API_TOKEN }}
        run: |
          # Upload contract report
          curl -X POST \
            -H "Authorization: Bearer $SPECMATIC_API_TOKEN" \
            -F "report=@reports/none/test_report.json" \
            https://api.specmatic.io/v1/reports/upload \
            --data "type=contract&service=ai-money-mentor"
          
          # Upload positive-only report
          curl -X POST \
            -H "Authorization: Bearer $SPECMATIC_API_TOKEN" \
            -F "report=@reports/positiveOnly/test_report.json" \
            https://api.specmatic.io/v1/reports/upload \
            --data "type=resiliency&service=ai-money-mentor&mode=positive"
          
          # Upload full report
          curl -X POST \
            -H "Authorization: Bearer $SPECMATIC_API_TOKEN" \
            -F "report=@reports/all/test_report.json" \
            https://api.specmatic.io/v1/reports/upload \
            --data "type=resiliency&service=ai-money-mentor&mode=full"
```

**Estimated Time**: 5 minutes

### Step 6: Commit and Push

```bash
git add .github/workflows/specmatic.yml
git commit -m "feat: add Specmatic Insights publishing to CI pipeline"
git push origin master
```

This will trigger the workflow. Watch it run and publish your first reports!

**Estimated Time**: 2 minutes

## 🎯 Verify Setup

### In GitHub Actions

1. Go to: https://github.com/SURESH-T-14/ai-money-mentor/actions
2. Watch for the new `publish-to-insights` job
3. Verify it completes successfully (green ✅)

### In Specmatic Insights

1. Log into: https://insights.specmatic.io/
2. Navigate to: **Dashboard**
3. You should see:
   - API test results
   - Coverage metrics
   - Historical trends
   - Test timelines

## 📊 What You'll See in Specmatic Insights

### Dashboard Overview
```
┌─────────────────────────────────┐
│  API Test Metrics               │
├─────────────────────────────────┤
│  Tests Executed:  645           │
│  Success Rate:    100%          │
│  Coverage:        87%           │
│  Avg Duration:    2.4s          │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Service: ai-money-mentor       │
│  Last Run: 2 min ago           │
│  Status: ✅ All Passing        │
│  Contracts: 3 (3 matching)     │
│  Resiliency: 642 (all passing) │
└─────────────────────────────────┘
```

### Key Metrics Available

| Metric | Value | Trend |
|--------|-------|-------|
| Total Tests | 645 | ↑ (added full resiliency) |
| Pass Rate | 100% | → (stable) |
| API Coverage | 87% | ↑ (improving) |
| Avg Response Time | 2.4s | → (stable) |
| Contracts Matched | 3/3 | ✅ (100%) |
| Breaking Changes | 0 | ✅ (0) |

## 🔐 Security Best Practices

### API Token Security

- ✅ **Store only in GitHub Secrets** - never commit to code
- ✅ **Rotate tokens periodically** - every 90 days recommended
- ✅ **Use minimal scope** - `reports:publish` only
- ✅ **Monitor token usage** - check Specmatic dashboard
- ✅ **Revoke immediately** if compromised

### Workflow Security

- ✅ **Only publish on main branch** - use `if: github.ref == 'refs/heads/master'`
- ✅ **Only after successful tests** - use `needs: [...]` and `if: success()`
- ✅ **Verify API endpoint** - use HTTPS only
- ✅ **Audit publishing** - check Specmatic Insights logs

## 📈 Leveraging Specmatic Insights

### Quality Gates

```yaml
- name: Check Quality Gate
  env:
    SPECMATIC_API_TOKEN: ${{ secrets.SPECMATIC_API_TOKEN }}
  run: |
    # Fail if pass rate drops below 95%
    docker run --rm \
      specmatic/specmatic insights check \
        --min-pass-rate 95 \
        --workspace-id ${{ env.SPECMATIC_WORKSPACE_ID }}
```

### Trend Reporting

1. Set up **scheduled reports** to stakeholders
2. **Track improvement** over time
3. **Celebrate milestones** (e.g., 100% pass rate for 30 days)
4. **Identify regressions** early

### Governance

1. **Team accountability** - see who made changes
2. **Service ownership** - assign teams to APIs
3. **SLA tracking** - monitor compliance
4. **Risk assessment** - identify untested endpoints

## 🆘 Troubleshooting

### Token Not Working

**Error**: `401 Unauthorized`

**Solution**:
1. Verify token in GitHub Secrets: Settings → Secrets
2. Verify token not expired (check Specmatic dashboard)
3. Regenerate token if needed
4. Ensure `${{ secrets.SPECMATIC_API_TOKEN }}` is in workflow

### Workflow Fails to Publish

**Error**: `HTTP 400 Bad Request`

**Solution**:
1. Verify reports directory structure
2. Check JSON format: `jq . reports/*/test_report.json`
3. Ensure CTRF format compliance
4. Check Specmatic Insights workspace ID

### Can't Find Workspace ID

**Solution**:
1. Log into Specmatic Insights
2. Go to Settings → Workspace
3. Copy ID from display
4. Or check Insights dashboard URL: `https://insights.specmatic.io/w/{workspace-id}`

## 📚 Resources

- **Specmatic Insights Docs**: https://docs.specmatic.io/insights
- **CTRF Format**: https://ctrf.io/
- **GitHub Secrets**: https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions
- **API Token Management**: https://docs.specmatic.io/api/authentication

## ✅ Completion Checklist

- [ ] Created Specmatic Insights account
- [ ] Generated API token
- [ ] Added `SPECMATIC_API_TOKEN` to GitHub Secrets
- [ ] Found workspace ID
- [ ] Updated `.github/workflows/specmatic.yml`
- [ ] Committed and pushed changes
- [ ] Verified workflow ran successfully
- [ ] Checked reports in Specmatic Insights dashboard
- [ ] Set up quality gates (optional)
- [ ] Shared dashboard with team (optional)

## 🎉 You're Done!

Your API tests are now published to Specmatic Insights! 

**Next Steps**:
- 👥 Invite team members to workspace
- 📊 Set up quality gates
- 📈 Track metrics over time
- 🔗 Integrate with deployment process

---

**Setup Time**: ~15 minutes  
**Maintenance**: Minimal (automatic publishing via CI)  
**ROI**: High (centralized governance, quality tracking, team alignment)
