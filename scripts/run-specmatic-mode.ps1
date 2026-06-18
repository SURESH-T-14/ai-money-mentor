param(
  [ValidateSet("none", "positiveOnly", "all")]
  [string]$Mode = "none"
)

$ErrorActionPreference = "Stop"

switch ($Mode) {
  "none" {
    $ModeLabel = "Contract Tests"
    $ExpectedTests = 3
    $ExpectedSuccesses = 3
    $ReportFileName = "contract-test-report.html"
    $OutputFileName = "contract-test-output.txt"
  }
  "positiveOnly" {
    $ModeLabel = "Positive Only Resiliency Tests"
    $ExpectedTests = 42
    $ExpectedSuccesses = 42
    $ReportFileName = "positive-only-report.html"
    $OutputFileName = "positive-only-output.txt"
  }
  "all" {
    $ModeLabel = "Full Resiliency Tests"
    $ExpectedTests = 600
    $ExpectedSuccesses = 600
    $ReportFileName = "resiliency-report.html"
    $OutputFileName = "resiliency-output.txt"
  }
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = (Resolve-Path (Join-Path $ScriptDir "..")).Path
$SpecDir = Join-Path $RootDir "specmatic/schema-resiliency"
$WorkDir = Join-Path $SpecDir ".work/$Mode"
$ExamplesWorkDir = Join-Path $WorkDir "examples"
$BuildDir = Join-Path $WorkDir "build"
$ReportDir = Join-Path $RootDir "reports"
$SpecmaticReportDir = Join-Path $BuildDir "reports/specmatic"
$SpecmaticImage = if ($env:SPECMATIC_IMAGE) { $env:SPECMATIC_IMAGE } else { "specmatic/specmatic:latest" }

# Create report directory for backwards compatibility
New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  [Console]::Error.WriteLine("Docker is required to run Specmatic tests, but the docker command was not found.")
  exit 127
}

New-Item -ItemType Directory -Force -Path $ExamplesWorkDir, $ReportDir | Out-Null
Get-ChildItem -Path $ExamplesWorkDir -Filter "*.json" -ErrorAction SilentlyContinue | Remove-Item -Force
Copy-Item -Path (Join-Path $SpecDir "examples/*.json") -Destination $ExamplesWorkDir -Force

$SpecmaticYaml = @"
version: 3

components:
  sources:
    labsContracts:
      git:
        url: https://github.com/specmatic/labs-contracts.git
        branch: main

systemUnderTest:
  service:
    definitions:
      - definition:
          source:
            `$ref: "#/components/sources/labsContracts"
          specs:
            - openapi/schema-resiliency/simple-openapi-spec.yaml
    runOptions:
      openapi:
        type: test
        baseUrl: "`${APP_URL:http://localhost:8080}"
        filter: "PATH!='/health,/monitor/{id},/swagger' && TAGS!='WIP' && STATUS!='202,429'"
    data:
      examples:
        - directories:
            - ./examples

dependencies:
  services:
    - service:
        definitions:
          - definition:
              source:
                `$ref: "#/components/sources/labsContracts"
              specs:
                - openapi/schema-resiliency/simple-openapi-spec.yaml
        runOptions:
          openapi:
            type: mock
            baseUrl: "`${APP_URL:http://localhost:8080}"

specmatic:
  settings:
    test:
      schemaResiliencyTests: $Mode
    mock:
      generative: true
"@

$LicenseArgs = @()
if ($env:SPECMATIC_LICENSE_FILE) {
  if (-not (Test-Path $env:SPECMATIC_LICENSE_FILE)) {
    [Console]::Error.WriteLine("SPECMATIC_LICENSE_FILE points to a missing file: $env:SPECMATIC_LICENSE_FILE")
    exit 2
  }

  $LicenseArgs = @("-v", "$($env:SPECMATIC_LICENSE_FILE):/specmatic/specmatic-license.txt:ro")
  $SpecmaticYaml += @"

  license:
    path: /specmatic/specmatic-license.txt
"@
}

Set-Content -Path (Join-Path $WorkDir "specmatic.yaml") -Value $SpecmaticYaml -Encoding UTF8

Write-Output "Running $ModeLabel with schemaResiliencyTests: $Mode"
Write-Output "Specmatic image: $SpecmaticImage"

# Set default APP_URL for local development if not already set
if (-not $env:APP_URL) {
  $env:APP_URL = "http://localhost:5000"
  Write-Output "APP_URL not set, using default: $env:APP_URL"
}

# Create the build directory to capture Specmatic output
New-Item -ItemType Directory -Force -Path $BuildDir | Out-Null

$DockerArgs = @(
  "run",
  "--rm",
  "--network",
  "host",
  "-e",
  "APP_URL=$($env:APP_URL)",
  "-v",
  "$($WorkDir):/usr/src/app"
) + $LicenseArgs + @(
  "-w",
  "/usr/src/app",
  $SpecmaticImage,
  "test"
)

$Output = & docker @DockerArgs 2>&1
$DockerStatus = $LASTEXITCODE

Write-Output ""
Write-Output "Docker exit status: $DockerStatus"

# Copy Specmatic native reports to reports directory
if (Test-Path $SpecmaticReportDir) {
  Write-Output "Copying Specmatic native reports from $SpecmaticReportDir"
  
  # Create a unique subdirectory for this test mode's reports
  $ModeReportDir = Join-Path $ReportDir $Mode
  New-Item -ItemType Directory -Force -Path $ModeReportDir | Out-Null
  
  # Copy all reports
  Get-ChildItem -Path $SpecmaticReportDir -Recurse | ForEach-Object {
    $RelativePath = $_.FullName -replace [regex]::Escape($SpecmaticReportDir)
    $DestPath = Join-Path $ModeReportDir $RelativePath
    
    if ($_.PSIsContainer) {
      New-Item -ItemType Directory -Force -Path $DestPath | Out-Null
    } else {
      New-Item -ItemType Directory -Force -Path (Split-Path $DestPath) | Out-Null
      Copy-Item -Path $_.FullName -Destination $DestPath -Force
    }
  }
  
  Write-Output "Reports available at: $ModeReportDir"
  Get-ChildItem -Path $ModeReportDir -Recurse | Write-Output
} else {
  Write-Output "Warning: Specmatic reports not found at $SpecmaticReportDir"
  Write-Output "Expected reports directory was not created by Specmatic"
}

exit $DockerStatus
