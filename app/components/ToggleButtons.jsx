import React from 'react';
import useStore from '../store/useStore';
import { Sun, Moon, WrapText } from 'lucide-react';

const ToggleButtons = () => {
  const { theme, toggleTheme, wrapMode, toggleWrapMode } = useStore();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={toggleTheme}
        className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      
      <button
        onClick={toggleWrapMode}
        className={`p-2 rounded ${
          wrapMode === 'on'
            ? 'text-blue-400 bg-blue-900/30'
            : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
        }`}
        title={`${wrapMode === 'on' ? 'Disable' : 'Enable'} word wrap`}
      >
        <WrapText size={16} />
      </button>
    </div>
  );
};

export default ToggleButtons;