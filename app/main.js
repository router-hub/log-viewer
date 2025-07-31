const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  const iconPath = path.join(__dirname, '../build/icon.png');
  console.log('🔍 Loading icon from:', iconPath);
  console.log('🔍 Icon file exists:', require('fs').existsSync(iconPath));
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'LogFocus',
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from the built files
    const indexPath = path.join(__dirname, '../dist/index.html');
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      // Fallback to development server if built files don't exist
      console.log('Built files not found, trying development server...');
      mainWindow.loadURL('http://localhost:5173');
    }
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-tab');
          }
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'Text Files', extensions: ['txt', 'log', 'json', 'xml', 'csv'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });

            if (!result.canceled && result.filePaths.length > 0) {
              const filePath = result.filePaths[0];
              try {
                const content = fs.readFileSync(filePath, 'utf8');
                mainWindow.webContents.send('file-opened', {
                  path: filePath,
                  content,
                  name: path.basename(filePath)
                });
              } catch (error) {
                console.error('Failed to read file:', error.message);
              }
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('save-file');
          }
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow.webContents.send('save-file-as');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Handle file opening from command line or file association
function handleFileOpen(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error('File does not exist:', filePath);
    return;
  }

  // Check if it's a directory
  const stats = fs.statSync(filePath);
  if (stats.isDirectory()) {
    console.error('Cannot open directory:', filePath);
    return;
  }

  // Check if it's a readable file
  if (!stats.isFile()) {
    console.error('Path is not a regular file:', filePath);
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Send file data to renderer process
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('file-opened', {
        path: filePath,
        content,
        name: fileName
      });
    }
  } catch (error) {
    console.error('Failed to read file:', error.message);
  }
}

// Handle command line arguments
function handleCommandLineArgs() {
  const args = process.argv.slice(1);
  
  // Skip the first argument if it's the app path and filter out directories
  const fileArgs = args.filter(arg => {
    // Skip flags and app paths
    if (arg.startsWith('--') || arg.startsWith('-') || 
        arg === process.execPath || arg === app.getPath('exe')) {
      return false;
    }
    
    // Skip if it's the current directory
    if (arg === '.' || arg === './') {
      return false;
    }
    
    // Only include if it's a valid file path
    try {
      if (fs.existsSync(arg)) {
        const stats = fs.statSync(arg);
        return stats.isFile();
      }
    } catch (error) {
      console.error('Error checking file:', arg, error.message);
    }
    
    return false;
  });

  if (fileArgs.length > 0) {
    // Wait for window to be ready before opening files
    app.whenReady().then(() => {
      fileArgs.forEach(filePath => {
        handleFileOpen(filePath);
      });
    });
  }
}

app.whenReady().then(() => {
  createWindow();
  handleCommandLineArgs();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Set up file associations
if (process.platform === 'win32') {
  // Windows file association
  app.setAsDefaultProtocolClient('log-viewer');
  
  // Handle file association on Windows
  const gotTheLock = app.requestSingleInstanceLock();
  
  if (!gotTheLock) {
    app.quit();
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // Someone tried to run a second instance, focus our window instead
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
        
        // Handle file arguments from second instance
        const fileArgs = commandLine.filter(arg => {
          if (arg.startsWith('--') || arg.startsWith('-')) {
            return false;
          }
          
          try {
            if (fs.existsSync(arg)) {
              const stats = fs.statSync(arg);
              return stats.isFile();
            }
          } catch (error) {
            return false;
          }
          
          return false;
        });
        
        fileArgs.forEach(filePath => {
          handleFileOpen(filePath);
        });
      }
    });
  }
} else if (process.platform === 'darwin') {
  // macOS file association
  app.on('open-file', (event, filePath) => {
    event.preventDefault();
    handleFileOpen(filePath);
  });
}

// IPC handlers for file operations
ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt', 'log', 'json', 'xml', 'csv'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return { path: filePath, content, name: path.basename(filePath) };
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }
  return null;
});

ipcMain.handle('save-file', async (event, { path, content }) => {
  try {
    fs.writeFileSync(path, content, 'utf8');
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to save file: ${error.message}`);
  }
});

ipcMain.handle('save-file-as', async (event, { content, defaultName }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [
      { name: 'Text Files', extensions: ['txt', 'log'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePath) {
    try {
      fs.writeFileSync(result.filePath, content, 'utf8');
      return { path: result.filePath, success: true };
    } catch (error) {
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }
  return null;
});

// Handle file opening from system
ipcMain.on('file-opened', (event, fileData) => {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('file-opened', fileData);
  }
});