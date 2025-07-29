import React from 'react';
import useStore from '../store/useStore';
import { X } from 'lucide-react';

const TabBar = () => {
  const { tabs, activeTabId, setActiveTab, removeTab } = useStore();

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="flex bg-gray-800 border-b border-gray-700 overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`group flex items-center px-4 py-2 border-r border-gray-700 cursor-pointer min-w-0 ${
            activeTabId === tab.id
              ? 'bg-gray-700 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-750'
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          <div className="flex items-center space-x-2 min-w-0 flex-1">
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