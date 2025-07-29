const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Packaging Log Viewer Application...\n');

// Ensure the React app is built
console.log('📦 Building React app...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ React app built successfully!\n');
} catch (error) {
  console.error('❌ Failed to build React app:', error.message);
  process.exit(1);
}

// Create output directory
const outputDir = 'dist-app';
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true });
}
fs.mkdirSync(outputDir);

// Copy necessary files
console.log('📁 Copying application files...');

// Copy app directory
if (fs.existsSync('app')) {
  fs.cpSync('app', path.join(outputDir, 'app'), { recursive: true });
}

// Copy dist directory
if (fs.existsSync('dist')) {
  fs.cpSync('dist', path.join(outputDir, 'dist'), { recursive: true });
}

// Copy package.json
fs.copyFileSync('package.json', path.join(outputDir, 'package.json'));

// Create a simple launcher script for Windows
const launcherScript = `@echo off
echo Starting Log Viewer...
cd /d "%~dp0"
node_modules\\.bin\\electron . --no-sandbox
pause
`;

fs.writeFileSync(path.join(outputDir, 'start-log-viewer.bat'), launcherScript);

// Create a simple launcher script for Unix systems
const unixLauncherScript = `#!/bin/bash
echo "Starting Log Viewer..."
cd "\$(dirname "\$0")"
./node_modules/.bin/electron . --no-sandbox
`;

fs.writeFileSync(path.join(outputDir, 'start-log-viewer.sh'), unixLauncherScript);

console.log('✅ Application packaged successfully!');
console.log(`📁 Output directory: ${outputDir}`);
console.log('\n📋 To run the application:');
console.log('  Windows: Double-click start-log-viewer.bat');
console.log('  Mac/Linux: ./start-log-viewer.sh');
console.log('\n💡 Note: You need to run "npm install" in the output directory first');