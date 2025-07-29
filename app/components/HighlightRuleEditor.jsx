import React, { useState } from 'react';
import useStore from '../store/useStore';
import { Plus, Trash2, Edit3, X } from 'lucide-react';

const HighlightRuleEditor = () => {
  const { 
    highlightRules, 
    addHighlightRule, 
    removeHighlightRule, 
    updateHighlightRule 
  } = useStore();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newRule, setNewRule] = useState({
    regex: '',
    color: '#ef4444',
    caseSensitive: false
  });

  const handleAddRule = () => {
    if (newRule.regex.trim()) {
      addHighlightRule(newRule);
      setNewRule({ regex: '', color: '#ef4444', caseSensitive: false });
      setIsAdding(false);
    }
  };

  const handleEditRule = (id) => {
    const rule = highlightRules.find(r => r.id === id);
    if (rule) {
      setNewRule({
        regex: rule.regex,
        color: rule.color,
        caseSensitive: rule.caseSensitive
      });
      setEditingId(id);
      setIsAdding(true);
    }
  };

  const handleUpdateRule = () => {
    if (newRule.regex.trim() && editingId) {
      updateHighlightRule(editingId, newRule);
      setNewRule({ regex: '', color: '#ef4444', caseSensitive: false });
      setEditingId(null);
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewRule({ regex: '', color: '#ef4444', caseSensitive: false });
    setEditingId(null);
    setIsAdding(false);
  };

  const colorOptions = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">Highlight Rules</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
          >
            <Plus size={12} />
            <span>Add Rule</span>
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="mb-4 p-3 bg-gray-700 rounded border border-gray-600">
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-300 mb-1">
                Pattern (Regex)
              </label>
              <input
                type="text"
                value={newRule.regex}
                onChange={(e) => setNewRule({ ...newRule, regex: e.target.value })}
                placeholder="Enter regex pattern..."
                className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1">
                Color
              </label>
              <div className="flex space-x-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewRule({ ...newRule, color })}
                    className={`w-6 h-6 rounded border-2 ${
                      newRule.color === color ? 'border-white' : 'border-gray-500'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>

            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={newRule.caseSensitive}
                onChange={(e) => setNewRule({ ...newRule, caseSensitive: e.target.checked })}
                className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              />
              <span>Case sensitive</span>
            </label>

            <div className="flex space-x-2">
              <button
                onClick={editingId ? handleUpdateRule : handleAddRule}
                className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
              >
                {editingId ? 'Update' : 'Add'} Rule
              </button>
              <button
                onClick={handleCancel}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="flex-1 overflow-y-auto">
        {highlightRules.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-4">
            No highlight rules defined
          </div>
        ) : (
          <div className="space-y-2">
            {highlightRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-2 bg-gray-700 rounded"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div
                    className="w-4 h-4 rounded flex-shrink-0"
                    style={{ backgroundColor: rule.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-300 truncate">
                      {rule.regex}
                    </div>
                    <div className="text-xs text-gray-400">
                      {rule.caseSensitive ? 'Case sensitive' : 'Case insensitive'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditRule(rule.id)}
                    className="p-1 text-gray-400 hover:text-gray-300"
                    title="Edit rule"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    onClick={() => removeHighlightRule(rule.id)}
                    className="p-1 text-gray-400 hover:text-red-400"
                    title="Delete rule"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HighlightRuleEditor;