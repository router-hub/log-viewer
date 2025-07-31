# LogFocus

A modern, feature-rich log viewer application built with Electron, React, and Monaco Editor. Perfect for viewing and analyzing log files with advanced highlighting and search capabilities.

## Features

- **Advanced Log Highlighting**: Customizable color-coded highlighting for different log levels and patterns
- **Real-time Search**: Fast search with regex support and case-sensitive options
- **Global Search**: Search across multiple files simultaneously
- **Tab Management**: Open multiple log files in tabs
- **Context Menu**: Right-click to create highlight rules from selected text
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **File Associations**: Open log files directly from your system
- **Cross-platform**: Works on Windows, macOS, and Linux

## Download

### Windows
- **MSI Installer**: [LogFocus 1.0.0.msi](dist-electron/LogFocus%201.0.0.msi) (83MB)
- Download and run the installer
- Right-click any log file → "Open with LogFocus"

### macOS
- Coming soon...

### Linux
- Coming soon...

## Installation

### Windows
1. Download the MSI installer above
2. Run the installer
3. Right-click any log file → "Open with LogFocus"

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Build for distribution
npm run dist:msi    # Windows MSI
npm run dist:mac    # macOS
npm run dist:linux  # Linux
```

## Usage

1. **Open Files**: Use File → Open or drag files onto the application
2. **Create Highlight Rules**: 
   - Use the Rules panel to add custom highlighting
   - Right-click selected text to create rules
3. **Search**: Use Ctrl+F for local search, Ctrl+Shift+F for global search
4. **Navigate**: Use the search results to jump to specific lines

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.