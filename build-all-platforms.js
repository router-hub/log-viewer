const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building Log Viewer for all platforms...\n');

// Check if we're on Windows
const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const isLinux = process.platform === 'linux';

console.log(`📍 Current platform: ${process.platform}`);

// Create distribution directory
const distDir = 'distribution';
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir);

// Build React app first
console.log('📦 Building React app...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ React app built successfully!\n');
} catch (error) {
  console.error('❌ Failed to build React app:', error.message);
  process.exit(1);
}

// Build for Windows
console.log('🪟 Building for Windows...');
try {
  execSync('npm run dist:win', { stdio: 'inherit' });
  
  // Copy Windows executable
  const winSource = 'dist-electron/win-unpacked';
  const winDest = path.join(distDir, 'windows');
  if (fs.existsSync(winSource)) {
    fs.cpSync(winSource, winDest, { recursive: true });
    console.log('✅ Windows build completed!');
  }
} catch (error) {
  console.error('❌ Windows build failed:', error.message);
}

// Build for macOS (only if on macOS)
if (isMac) {
  console.log('🍎 Building for macOS...');
  try {
    execSync('npm run dist:mac', { stdio: 'inherit' });
    
    // Copy macOS app
    const macSource = 'dist-electron/mac';
    const macDest = path.join(distDir, 'macos');
    if (fs.existsSync(macSource)) {
      fs.cpSync(macSource, macDest, { recursive: true });
      console.log('✅ macOS build completed!');
    }
  } catch (error) {
    console.error('❌ macOS build failed:', error.message);
  }
} else {
  console.log('🍎 Skipping macOS build (requires macOS system)');
  console.log('   💡 To build for macOS:');
  console.log('   - Use GitHub Actions (see .github/workflows/build.yml)');
  console.log('   - Use a Mac or cloud Mac service');
  console.log('   - See build-macos-manual.md for detailed instructions');
}

// Build for Linux
console.log('🐧 Building for Linux...');
try {
  execSync('npm run dist:linux', { stdio: 'inherit' });
  
  // Copy Linux app
  const linuxSource = 'dist-electron/linux-unpacked';
  const linuxDest = path.join(distDir, 'linux');
  if (fs.existsSync(linuxSource)) {
    fs.cpSync(linuxSource, linuxDest, { recursive: true });
    console.log('✅ Linux build completed!');
  }
} catch (error) {
  console.error('❌ Linux build failed:', error.message);
}

// Create README for distribution
const readmeContent = `# Log Viewer - Distribution Package

This package contains the Log Viewer application for different platforms.

## 📁 Contents

- **windows/**: Windows executable (Log Viewer.exe)
${isMac ? '- **macos/**: macOS application bundle' : '- **macos/**: Not available (requires macOS build)'}
- **linux/**: Linux executable

## 🚀 How to Run

### Windows
1. Navigate to the \`windows\` folder
2. Double-click \`Log Viewer.exe\`

${isMac ? `### macOS
1. Navigate to the \`macos\` folder
2. Double-click the \`Log Viewer.app\` bundle
3. If you get a security warning, right-click and select "Open"` : `### macOS
**Not available in this build**
To get macOS version:
- Use GitHub Actions (see .github/workflows/build.yml)
- Build on a Mac system
- See build-macos-manual.md for instructions`}

### Linux
1. Navigate to the \`linux\` folder
2. Run: \`./Log Viewer\`
3. Or double-click the executable if your file manager supports it

## ✨ Features

- **File Operations**: Open, Save, Save As with keyboard shortcuts
- **Multiple Tabs**: Work with multiple files simultaneously
- **Search & Highlight**: Find text and navigate to specific lines
- **Custom Highlighting**: Create custom syntax highlighting rules
- **Dark/Light Theme**: Toggle between themes
- **Word Wrap**: Toggle text wrapping
- **File Associations**: Right-click files to open with Log Viewer

## ⌨️ Keyboard Shortcuts

- **Ctrl+N**: New Tab
- **Ctrl+S**: Save
- **Ctrl+Shift+S**: Save As
- **Ctrl+O**: Open File

## 📝 Supported File Types

- .log, .txt, .json, .xml, .csv

## 🔧 System Requirements

- **Windows**: Windows 10 or later
- **macOS**: macOS 10.14 or later
- **Linux**: Most modern distributions

## 📞 Support

If you encounter any issues, please check that your system meets the requirements above.
`;

fs.writeFileSync(path.join(distDir, 'README.md'), readmeContent);

console.log('\n🎉 Build completed!');
console.log(`📁 Distribution package created in: ${distDir}`);
console.log('\n📋 Distribution contents:');
console.log('  📂 windows/ - Windows executable');
if (isMac) {
  console.log('  📂 macos/ - macOS application');
} else {
  console.log('  📂 macos/ - Not available (requires macOS build)');
}
console.log('  📂 linux/ - Linux executable');
console.log('  📄 README.md - Instructions');

console.log('\n💡 To share with others:');
console.log('  1. Zip the entire "distribution" folder');
console.log('  2. Share the zip file');
console.log('  3. Recipients can extract and run the appropriate version for their platform');

if (!isMac) {
  console.log('\n🍎 For macOS builds:');
  console.log('  - Push to GitHub and use GitHub Actions');
  console.log('  - Use a Mac or cloud Mac service');
  console.log('  - See build-macos-manual.md for detailed instructions');
}