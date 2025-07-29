const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Log Viewer development environment...\n');

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully!\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed\n');
}

// Check if dist directory exists, if not build it
if (!fs.existsSync('dist')) {
  console.log('🔨 Building React app...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ React app built successfully!\n');
  } catch (error) {
    console.error('❌ Failed to build React app:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ React app already built\n');
}

console.log('🎉 Development environment is ready!');
console.log('\n📋 Available commands:');
console.log('  npm run dev     - Start development server with hot reload');
console.log('  npm start       - Build and start Electron app');
console.log('  npm run dist    - Build distributable packages');
console.log('\n🚀 You can now run: npm run dev');