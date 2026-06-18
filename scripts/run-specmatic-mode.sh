#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-none}"

case "$MODE" in
  none)
    MODE_LABEL="Contract Tests"
    EXPECTED_TESTS="3"
    EXPECTED_SUCCESSES="3"
    REPORT_FILE_NAME="contract-test-report.html"
    OUTPUT_FILE_NAME="contract-test-output.txt"
    ;;
  positiveOnly)
    MODE_LABEL="Positive Only Resiliency Tests"
    EXPECTED_TESTS="42"
    EXPECTED_SUCCESSES="42"
    REPORT_FILE_NAME="positive-only-report.html"
    OUTPUT_FILE_NAME="positive-only-output.txt"
    ;;
  all)
    MODE_LABEL="Full Resiliency Tests"
    EXPECTED_TESTS="600"
    EXPECTED_SUCCESSES="600"
    REPORT_FILE_NAME="resiliency-report.html"
    OUTPUT_FILE_NAME="resiliency-output.txt"
    ;;
  *)
    echo "Unsupported Specmatic mode: $MODE" >&2
    echo "Usage: $0 none|positiveOnly|all" >&2
    exit 2
    ;;
esac

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SPEC_DIR="$ROOT_DIR/specmatic/schema-resiliency"
WORK_DIR="$SPEC_DIR/.work/$MODE"
BUILD_DIR="$WORK_DIR/build"
REPORT_DIR="$ROOT_DIR/reports"
SPECMATIC_REPORT_DIR="$BUILD_DIR/reports/specmatic"
SPECMATIC_IMAGE="${SPECMATIC_IMAGE:-specmatic/specmatic:latest}"

# Create report directory for backwards compatibility
mkdir -p "$REPORT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required to run Specmatic tests, but the docker command was not found." >&2
  exit 127
fi

mkdir -p "$WORK_DIR/examples" "$REPORT_DIR"
rm -f "$WORK_DIR/examples"/*.json
cp "$SPEC_DIR/examples/"*.json "$WORK_DIR/examples/"

cat > "$WORK_DIR/specmatic.yaml" <<YAML
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
            \$ref: "#/components/sources/labsContracts"
          specs:
            - openapi/schema-resiliency/simple-openapi-spec.yaml
    runOptions:
      openapi:
        type: test
        baseUrl: "\${APP_URL:http://localhost:8080}"
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
                \$ref: "#/components/sources/labsContracts"
              specs:
                - openapi/schema-resiliency/simple-openapi-spec.yaml
        runOptions:
          openapi:
            type: mock
            baseUrl: "\${APP_URL:http://localhost:8080}"

specmatic:
  settings:
    test:
      schemaResiliencyTests: $MODE
    mock:
      generative: true
YAML

LICENSE_ARGS=()
if [ -n "${SPECMATIC_LICENSE_FILE:-}" ]; then
  if [ ! -f "$SPECMATIC_LICENSE_FILE" ]; then
    echo "SPECMATIC_LICENSE_FILE points to a missing file: $SPECMATIC_LICENSE_FILE" >&2
    exit 2
  fi

  LICENSE_ARGS=(-v "$SPECMATIC_LICENSE_FILE:/specmatic/specmatic-license.txt:ro")
  cat >> "$WORK_DIR/specmatic.yaml" <<'YAML'
  license:
    path: /specmatic/specmatic-license.txt
YAML
fi

echo "Running $MODE_LABEL with schemaResiliencyTests: $MODE"
echo "Specmatic image: $SPECMATIC_IMAGE"

# Set default APP_URL for local development if not already set
if [ -z "${APP_URL:-}" ]; then
  APP_URL="http://localhost:5000"
  echo "APP_URL not set, using default: $APP_URL"
fi

# Create the build directory to capture Specmatic output
mkdir -p "$BUILD_DIR"

set +e
docker run --rm \
  --network host \
  -e APP_URL="$APP_URL" \
  -v "$WORK_DIR:/usr/src/app" \
  "${LICENSE_ARGS[@]}" \
  -w /usr/src/app \
  "$SPECMATIC_IMAGE" test 2>&1
DOCKER_STATUS=$?
set -e

echo ""
echo "Docker exit status: $DOCKER_STATUS"

# Copy Specmatic native reports to reports directory
if [ -d "$SPECMATIC_REPORT_DIR" ]; then
  echo "Copying Specmatic native reports from $SPECMATIC_REPORT_DIR"
  
  # Create a unique subdirectory for this test mode's reports
  MODE_REPORT_DIR="$REPORT_DIR/$MODE"
  mkdir -p "$MODE_REPORT_DIR"
  
  # Copy all reports
  cp -r "$SPECMATIC_REPORT_DIR"/* "$MODE_REPORT_DIR/" 2>/dev/null || true
  
  echo "Reports available at: $MODE_REPORT_DIR"
  ls -la "$MODE_REPORT_DIR" 2>/dev/null || true
else
  echo "Warning: Specmatic reports not found at $SPECMATIC_REPORT_DIR"
  echo "Expected reports directory was not created by Specmatic"
fi

exit $DOCKER_STATUS
