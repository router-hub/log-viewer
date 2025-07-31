import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { Search, X, ArrowUp, ArrowDown, Settings } from 'lucide-react';

const BottomSearch = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    searchResults, 
    setSearchResults,
    searchOptions,
    setSearchOptions,
    getActiveTab
  } = useStore();

  const [showSearch, setShowSearch] = useState(false);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const inputRef = useRef(null);

  const activeTab = getActiveTab();

  const performSearch = (query, options) => {
    if (!activeTab || !query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = [];
    const lines = activeTab.content.split('\n');
    const searchRegex = options.useRegex 
      ? new RegExp(query, options.matchCase ? 'g' : 'gi')
      : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), options.matchCase ? 'g' : 'gi');

    lines.forEach((line, lineIndex) => {
      let match;
      while ((match = searchRegex.exec(line)) !== null) {
        results.push({
          line: lineIndex + 1,
          column: match.index + 1,
          text: line,
          match: match[0]
        });
      }
    });

    setSearchResults(results);
    setCurrentResultIndex(0);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(query, searchOptions);
  };

  const handleOptionChange = (option, value) => {
    const newOptions = { ...searchOptions, [option]: value };
    setSearchOptions(newOptions);
    performSearch(searchQuery, newOptions);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setCurrentResultIndex(0);
  };

  const navigateToLine = (lineNumber) => {
    window.dispatchEvent(new CustomEvent('navigate-to-line', { 
      detail: { lineNumber } 
    }));
  };

  const navigateResults = (direction) => {
    if (searchResults.length === 0) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentResultIndex + 1) % searchResults.length;
    } else {
      newIndex = currentResultIndex === 0 ? searchResults.length - 1 : currentResultIndex - 1;
    }
    
    setCurrentResultIndex(newIndex);
    navigateToLine(searchResults[newIndex].line);
  };

  // Calculate smart positioning for popup
  const calculatePosition = () => {
    const popupWidth = 400;
    const popupHeight = 300;
    const padding = 20;
    
    // Center the popup on screen
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    
    // Ensure popup doesn't go off screen edges
    if (x + popupWidth / 2 > window.innerWidth - padding) {
      x = window.innerWidth - popupWidth / 2 - padding;
    }
    if (x - popupWidth / 2 < padding) {
      x = popupWidth / 2 + padding;
    }
    if (y + popupHeight / 2 > window.innerHeight - padding) {
      y = window.innerHeight - popupHeight / 2 - padding;
    }
    if (y - popupHeight / 2 < padding) {
      y = popupHeight / 2 + padding;
    }
    
    return { x, y };
  };

  // Handle Ctrl+F shortcut for local search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'f' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        const pos = calculatePosition();
        setPosition(pos);
        setShowSearch(true);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
          }
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle search-specific keyboard shortcuts
  useEffect(() => {
    const handleSearchKeyDown = (e) => {
      if (!showSearch) return;
      
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSearch(false);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          navigateResults('prev');
        } else {
          navigateResults('next');
        }
      }
    };

    window.addEventListener('keydown', handleSearchKeyDown);
    return () => window.removeEventListener('keydown', handleSearchKeyDown);
  }, [showSearch, currentResultIndex, searchResults]);

  // Focus input when search becomes visible
  useEffect(() => {
    if (showSearch && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
        inputRef.current.select();
      }, 100);
    }
  }, [showSearch]);

  // Perform search when active tab changes
  useEffect(() => {
    if (showSearch && searchQuery) {
      performSearch(searchQuery, searchOptions);
    }
  }, [activeTab]);

  // Perform search when search options change
  useEffect(() => {
    if (showSearch && searchQuery) {
      performSearch(searchQuery, searchOptions);
    }
  }, [searchOptions]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSearch && !e.target.closest('.search-popup')) {
        setShowSearch(false);
      }
    };

    if (showSearch) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSearch]);

  if (!showSearch) {
    return null;
  }

  return (
    <div 
      className="fixed z-50 search-popup"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-lg w-96 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-200">Search in Current File</span>
          </div>
          <button
            onClick={() => setShowSearch(false)}
            className="text-gray-400 hover:text-gray-300"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search in current file..."
              className="w-full pl-8 pr-8 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Search options */}
        <div className="px-4 py-2 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <label className="flex items-center space-x-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={searchOptions.matchCase}
                  onChange={(e) => handleOptionChange('matchCase', e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                />
                <span>Match case</span>
              </label>
              <label className="flex items-center space-x-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={searchOptions.useRegex}
                  onChange={(e) => handleOptionChange('useRegex', e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                />
                <span>Use regex</span>
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateResults('prev')}
                className="p-1 text-gray-400 hover:text-gray-300"
                title="Previous result"
                disabled={searchResults.length === 0}
              >
                <ArrowUp size={16} />
              </button>
              <button
                onClick={() => navigateResults('next')}
                className="p-1 text-gray-400 hover:text-gray-300"
                title="Next result"
                disabled={searchResults.length === 0}
              >
                <ArrowDown size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="p-4 max-h-48 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs text-gray-400 mb-2">
                {currentResultIndex + 1} of {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </div>
              {searchResults.map((result, index) => (
                <div
                  key={`${result.line}-${result.column}`}
                  className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                    index === currentResultIndex 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                  onClick={() => {
                    setCurrentResultIndex(index);
                    navigateToLine(result.line);
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-blue-400 font-medium">Line {result.line}</div>
                    <div className="text-gray-400">Col {result.column}</div>
                  </div>
                  <div className="text-gray-300 truncate">
                    {result.text}
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-xs text-gray-400 text-center py-4">
              No results found
            </div>
          ) : (
            <div className="text-xs text-gray-400 text-center py-4">
              Enter search term to find matches
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BottomSearch; 