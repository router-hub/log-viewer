import React, { useState } from 'react';
import useStore from '../store/useStore';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';

const SearchPane = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    searchResults, 
    setSearchResults,
    searchOptions,
    setSearchOptions,
    getActiveTab
  } = useStore();

  const [isExpanded, setIsExpanded] = useState(false);
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
  };

  const navigateToLine = (lineNumber) => {
    // Dispatch a custom event to notify the editor to navigate to the line
    window.dispatchEvent(new CustomEvent('navigate-to-line', { 
      detail: { lineNumber } 
    }));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-300">Search</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-300"
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {/* Search input */}
      <div className="relative mb-2">
        <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search in file..."
          className="w-full pl-8 pr-8 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
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

      {/* Search options */}
      {isExpanded && (
        <div className="mb-2 space-y-2">
          <label className="flex items-center space-x-2 text-xs">
            <input
              type="checkbox"
              checked={searchOptions.matchCase}
              onChange={(e) => handleOptionChange('matchCase', e.target.checked)}
              className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
            <span>Match case</span>
          </label>
          <label className="flex items-center space-x-2 text-xs">
            <input
              type="checkbox"
              checked={searchOptions.useRegex}
              onChange={(e) => handleOptionChange('useRegex', e.target.checked)}
              className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
            <span>Use regex</span>
          </label>
        </div>
      )}

      {/* Search results */}
      <div className="flex-1 overflow-y-auto">
        {searchResults.length > 0 ? (
          <div className="space-y-1">
            <div className="text-xs text-gray-400 mb-2">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </div>
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="p-2 bg-gray-700 rounded text-xs cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={() => navigateToLine(result.line)}
                title={`Go to line ${result.line}`}
              >
                <div className="text-blue-400 mb-1">Line {result.line}</div>
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
  );
};

export default SearchPane;