const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  saveFileAs: (data) => ipcRenderer.invoke('save-file-as', data),
  onFileOpened: (callback) => ipcRenderer.on('file-opened', callback),
  onNewTab: (callback) => ipcRenderer.on('new-tab', callback),
  onSaveFile: (callback) => ipcRenderer.on('save-file', callback),
  onSaveFileAs: (callback) => ipcRenderer.on('save-file-as', callback),
  removeFileOpenedListener: () => ipcRenderer.removeAllListeners('file-opened'),
  removeNewTabListener: () => ipcRenderer.removeAllListeners('new-tab'),
  removeSaveFileListener: () => ipcRenderer.removeAllListeners('save-file'),
  removeSaveFileAsListener: () => ipcRenderer.removeAllListeners('save-file-as'),
});