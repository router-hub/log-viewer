import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { Search, X, ChevronUp, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';

const GlobalSearch = () => {
  const { 
    globalSearchQuery, 
    setGlobalSearchQuery, 
    globalSearchResults, 
    setGlobalSearchResults,
    globalSearchOptions,
    setGlobalSearchOptions,
    showGlobalSearch,
    toggleGlobalSearch,
    tabs,
    setActiveTab,
    getActiveTab
  } = useStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const inputRef = useRef(null);

  const performGlobalSearch = (query, options) => {
    if (!query.trim()) {
      setGlobalSearchResults([]);
      return;
    }

    const results = [];
    const searchRegex = options.useRegex 
      ? new RegExp(query, options.matchCase ? 'g' : 'gi')
      : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), options.matchCase ? 'g' : 'gi');

    tabs.forEach(tab => {
      const lines = tab.content.split('\n');
      lines.forEach((line, lineIndex) => {
        let match;
        while ((match = searchRegex.exec(line)) !== null) {
          results.push({
            tabId: tab.id,
            tabTitle: tab.title,
            line: lineIndex + 1,
            column: match.index + 1,
            text: line,
            match: match[0]
          });
        }
      });
    });

    setGlobalSearchResults(results);
    setCurrentResultIndex(0);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setGlobalSearchQuery(query);
    performGlobalSearch(query, globalSearchOptions);
  };

  const handleOptionChange = (option, value) => {
    const newOptions = { ...globalSearchOptions, [option]: value };
    setGlobalSearchOptions(newOptions);
    performGlobalSearch(globalSearchQuery, newOptions);
  };

  const clearSearch = () => {
    setGlobalSearchQuery('');
    setGlobalSearchResults([]);
    setCurrentResultIndex(0);
  };

  const navigateToResult = (result) => {
    // Switch to the tab containing the result
    setActiveTab(result.tabId);
    
    // Dispatch event to navigate to the specific line
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('navigate-to-line', { 
        detail: { lineNumber: result.line } 
      }));
    }, 100);
  };

  const navigateResults = (direction) => {
    if (globalSearchResults.length === 0) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentResultIndex + 1) % globalSearchResults.length;
    } else {
      newIndex = currentResultIndex === 0 ? globalSearchResults.length - 1 : currentResultIndex - 1;
    }
    
    setCurrentResultIndex(newIndex);
    navigateToResult(globalSearchResults[newIndex]);
  };

  // Handle Ctrl+Shift+F shortcut for global search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        toggleGlobalSearch();
        // Use a longer timeout to ensure the component is rendered
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
          }
        }, 200);
      }
      
      if (showGlobalSearch) {
        if (e.key === 'Escape') {
          e.preventDefault();
          toggleGlobalSearch();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (e.shiftKey) {
            navigateResults('prev');
          } else {
            navigateResults('next');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGlobalSearch, currentResultIndex, globalSearchResults]);

  // Focus input when global search becomes visible
  useEffect(() => {
    if (showGlobalSearch && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
        inputRef.current.select();
      }, 100);
    }
  }, [showGlobalSearch]);

  if (!showGlobalSearch) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gray-800 border-b border-gray-700 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Search header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-300">Global Search (Ctrl+Shift+F)</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-300"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
            <button
              onClick={toggleGlobalSearch}
              className="text-gray-400 hover:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative mb-2">
          <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={globalSearchQuery}
            onChange={handleSearchChange}
            onKeyDown={(e) => {
              // Prevent event bubbling for certain keys
              if (e.key === 'Escape' || e.key === 'Enter') {
                e.stopPropagation();
              }
            }}
            placeholder="Search across all files..."
            className="w-full pl-8 pr-8 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
            autoFocus
          />
          {globalSearchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search options */}
        {isExpanded && (
          <div className="mb-2 space-y-2">
            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={globalSearchOptions.matchCase}
                onChange={(e) => handleOptionChange('matchCase', e.target.checked)}
                className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              />
              <span>Match case</span>
            </label>
            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={globalSearchOptions.useRegex}
                onChange={(e) => handleOptionChange('useRegex', e.target.checked)}
                className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              />
              <span>Use regex</span>
            </label>
          </div>
        )}

        {/* Search results */}
        <div className="max-h-64 overflow-y-auto">
          {globalSearchResults.length > 0 ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span>{globalSearchResults.length} result{globalSearchResults.length !== 1 ? 's' : ''}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigateResults('prev')}
                    className="flex items-center space-x-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                  >
                    <ArrowUp size={12} />
                    <span>Prev</span>
                  </button>
                  <button
                    onClick={() => navigateResults('next')}
                    className="flex items-center space-x-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                  >
                    <ArrowDown size={12} />
                    <span>Next</span>
                  </button>
                </div>
              </div>
              {globalSearchResults.map((result, index) => (
                <div
                  key={`${result.tabId}-${result.line}-${result.column}`}
                  className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                    index === currentResultIndex 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                  onClick={() => {
                    setCurrentResultIndex(index);
                    navigateToResult(result);
                  }}
                  title={`Go to ${result.tabTitle}:${result.line}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-blue-400 font-medium">{result.tabTitle}</div>
                    <div className="text-gray-400">Line {result.line}</div>
                  </div>
                  <div className="text-gray-300 truncate">
                    {result.text}
                  </div>
                </div>
              ))}
            </div>
          ) : globalSearchQuery ? (
            <div className="text-xs text-gray-400 text-center py-4">
              No results found
            </div>
          ) : (
            <div className="text-xs text-gray-400 text-center py-4">
              Enter search term to find matches across all files
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch; 