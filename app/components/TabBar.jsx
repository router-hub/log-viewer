import React, { useState } from 'react';
import useStore from '../store/useStore';
import { X, GripVertical } from 'lucide-react';

const TabBar = () => {
  const { 
    tabs, 
    activeTabId, 
    setActiveTab, 
    removeTab,
    draggedTabId,
    dropTargetTabId,
    setDraggedTab,
    setDropTarget,
    reorderTabs
  } = useStore();

  const [isDragging, setIsDragging] = useState(false);

  if (tabs.length === 0) {
    return null;
  }

  const handleDragStart = (e, tabId) => {
    setDraggedTab(tabId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', tabId);
  };

  const handleDragOver = (e, tabId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(tabId);
  };

  const handleDragEnter = (e, tabId) => {
    e.preventDefault();
    setDropTarget(tabId);
  };

  const handleDrop = (e, targetTabId) => {
    e.preventDefault();
    if (draggedTabId && draggedTabId !== targetTabId) {
      const fromIndex = tabs.findIndex(tab => tab.id === draggedTabId);
      const toIndex = tabs.findIndex(tab => tab.id === targetTabId);
      
      if (fromIndex !== -1 && toIndex !== -1) {
        reorderTabs(fromIndex, toIndex);
      }
    }
    setDraggedTab(null);
    setDropTarget(null);
    setIsDragging(false);
  };

  const handleDragEnd = () => {
    setDraggedTab(null);
    setDropTarget(null);
    setIsDragging(false);
  };

  return (
    <div className="flex bg-gray-800 border-b border-gray-700 overflow-x-auto">
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          draggable
          onDragStart={(e) => handleDragStart(e, tab.id)}
          onDragOver={(e) => handleDragOver(e, tab.id)}
          onDragEnter={(e) => handleDragEnter(e, tab.id)}
          onDrop={(e) => handleDrop(e, tab.id)}
          onDragEnd={handleDragEnd}
          className={`group flex items-center px-4 py-2 border-r border-gray-700 cursor-pointer min-w-0 transition-all ${
            activeTabId === tab.id
              ? 'bg-gray-700 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
          } ${
            draggedTabId === tab.id ? 'opacity-50' : ''
          } ${
            dropTargetTabId === tab.id && draggedTabId !== tab.id 
              ? 'border-l-2 border-l-blue-500' 
              : ''
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <GripVertical 
              size={12} 
              className="text-gray-500 hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0" 
            />
            <span className="truncate text-sm">
              {tab.title}
              {tab.isDirty && ' *'}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeTab(tab.id);
            }}
            className="ml-2 p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default TabBar;