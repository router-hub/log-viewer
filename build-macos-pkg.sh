#!/bin/bash

echo "🚀 Building Log Viewer macOS Package Installer..."

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script must be run on macOS"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build React app
echo "🔨 Building React app..."
npm run build

# Build macOS package
echo "🍎 Building macOS package installer..."
npm run dist:mac

# Check if the package was created
if [ -f "dist-electron/Log Viewer-1.0.0.pkg" ]; then
    echo "✅ Package created successfully!"
    echo "📦 Package location: dist-electron/Log Viewer-1.0.0.pkg"
    echo ""
    echo "📋 To install:"
    echo "   Double-click the .pkg file or run:"
    echo "   sudo installer -pkg 'dist-electron/Log Viewer-1.0.0.pkg' -target /"
    echo ""
    echo "🎉 After installation, you can:"
    echo "   - Right-click on .log, .txt, .json, .xml, .csv files"
    echo "   - Select 'Open With' → 'Log Viewer'"
    echo "   - Or drag files onto the Log Viewer app"
else
    echo "❌ Package creation failed"
    echo "📁 Check dist-electron/ directory for build artifacts"
    exit 1
fi