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
    theme 
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
    
    // Clear existing decorations
    const decorations = editor.deltaDecorations([], []);

    // Apply highlight rules
    const newDecorations = highlightRules.map(rule => {
      try {
        const regex = new RegExp(rule.regex, rule.caseSensitive ? 'g' : 'gi');
        const matches = [];
        const text = activeTab.content;
        let match;

        while ((match = regex.exec(text)) !== null) {
          const startPos = editor.getModel().getPositionAt(match.index);
          const endPos = editor.getModel().getPositionAt(match.index + match[0].length);
          
          matches.push({
            range: new monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column),
            options: {
              inlineClassName: `highlight-${rule.id}`,
              backgroundColor: rule.color,
              color: '#ffffff'
            }
          });
        }

        return matches;
      } catch (error) {
        console.error('Invalid regex:', rule.regex, error);
        return [];
      }
    }).flat();

    // Apply decorations
    editor.deltaDecorations(decorations, newDecorations);
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
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>No file selected</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div ref={containerRef} className="h-full" />
      
      {/* Highlight styles */}
      <style>
        {highlightRules.map(rule => `
          .highlight-${rule.id} {
            background-color: ${rule.color} !important;
            color: #ffffff !important;
          }
        `).join('')}
      </style>
    </div>
  );
};

export default Editor;