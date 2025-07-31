import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { Palette, Trash2, Plus, X } from 'lucide-react';

const ContextMenu = () => {
  const { 
    contextMenu, 
    hideContextMenu, 
    applyRuleFromSelection,
    highlightRules,
    removeHighlightRule
  } = useStore();

  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Predefined colors for quick selection
  const predefinedColors = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#ec4899', // Pink
    '#84cc16', // Lime
    '#6366f1', // Indigo
  ];

  useEffect(() => {
    const handleClickOutside = () => {
      hideContextMenu();
    };

    if (contextMenu.visible) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu.visible, hideContextMenu]);

  const handleApplyRule = () => {
    applyRuleFromSelection(selectedColor);
    hideContextMenu();
  };

  const handleRemoveRule = (ruleId) => {
    removeHighlightRule(ruleId);
    hideContextMenu();
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setShowColorPicker(false);
  };

  if (!contextMenu.visible) {
    return null;
  }

  // Find matching rules for the selected text
  const matchingRules = highlightRules.filter(rule => 
    contextMenu.selectedText && 
    (rule.regex.toLowerCase().includes(contextMenu.selectedText.toLowerCase()) ||
     contextMenu.selectedText.toLowerCase().includes(rule.regex.toLowerCase()))
  );

  // Calculate smart positioning
  const calculatePosition = () => {
    const menuWidth = 256; // min-w-64 = 256px
    const menuHeight = 400; // Approximate height
    const padding = 20;
    
    let x = contextMenu.x;
    let y = contextMenu.y;
    
    // Ensure menu doesn't go off the right edge
    if (x + menuWidth / 2 > window.innerWidth - padding) {
      x = window.innerWidth - menuWidth / 2 - padding;
    }
    
    // Ensure menu doesn't go off the left edge
    if (x - menuWidth / 2 < padding) {
      x = menuWidth / 2 + padding;
    }
    
    // Try to position above first, then below if not enough space
    if (y - menuHeight > padding) {
      // Position above
      return {
        left: x,
        top: y,
        transform: 'translate(-50%, -100%)',
        marginTop: '-8px'
      };
    } else if (y + menuHeight < window.innerHeight - padding) {
      // Position below
      return {
        left: x,
        top: y,
        transform: 'translate(-50%, 0)',
        marginTop: '8px'
      };
    } else {
      // Center vertically if neither above nor below works
      return {
        left: x,
        top: window.innerHeight / 2,
        transform: 'translate(-50%, -50%)'
      };
    }
  };

  const position = calculatePosition();

  return (
    <div 
      className="fixed z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-lg min-w-64"
      style={position}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-700 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-200">Selected Text</span>
        <button
          onClick={hideContextMenu}
          className="text-gray-400 hover:text-gray-300"
        >
          <X size={14} />
        </button>
      </div>

      {/* Selected text preview */}
      <div className="px-3 py-2 border-b border-gray-700">
        <div className="text-xs text-gray-400 mb-1">Text:</div>
        <div className="text-sm text-gray-200 bg-gray-700 px-2 py-1 rounded break-all">
          {contextMenu.selectedText}
        </div>
      </div>

      {/* Add new rule section */}
      <div className="px-3 py-2 border-b border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Add as Highlight Rule:</div>
        
        {/* Color selection */}
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xs text-gray-400">Color:</span>
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center space-x-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            <div 
              className="w-4 h-4 rounded border border-gray-500"
              style={{ backgroundColor: selectedColor }}
            />
            <Palette size={12} />
          </button>
        </div>

        {/* Color picker dropdown */}
        {showColorPicker && (
          <div className="mb-2 p-2 bg-gray-700 rounded border border-gray-600">
            <div className="grid grid-cols-5 gap-1">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className="w-6 h-6 rounded border border-gray-500 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-8 h-6 border border-gray-500 rounded"
              />
              <span className="text-xs text-gray-400">Custom color</span>
            </div>
          </div>
        )}

        <button
          onClick={handleApplyRule}
          className="w-full flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
        >
          <Plus size={14} />
          <span>Add Rule</span>
        </button>
      </div>

      {/* Existing matching rules */}
      {matchingRules.length > 0 && (
        <div className="px-3 py-2">
          <div className="text-xs text-gray-400 mb-2">Matching Rules:</div>
          <div className="space-y-1">
            {matchingRules.map((rule) => (
              <div 
                key={rule.id}
                className="flex items-center justify-between p-2 bg-gray-700 rounded"
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded border border-gray-500"
                    style={{ backgroundColor: rule.color }}
                  />
                  <span className="text-xs text-gray-200 truncate">
                    {rule.regex}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveRule(rule.id)}
                  className="text-red-400 hover:text-red-300 p-1"
                  title="Remove rule"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All rules section */}
      {highlightRules.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-2">All Highlight Rules:</div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {highlightRules.map((rule) => (
              <div 
                key={rule.id}
                className="flex items-center justify-between p-2 bg-gray-700 rounded"
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded border border-gray-500"
                    style={{ backgroundColor: rule.color }}
                  />
                  <span className="text-xs text-gray-200 truncate">
                    {rule.regex}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveRule(rule.id)}
                  className="text-red-400 hover:text-red-300 p-1"
                  title="Remove rule"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextMenu; 