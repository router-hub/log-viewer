import React, { useEffect, useState } from 'react';
import useStore from './store/useStore';
import TabBar from './components/TabBar';
import Editor from './components/Editor';
import SearchPane from './components/SearchPane';
import HighlightRuleEditor from './components/HighlightRuleEditor';
import ToggleButtons from './components/ToggleButtons';
import GlobalSearch from './components/GlobalSearch';
import BottomSearch from './components/BottomSearch';
import ContextMenu from './components/ContextMenu';
import { FolderOpen, Save, FileDown, AlertCircle, Eye, EyeOff } from 'lucide-react';

function App() {
  const { 
    theme, 
    tabs, 
    activeTabId, 
    addTab, 
    addNewTab,
    getActiveTab,
    updateTab,
    showHighlightRules,
    toggleHighlightRules
  } = useStore();

  const [error, setError] = useState(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Handle files opened from system (file associations)
  useEffect(() => {
    const handleFileOpened = (event, fileData) => {
      try {
        addTab(fileData);
        setError(null);
      } catch (err) {
        setError('Failed to open file: ' + err.message);
      }
    };

    const handleNewTab = () => {
      addNewTab();
    };

    const handleSaveFile = () => {
      handleSaveFileAction();
    };

    const handleSaveFileAs = () => {
      handleSaveFileAsAction();
    };

    // Set up listeners for menu actions
      window.electronAPI.onFileOpened(handleFileOpened);
      window.electronAPI.onNewTab(handleNewTab);
      window.electronAPI.onSaveFile(handleSaveFile);
      window.electronAPI.onSaveFileAs(handleSaveFileAs);

      // Cleanup listeners on unmount
      return () => {
        window.electronAPI.removeFileOpenedListener();
        window.electronAPI.removeNewTabListener();
        window.electronAPI.removeSaveFileListener();
        window.electronAPI.removeSaveFileAsListener();
      };
  }, [addTab, addNewTab]);

  // Handle file operations
  const handleOpenFile = async () => {
    try {
      setError(null);
      const fileData = await window.electronAPI.openFile();
      if (fileData) {
        addTab(fileData);
      }
    } catch (error) {
      console.error('Failed to open file:', error);
      setError('Failed to open file: ' + error.message);
    }
  };

  const handleSaveFileAction = async () => {
    const activeTab = getActiveTab();
    if (!activeTab || !activeTab.path) {
      await handleSaveFileAsAction();
      return;
    }

    try {
      setError(null);
      await window.electronAPI.saveFile({
        path: activeTab.path,
        content: activeTab.content
      });
      updateTab(activeTab.id, { isDirty: false });
    } catch (error) {
      console.error('Failed to save file:', error);
      setError('Failed to save file: ' + error.message);
    }
  };

  const handleSaveFileAsAction = async () => {
    const activeTab = getActiveTab();
    if (!activeTab) return;

    try {
      setError(null);
      const result = await window.electronAPI.saveFileAs({
        content: activeTab.content,
        defaultName: activeTab.title
      });
      if (result) {
        updateTab(activeTab.id, { 
          path: result.path, 
          title: result.path.split('/').pop(),
          isDirty: false 
        });
      }
    } catch (error) {
      console.error('Failed to save file as:', error);
      setError('Failed to save file as: ' + error.message);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Global Search Overlay */}
      <GlobalSearch />
      
      {/* Context Menu */}
      <ContextMenu />
      
      {/* Error notification */}
      {error && (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}

      {/* Top toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleOpenFile}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
          >
            <FolderOpen size={16} />
            <span>Open</span>
          </button>
          <button
            onClick={handleSaveFileAction}
            className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
          >
            <Save size={16} />
            <span>Save</span>
          </button>
          <button
            onClick={handleSaveFileAsAction}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
          >
            <FileDown size={16} />
            <span>Save As</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleHighlightRules}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
              showHighlightRules 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={`${showHighlightRules ? 'Hide' : 'Show'} Highlight Rules`}
          >
            {showHighlightRules ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>Rules</span>
          </button>
          <ToggleButtons />
        </div>
      </div>

      {/* Tab bar */}
      <TabBar />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Highlight Rules Only */}
        {showHighlightRules && (
          <div className="w-80 sidebar">
            <div className="h-full p-4">
              <HighlightRuleEditor />
            </div>
          </div>
        )}

        {/* Editor area */}
        <div className="flex-1 editor-container">
          {activeTabId ? (
            <Editor />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="mb-4">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                    <circle cx="32" cy="32" r="30" fill="#1f2937" stroke="#3b82f6" strokeWidth="2"/>
                    <rect x="16" y="12" width="24" height="32" rx="2" fill="#6b7280" stroke="#9ca3af" strokeWidth="1"/>
                    <rect x="18" y="16" width="16" height="1" fill="#d1d5db"/>
                    <rect x="18" y="19" width="12" height="1" fill="#d1d5db"/>
                    <rect x="18" y="22" width="14" height="1" fill="#d1d5db"/>
                    <rect x="18" y="25" width="10" height="1" fill="#d1d5db"/>
                    <rect x="18" y="28" width="16" height="1" fill="#d1d5db"/>
                    <rect x="18" y="31" width="8" height="1" fill="#d1d5db"/>
                    <ellipse cx="32" cy="32" rx="8" ry="4" fill="#3b82f6" opacity="0.8"/>
                    <circle cx="32" cy="32" r="2" fill="#ffffff"/>
                    <circle cx="32" cy="32" r="1" fill="#1f2937"/>
                    <path d="M28 36 L36 36 L36 38 L28 38 Z" fill="#fbbf24" opacity="0.9"/>
                    <path d="M26 40 L38 40 L38 42 L26 42 Z" fill="#ef4444" opacity="0.9"/>
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-300 mb-2">LogFocus</h1>
                <p className="text-sm text-gray-500 mb-4">Modern log viewer with advanced highlighting</p>
                <div className="space-y-2">
                  <button
                    onClick={handleOpenFile}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                  >
                    Open File
                  </button>
                  <div className="text-xs text-gray-500">
                    <p>Or drag and drop a file here</p>
                    <p>Supported: .log, .txt, .json, .xml, .csv</p>
                    <p className="mt-2">Keyboard shortcuts:</p>
                    <p>Ctrl+N: New Tab | Ctrl+S: Save | Ctrl+Shift+S: Save As</p>
                    <p>Ctrl+F: Local Search | Ctrl+Shift+F: Global Search</p>
                    <p>Right-click selected text: Apply as Highlight Rule</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Search (Notepad++ style) */}
      <BottomSearch />
    </div>
  );
}

export default App;