#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const mode = process.argv[2] || 'none';
const validModes = ['none', 'positiveOnly', 'all'];

if (!validModes.includes(mode)) {
  console.error(`Invalid mode: ${mode}. Use 'none', 'positiveOnly', or 'all'`);
  process.exit(1);
}

const modeLabel = {
  none: 'Contract Tests',
  positiveOnly: 'Positive Only Resiliency Tests',
  all: 'Full Resiliency Tests'
}[mode];

// Get repository root (parent of scripts directory)
const repoRoot = path.dirname(__dirname);
const workDir = path.resolve(repoRoot, 'specmatic', 'schema-resiliency', '.work', mode);
const specmaticImage = process.env.SPECMATIC_IMAGE || 'specmatic/specmatic:latest';

console.log(`Running ${modeLabel}...`);
console.log(`Mode: ${mode}`);
console.log(`Work Dir: ${workDir}`);
console.log(`Image: ${specmaticImage}`);

// Create work directory if it doesn't exist
if (!fs.existsSync(workDir)) {
  fs.mkdirSync(workDir, { recursive: true });
  console.log(`Created directory: ${workDir}`);
}

// Create examples directory
const examplesDir = path.resolve(workDir, 'examples');
if (!fs.existsSync(examplesDir)) {
  fs.mkdirSync(examplesDir, { recursive: true });
}

// Ensure necessary files exist in work directory
const openApiSrc = path.resolve(repoRoot, 'server', 'specs', 'openapi.yaml');
const openApiDest = path.resolve(workDir, 'openapi.yaml');

if (!fs.existsSync(openApiDest)) {
  if (fs.existsSync(openApiSrc)) {
    fs.copyFileSync(openApiSrc, openApiDest);
    console.log(`Copied openapi.yaml to work directory`);
  } else {
    console.warn(`Warning: openapi.yaml not found at ${openApiSrc}`);
  }
}

// Generate specmatic.yaml configuration
const specmaticYaml = `version: 3

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
        baseUrl: "\${APP_URL:http://localhost:5000}"
    data:
      examples:
        - directories:
            - ./examples

specmatic:
  settings:
    test:
      schemaResiliencyTests: ${mode}
`;

const specmaticYamlPath = path.resolve(workDir, 'specmatic.yaml');
fs.writeFileSync(specmaticYamlPath, specmaticYaml);
console.log(`Generated specmatic.yaml with mode: ${mode}`);

// Determine APP_URL based on environment
let appUrl = process.env.APP_URL;
let networkName = 'host';

if (!appUrl) {
  if (process.env.GITHUB_ACTIONS) {
    // GitHub Actions: Use service name on docker-compose network
    appUrl = 'http://aimoneymentor_server:5000';
    networkName = 'server_test_network';
    console.log('GitHub Actions detected. Using service name on docker-compose network.');
  } else if (os.platform() === 'win32') {
    // Windows: Use host.docker.internal
    appUrl = 'http://host.docker.internal:5000';
    console.log('Windows detected. Using host.docker.internal for Docker container access.');
  } else {
    // Linux/Mac: Use localhost
    appUrl = 'http://localhost:5000';
  }
}

console.log(`APP_URL: ${appUrl}`);
console.log(`Network: ${networkName}`);

try {
  // Build docker run command
  const dockerArgs = [
    'run',
    '--rm',
    '--network',
    networkName,
    '-e',
    `APP_URL=${appUrl}`,
    '-e',
    `schemaResiliencyTests=${mode}`,
    '-v',
    `${workDir}:/usr/src/app`,
    '-w',
    '/usr/src/app',
    specmaticImage,
    'test'
  ];
  
  const cmd = `docker ${dockerArgs.map(arg => arg.includes(' ') ? `"${arg}"` : arg).join(' ')}`;
  console.log(`\nExecuting Specmatic tests...\n`);
  
  execSync(cmd, { stdio: 'inherit' });
  
  console.log(`\n✅ ${modeLabel} completed successfully!`);
  process.exit(0);
} catch (error) {
  console.error(`\n❌ ${modeLabel} failed!`);
  process.exit(error.status || 1);
}
