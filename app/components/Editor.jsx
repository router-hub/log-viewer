import React, { useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import * as monaco from 'monaco-editor';

const Editor = () => {
  const containerRef = useRef(null);
  const editorsRef = useRef(new Map()); // Store editors by tab ID
  const { 
    activeTabId, 
    getActiveTab, 
    updateTab, 
    wrapMode, 
    highlightRules,
    theme,
    showContextMenu,
    hideContextMenu
  } = useStore();

  const activeTab = getActiveTab();

  // Initialize editor for a specific tab
  const initializeEditor = (tabId, content) => {
    if (!containerRef.current) return;

    // Dispose existing editor for this tab if it exists
    if (editorsRef.current.has(tabId)) {
      editorsRef.current.get(tabId).dispose();
    }

    // Create a separate container for this editor
    const editorContainer = document.createElement('div');
    editorContainer.style.width = '100%';
    editorContainer.style.height = '100%';
    editorContainer.style.display = 'none'; // Initially hidden
    containerRef.current.appendChild(editorContainer);

    // Create new editor instance for this tab
    const editor = monaco.editor.create(editorContainer, {
      value: content || '',
      language: 'plaintext',
      theme: theme === 'dark' ? 'vs-dark' : 'vs',
      wordWrap: wrapMode,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: 'on',
      renderWhitespace: 'none',
      automaticLayout: true,
      contextmenu: false, // Disable default context menu
    });

    // Store editor instance with its container
    editorsRef.current.set(tabId, { editor, container: editorContainer });

    // Handle content changes
    editor.onDidChangeModelContent(() => {
      const currentTab = getActiveTab();
      if (currentTab && currentTab.id === tabId) {
        updateTab(tabId, { 
          content: editor.getValue(),
          isDirty: true 
        });
      }
    });

    // Handle right-click context menu with mouse events
    editorContainer.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      
      const selection = editor.getSelection();
      if (selection && !selection.isEmpty()) {
        const selectedText = editor.getModel().getValueInRange(selection);
        if (selectedText.trim()) {
          // Get the mouse position relative to the viewport
          const rect = editorContainer.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          // Convert to absolute position
          const absoluteX = e.clientX;
          const absoluteY = e.clientY;
          
          showContextMenu(absoluteX, absoluteY, selectedText);
        }
      }
    });

    // Also handle the Monaco editor's context menu event as backup
    editor.onContextMenu((e) => {
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
      
      const selection = editor.getSelection();
      if (selection && !selection.isEmpty()) {
        const selectedText = editor.getModel().getValueInRange(selection);
        if (selectedText.trim()) {
          showContextMenu(e.event.posx, e.event.posy, selectedText);
        }
      }
    });

    return editor;
  };

  // Show editor for active tab
  const showEditor = (tabId) => {
    if (!containerRef.current) return;

    // Hide all editor containers
    editorsRef.current.forEach(({ container }) => {
      container.style.display = 'none';
    });

    // Show editor for active tab
    const editorData = editorsRef.current.get(tabId);
    if (editorData) {
      editorData.container.style.display = 'block';
      editorData.editor.focus();
    }
  };

  // Navigate to specific line in the active editor
  const navigateToLine = (lineNumber) => {
    if (!activeTab || !editorsRef.current.has(activeTab.id)) return;

    const { editor } = editorsRef.current.get(activeTab.id);
    
    // Ensure the line number is within valid range
    const lineCount = editor.getModel().getLineCount();
    const targetLine = Math.max(1, Math.min(lineNumber, lineCount));
    
    // Set cursor position and scroll to the line
    editor.setPosition({ lineNumber: targetLine, column: 1 });
    editor.revealLineInCenter(targetLine);
    editor.focus();
  };

  // Helper function to escape regex special characters
  const escapeRegex = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Helper function to validate and create regex
  const createValidRegex = (pattern, caseSensitive) => {
    try {
      // If the pattern is already a valid regex, use it as is
      if (pattern.startsWith('/') && pattern.endsWith('/')) {
        const flags = pattern.slice(pattern.lastIndexOf('/') + 1);
        const regexPattern = pattern.slice(1, pattern.lastIndexOf('/'));
        return new RegExp(regexPattern, caseSensitive ? 'g' : 'gi');
      }
      
      // Otherwise, escape the pattern and create regex
      const escapedPattern = escapeRegex(pattern);
      return new RegExp(escapedPattern, caseSensitive ? 'g' : 'gi');
    } catch (error) {
      console.error('Invalid regex pattern:', pattern, error);
      return null;
    }
  };

  // Handle active tab changes
  useEffect(() => {
    if (!activeTab) {
      // Hide all editors when no active tab
      editorsRef.current.forEach(({ container }) => {
        container.style.display = 'none';
      });
      return;
    }

    // Initialize editor for this tab if it doesn't exist
    if (!editorsRef.current.has(activeTab.id)) {
      initializeEditor(activeTab.id, activeTab.content);
    }

    // Show the active editor
    showEditor(activeTab.id);
  }, [activeTabId, activeTab]);

  // Update editor content when tab content changes
  useEffect(() => {
    if (activeTab && editorsRef.current.has(activeTab.id)) {
      const { editor } = editorsRef.current.get(activeTab.id);
      const currentValue = editor.getValue();
      if (currentValue !== activeTab.content) {
        editor.setValue(activeTab.content || '');
      }
    }
  }, [activeTab?.content]);

  // Update theme for all editors
  useEffect(() => {
    editorsRef.current.forEach(({ editor }) => {
      monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
    });
  }, [theme]);

  // Update word wrap for all editors
  useEffect(() => {
    editorsRef.current.forEach(({ editor }) => {
      editor.updateOptions({ wordWrap: wrapMode });
    });
  }, [wrapMode]);

  // Apply highlighting to active editor
  useEffect(() => {
    if (!activeTab || !editorsRef.current.has(activeTab.id)) return;

    const { editor } = editorsRef.current.get(activeTab.id);
    
    console.log('🔍 === HIGHLIGHTING DEBUG ===');
    console.log('🔍 Rules:', highlightRules.length, 'Content length:', activeTab.content?.length);
    
    // Generate dynamic CSS for current rules
    const generateDynamicCSS = () => {
      const styleId = 'dynamic-highlight-styles';
      let existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
      
      const style = document.createElement('style');
      style.id = styleId;
      
      const cssRules = highlightRules.map(rule => `
        .highlight-${rule.id} {
          background-color: ${rule.color} !important;
          color: #ffffff !important;
          font-weight: bold !important;
        }
      `).join('\n');
      
      style.textContent = cssRules;
      document.head.appendChild(style);
    };
    
    // Generate CSS for current rules
    generateDynamicCSS();
    
    // Clear existing decorations
    const decorations = editor.deltaDecorations([], []);

    // Apply highlight rules
    let totalMatches = 0;
    const newDecorations = highlightRules.map(rule => {
      const regex = createValidRegex(rule.regex, rule.caseSensitive);
      if (!regex) {
        console.log('❌ Invalid regex for rule:', rule.regex);
        return [];
      }

      const matches = [];
      const text = activeTab.content;
      let match;

      while ((match = regex.exec(text)) !== null) {
        try {
          const startPos = editor.getModel().getPositionAt(match.index);
          const endPos = editor.getModel().getPositionAt(match.index + match[0].length);
          
          matches.push({
            range: new monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column),
            options: {
              inlineClassName: `highlight-${rule.id}`
            }
          });
        } catch (error) {
          console.error('❌ Error creating decoration for match:', match, error);
        }
      }

      totalMatches += matches.length;
      console.log(`✅ ${rule.regex}: ${matches.length} matches (${rule.color})`);
      return matches;
    }).flat();
    
    console.log('🔍 Total:', totalMatches, 'decorations applied');
    
    // Apply decorations
    const decorationIds = editor.deltaDecorations(decorations, newDecorations);
    console.log('🔍 === END DEBUG ===');
  }, [activeTab, highlightRules]);

  // Listen for navigation events
  useEffect(() => {
    const handleNavigateToLine = (event) => {
      const { lineNumber } = event.detail;
      navigateToLine(lineNumber);
    };

    window.addEventListener('navigate-to-line', handleNavigateToLine);

    return () => {
      window.removeEventListener('navigate-to-line', handleNavigateToLine);
    };
  }, [activeTab]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      editorsRef.current.forEach(({ editor, container }) => {
        editor.dispose();
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      });
      editorsRef.current.clear();
    };
  }, []);

  if (!activeTab) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
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
          <p className="text-xs text-gray-600">Open a file to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div ref={containerRef} className="h-full" />
    </div>
  );
};

export default Editor;