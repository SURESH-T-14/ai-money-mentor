#!/bin/bash

set -e

MODE="${1:-none}"

case "$MODE" in
  "none")
    MODE_LABEL="Contract Tests"
    ;;
  "positiveOnly")
    MODE_LABEL="Positive Only Resiliency Tests"
    ;;
  "all")
    MODE_LABEL="Full Resiliency Tests"
    ;;
  *)
    echo "Invalid mode: $MODE. Use 'none', 'positiveOnly', or 'all'"
    exit 1
    ;;
esac

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SPEC_DIR="$ROOT_DIR/specmatic/schema-resiliency"
WORK_DIR="$SPEC_DIR/.work/$MODE"
EXAMPLES_WORK_DIR="$WORK_DIR/examples"
BUILD_DIR="$WORK_DIR/build"
REPORT_DIR="$ROOT_DIR/reports"
SPECMATIC_REPORT_DIR="$BUILD_DIR/reports/specmatic"
SPECMATIC_IMAGE="${SPECMATIC_IMAGE:-specmatic/specmatic:latest}"
APP_URL="${APP_URL:-http://localhost:5000}"

echo "Running $MODE_LABEL..."
echo "APP_URL: $APP_URL"
echo "SPECMATIC_IMAGE: $SPECMATIC_IMAGE"

# Create directories
mkdir -p "$EXAMPLES_WORK_DIR" "$REPORT_DIR"

# Copy examples
if [ -d "$SPEC_DIR/examples" ]; then
  cp "$SPEC_DIR/examples"/*.json "$EXAMPLES_WORK_DIR/" 2>/dev/null || true
fi

# Create specmatic.yaml
cat > "$WORK_DIR/specmatic.yaml" << 'EOF'
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
            $ref: "#/components/sources/aiMoneyMentor"
          specs:
            - openapi.yaml
    runOptions:
      openapi:
        type: test
        baseUrl: "${APP_URL}"
    data:
      examples:
        - directories:
            - ./examples

specmatic:
  generative:
    schemaResiliencyTests: ${MODE}
  auth:
    bearerToken:
      tokenFieldPath: user.id
EOF

# Copy openapi.yaml
if [ -f "$SPEC_DIR/openapi.yaml" ]; then
  cp "$SPEC_DIR/openapi.yaml" "$WORK_DIR/"
fi

# Run Specmatic in Docker
cd "$WORK_DIR"

docker run \
  --rm \
  -v "$(pwd):/usr/src/app" \
  -e "APP_URL=$APP_URL" \
  "$SPECMATIC_IMAGE" \
  test -c docker-compose.test.yml --testBaseURL "$APP_URL"

# Copy reports back
if [ -d "$SPECMATIC_REPORT_DIR" ]; then
  cp -r "$SPECMATIC_REPORT_DIR" "$REPORT_DIR/" 2>/dev/null || true
fi

echo "$MODE_LABEL completed successfully!"
