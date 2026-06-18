#!/usr/bin/env node

/**
 * Specmatic Test CLI
 * Run Specmatic tests from anywhere on your system
 * 
 * Usage:
 *   specmatic-test [contract|resiliency:positive|resiliency:all|resiliency]
 * 
 * Examples:
 *   specmatic-test contract              # Run contract tests
 *   specmatic-test resiliency:positive   # Run positive resiliency tests
 *   specmatic-test resiliency:all        # Run all resiliency tests
 *   specmatic-test resiliency            # Run all three test suites
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the project root directory (parent of bin/)
const projectRoot = path.resolve(__dirname, '..');
const serverDir = path.join(projectRoot, 'server');
const packageJsonPath = path.join(serverDir, 'package.json');

// Validate project structure
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: Could not find server/package.json');
  console.error(`   Expected at: ${packageJsonPath}`);
  console.error('   Make sure you run this from the ai-money-mentor directory');
  process.exit(1);
}

// Parse command line arguments
const testMode = process.argv[2] || 'contract';

// Map user-friendly names to npm scripts
const scriptMap = {
  'contract': 'test:contract',
  'resiliency': 'test:specmatic',
  'resiliency:positive': 'test:resiliency:positive',
  'resiliency:all': 'test:resiliency:all',
};

const npmScript = scriptMap[testMode];

if (!npmScript) {
  console.error(`❌ Unknown test mode: "${testMode}"`);
  console.error('\nAvailable modes:');
  console.error('  contract              - Run contract tests (default)');
  console.error('  resiliency:positive   - Run positive resiliency tests');
  console.error('  resiliency:all        - Run full resiliency tests');
  console.error('  resiliency            - Run all resiliency tests');
  process.exit(1);
}

try {
  console.log(`\n📝 Running Specmatic ${testMode} tests from: ${projectRoot}\n`);
  
  // Change to server directory and run the npm script
  // Use process.chdir for better cross-platform compatibility
  const originalDir = process.cwd();
  process.chdir(serverDir);
  
  try {
    execSync(`npm run ${npmScript}`, {
      stdio: 'inherit',
      shell: process.platform === 'win32' ? 'powershell' : '/bin/bash',
    });
  } finally {
    process.chdir(originalDir);
  }
  
  console.log(`\n✅ Tests completed successfully!\n`);
} catch (error) {
  console.error(`\n❌ Tests failed with exit code ${error.status}\n`);
  process.exit(error.status || 1);
}
