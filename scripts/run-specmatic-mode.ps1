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
    $FilterArgs = @("--filter", "STATUS='200,201'")
  }
  "positiveOnly" {
    $ModeLabel = "Positive Only Resiliency Tests"
    $ExpectedTests = 42
    $ExpectedSuccesses = 42
    $ReportFileName = "positive-only-report.html"
    $OutputFileName = "positive-only-output.txt"
    $FilterArgs = @("--filter", "STATUS='200,201'")
  }
  "all" {
    $ModeLabel = "Full Resiliency Tests"
    $ExpectedTests = 600
    $ExpectedSuccesses = 600
    $ReportFileName = "resiliency-report.html"
    $OutputFileName = "resiliency-output.txt"
    $FilterArgs = @("--filter", "STATUS='200,201,400'")
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
    aiMoneyMentor:
      filesystem:
        directory: .

systemUnderTest:
  service:
    definitions:
      - definition:
          source:
            `$ref: "#/components/sources/aiMoneyMentor"
          specs:
            - openapi.yaml
    runOptions:
      openapi:
        type: test
        baseUrl: "`${APP_URL:http://localhost:5000}"
    data:
      examples:
        - directories:
            - ./examples

specmatic:
  settings:
    test:
      schemaResiliencyTests: $Mode
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

# Copy the AI Money Mentor OpenAPI spec into the work directory
$ServerSpecsPath = Join-Path $RootDir "server/specs/openapi.yaml"
if (Test-Path $ServerSpecsPath) {
  Copy-Item -Path $ServerSpecsPath -Destination (Join-Path $WorkDir "openapi.yaml") -Force
  Write-Output "Copied AI Money Mentor OpenAPI spec to work directory"
} else {
  [Console]::Error.WriteLine("ERROR: AI Money Mentor OpenAPI spec not found at: $ServerSpecsPath")
  exit 1
}

Write-Output "Running $ModeLabel with schemaResiliencyTests: $Mode"
Write-Output "Specmatic image: $SpecmaticImage"

# Set default APP_URL for local development if not already set
if (-not $env:APP_URL) {
  # On Windows with Docker Desktop, containers need to use host.docker.internal to reach the host
  # On other systems (Linux/Mac or CI), use localhost
  if ($env:GITHUB_ACTIONS) {
    # CI environment will use server service name on docker-compose network
    $env:APP_URL = "http://server:5000"
  } elseif ($env:OS -eq "Windows_NT") {
    # Windows: use host.docker.internal for Docker container access
    $env:APP_URL = "http://host.docker.internal:5000"
    Write-Output "Windows detected (OS=$env:OS). Using host.docker.internal for Docker container access"
  } else {
    # Linux/Mac: use localhost
    $env:APP_URL = "http://localhost:5000"
  }
  Write-Output "APP_URL not set, using default: $env:APP_URL"
}

# Create the build directory to capture Specmatic output
New-Item -ItemType Directory -Force -Path $BuildDir | Out-Null

# Check if we're in a CI environment (GitHub Actions)
$UseNetworkName = "host"
if ($env:GITHUB_ACTIONS) {
  # In CI, get the docker-compose network name and run Specmatic on the same network
  # The server service is accessible by name instead of localhost
  $UseNetworkName = "aimoneymentor-default"  # Default docker-compose network name
  $env:APP_URL = "http://server:5000"  # Use service name instead of localhost on CI
  Write-Output "CI environment detected (GitHub Actions). Using network: $UseNetworkName, APP_URL: $($env:APP_URL)"
  
  # Wait for server service to be reachable from container
  $null = & docker run --rm --network $UseNetworkName `
    --entrypoint sh `
    $SpecmaticImage -c "for i in 1 2 3 4 5; do wget -q -O /dev/null http://server:5000/ && exit 0; sleep 2; done; echo 'Server not reachable'; exit 1" 2>&1
}

$DockerArgs = @(
  "run",
  "--rm",
  "--network",
  $UseNetworkName,
  "-e",
  "APP_URL=$($env:APP_URL)",
  "-v",
  "$($WorkDir):/usr/src/app"
) + $LicenseArgs + @(
  "-w",
  "/usr/src/app",
  $SpecmaticImage,
  "test"
) + $FilterArgs

$Output = & docker @DockerArgs 2>&1
$DockerStatus = $LASTEXITCODE

# Output the Docker/Specmatic results
Write-Output $Output

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
