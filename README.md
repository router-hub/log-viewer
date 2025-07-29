# Log Viewer App

A modern, feature-rich log viewer application built with Electron, React, and Monaco Editor. Perfect for viewing and analyzing log files with advanced highlighting and search capabilities.

## Features

### 🗂️ **Tab Management**
- Open multiple log files simultaneously
- Switch between tabs seamlessly
- Visual indicators for unsaved changes
- Close tabs individually

### 🎨 **Highlight Rules**
- Create custom highlight rules with regex support
- Color-coded highlighting for different log levels
- Case-sensitive and case-insensitive matching
- Visual color picker with preset colors
- Real-time highlighting as you type

### 🔍 **Advanced Search**
- Full-text search with regex support
- Case-sensitive and case-insensitive options
- Search results with line numbers and previews
- Click to navigate to specific lines
- Highlighted search matches

### 📝 **Monaco Editor Integration**
- Syntax highlighting for various file types
- Word wrap toggle (on/off)
- Line numbers and folding
- Professional editing experience

### 🌓 **Theme Support**
- Dark and light theme toggle
- Consistent theming across all components
- Persistent theme preference

### 💾 **File Operations**
- Open files through native file dialog
- Save files with keyboard shortcuts
- Save As functionality
- Support for various file formats (txt, log, json, xml, csv)

### 🔗 **File Associations**
- **Windows**: Right-click any log file → "Open with Log Viewer"
- **macOS**: Double-click log files to open directly
- **Linux**: File associations for common log formats
- **Command Line**: `log-viewer-app file.log` to open files

## Quick Start

### Option 1: Automated Setup (Recommended)

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd log-viewer-app
   npm run setup
   ```

2. **Start development**
   ```bash
   npm run dev
   ```

### Option 2: Manual Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd log-viewer-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the React app**
   ```bash
   npm run build
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Installation

### Option 1: Download Installer

1. **Download the latest release** for your platform:
   - Windows: `.exe` installer
   - macOS: `.dmg` file
   - Linux: `.AppImage` file

2. **Run the installer** and follow the setup wizard

3. **File associations will be automatically configured**

### Option 2: Build from Source

1. **Setup development environment**
   ```bash
   npm run setup
   ```

2. **Build for distribution**
   ```bash
   # Build for all platforms
   npm run dist
   
   # Build for specific platform
   npm run dist:win    # Windows
   npm run dist:mac    # macOS
   npm run dist:linux  # Linux
   ```

## File Associations

### Windows
After installation, the app automatically registers file associations for:
- `.log` files
- `.txt` files  
- `.json` files
- `.xml` files
- `.csv` files

**To open files:**
- Double-click any supported file
- Right-click → "Open with Log Viewer"
- Drag and drop files onto the app

### macOS
The app registers as the default handler for text files:
- `.log`, `.txt`, `.json`, `.xml`, `.csv`
- Double-click to open directly
- Right-click → "Open With" → "Log Viewer"

### Linux
Desktop integration provides:
- File associations for common log formats
- Desktop shortcut and menu integration
- Command line support: `log-viewer-app file.log`

## Development

### Available Scripts

- `npm run setup` - Automated development environment setup
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Build and start Electron app
- `npm run dist` - Build distributable packages
- `npm run dist:win` - Build Windows installer
- `npm run dist:mac` - Build macOS app
- `npm run dist:linux` - Build Linux AppImage

### Troubleshooting

**If you see "ERR_FILE_NOT_FOUND" error:**
1. Make sure you've run `npm run setup` or `npm run build`
2. Check that the `dist` folder exists
3. Try running `npm run dev` instead of `npm start`

**If Monaco Editor doesn't load:**
1. Check that all dependencies are installed: `npm install`
2. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Project Structure

```
log-viewer-app/
├── app/
│   ├── components/          # React components
│   │   ├── Editor.jsx      # Monaco Editor integration
│   │   ├── TabBar.jsx      # Tab management
│   │   ├── SearchPane.jsx  # Search functionality
│   │   ├── HighlightRuleEditor.jsx # Highlight rules
│   │   └── ToggleButtons.jsx # Theme/wrap toggles
│   ├── store/              # State management
│   │   └── useStore.js     # Zustand store
│   ├── main.js             # Electron main process
│   ├── preload.js          # Electron preload script
│   ├── App.jsx             # Main React component
│   └── main.jsx            # React entry point
├── build/                  # Build assets
│   ├── icon.svg           # App icon
│   ├── Info.plist         # macOS file associations
│   └── log-viewer.desktop # Linux desktop file
├── public/                 # Static assets
├── sample.log              # Sample log file for testing
└── package.json            # Dependencies and scripts
```

## Usage

### Opening Files
- **From App**: Click "Open" button or use File menu
- **From System**: Double-click any supported file
- **From Command Line**: `log-viewer-app file.log`
- **Drag & Drop**: Drop files onto the app window
- Supported formats: `.txt`, `.log`, `.json`, `.xml`, `.csv`

### Creating Highlight Rules
1. Click "Add Rule" in the Highlight Rules panel
2. Enter a pattern (text or regex)
3. Choose a color from presets or custom picker
4. Set case sensitivity and regex options
5. Click "Add Rule" to save

### Searching
1. Enter search term in the search box
2. Toggle "Match Case" for case-sensitive search
3. Toggle "Regex" for regex search
4. View results in the search results panel
5. Click on results to navigate to lines

### Managing Tabs
- Click tabs to switch between files
- Click "×" to close tabs
- Asterisk (*) indicates unsaved changes

### Settings
- Toggle word wrap with the "Wrap" button
- Switch themes with the theme toggle button
- Settings persist between sessions

## Command Line Usage

```bash
# Open a single file
log-viewer-app file.log

# Open multiple files
log-viewer-app file1.log file2.txt file3.json

# Open with specific options
log-viewer-app --help
```

## Technologies Used

- **Electron** - Cross-platform desktop app framework
- **React** - UI library
- **Monaco Editor** - Professional code editor
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details