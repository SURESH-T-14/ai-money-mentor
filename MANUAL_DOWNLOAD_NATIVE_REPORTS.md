# 📥 Manual Guide: Download and Organize Native Specmatic Reports

Since GitHub CLI isn't installed locally, here's how to manually download and organize the native reports.

## Step-by-Step Instructions

### Step 1: Go to Latest GitHub Actions Run

1. Open browser and go to:
   https://github.com/SURESH-T-14/ai-money-mentor/actions/runs/27699928366

2. Look for the green checkmark ✅ indicating success

### Step 2: Download All Three Artifacts

Scroll down to **Artifacts** section and download these three ZIPs:

- `specmatic-contract-report` (101 KB)
- `specmatic-positive-resiliency-report` (102 KB)
- `specmatic-full-resiliency-report` (101 KB)

**These should auto-save to your Downloads folder**

### Step 3: Extract and Organize

On your computer:

```
1. Create directory structure:
   aI-money-mentor/reports/none/
   aI-money-mentor/reports/positiveOnly/
   aI-money-mentor/reports/all/

2. Extract each ZIP:
   
   specmatic-contract-report.zip →
   Extract to: aI-money-mentor/reports/none/
   (You'll see files like specmatic_report.html, test_report.json, etc.)
   
   specmatic-positive-resiliency-report.zip →
   Extract to: aI-money-mentor/reports/positiveOnly/
   
   specmatic-full-resiliency-report.zip →
   Extract to: aI-money-mentor/reports/all/
```

### Step 4: Remove Old Custom Reports

Delete these old files from `reports/` directory:
- contract-test-report.html
- positive-only-report.html
- resiliency-report.html
- contract-test-output.txt
- positive-only-output.txt
- resiliency-output.txt

**Keep**: README.md and screenshots/ folder

### Step 5: Verify New Structure

Your `reports/` folder should now look like:

```
reports/
├── README.md
├── screenshots/
│   ├── contract.svg
│   ├── positive-only.svg
│   └── resiliency.svg
├── none/
│   ├── specmatic_report.html         ← NATIVE Specmatic report
│   ├── test_report.json              ← CTRF format data
│   ├── specmatic_report.json
│   └── [other diagnostic files]
├── positiveOnly/
│   ├── specmatic_report.html
│   ├── test_report.json
│   ├── specmatic_report.json
│   └── [other diagnostic files]
└── all/
    ├── specmatic_report.html
    ├── test_report.json
    ├── specmatic_report.json
    └── [other diagnostic files]
```

### Step 6: Verify Reports Are Native

Open one of the new `specmatic_report.html` files:

**Look for**:
- ✅ Professional dashboard layout
- ✅ Specmatic branding/styling  
- ✅ Detailed metrics and visualizations
- ✅ API coverage information
- ✅ Test execution timeline

**NOT**:
- ❌ Simple table format (that's the old custom ones)
- ❌ Plain styling with generic HTML

### Step 7: Update README for Consistency

Edit `reports/README.md` and make sure the documented structure matches your new file layout.

Should show:
- reports/none/ (Contract tests)
- reports/positiveOnly/ (Positive resiliency tests)
- reports/all/ (Full resiliency tests)

### Step 8: Commit Changes

```bash
cd "d:\aI money mentor\aI-money-mentor"

# Stage all report changes
git add reports/

# Verify what will be committed
git status

# Commit with clear message
git commit -m "fix: add native Specmatic reports from build directory

- Replace custom-generated reports with native Specmatic reports
- Organize reports in proper directory structure (none/, positiveOnly/, all/)
- Include specmatic_report.html, test_report.json, and diagnostic files
- Reports from GitHub Actions CI run #27699928366

Resolves: Saachi's requirement to include native reports from build folder
See: FIX_NATIVE_REPORTS.md for details"

# Push to GitHub
git push origin master
```

## Troubleshooting

### Artifacts Won't Download
- Try different browser (Chrome, Firefox, Edge)
- Check browser download settings
- Try incognito/private window

### Can't Find specmatic_report.html
- Make sure you extracted the ZIP files
- Check if files are directly in the ZIP or in a subfolder
- Extract to the correct directories

### Old Reports Still Showing
- Make sure you deleted the old .html and .txt files
- Only keep: README.md, screenshots/, and the new mode/ directories

### Git Won't See Changes
```bash
# Verify git status
git status

# If needed, force add
git add -A
git status

# Then commit
git commit -m "fix: add native Specmatic reports"
```

## Files to Download

**Run ID**: 27699928366  
**URL**: https://github.com/SURESH-T-14/ai-money-mentor/actions/runs/27699928366

From **Artifacts** section:
1. specmatic-contract-report
2. specmatic-positive-resiliency-report
3. specmatic-full-resiliency-report

## Expected Outcome

✅ Repository contains native Specmatic reports  
✅ Structure matches documentation (none/, positiveOnly/, all/)  
✅ README.md describes actual layout  
✅ Ready for Saachi's review  

---

**Time Required**: ~10 minutes  
**Difficulty**: Easy (drag-and-drop extraction)  
**Critical**: YES (required for assignment)

After completing these steps, let me know and we can verify everything is correct!
