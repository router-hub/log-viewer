import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Tab management
  tabs: [],
  activeTabId: null,
  
  // Highlight rules
  highlightRules: [
    { id: '1', regex: 'ERROR', color: '#ef4444', caseSensitive: false },
    { id: '2', regex: 'GET', color: '#eab308', caseSensitive: false },
    { id: '3', regex: 'INFO', color: '#3b82f6', caseSensitive: false },
    { id: '4', regex: 'POST', color: '#8b5cf6', caseSensitive: false },
    { id: '5', regex: 'WARN', color: '#fbbf24', caseSensitive: false },
    { id: '6', regex: 'DEBUG', color: '#f97316', caseSensitive: false },
  ],
  
  // UI settings
  wrapMode: 'on',
  theme: 'dark',
  showHighlightRules: true,
  
  // Search state
  searchQuery: '',
  searchResults: [],
  searchOptions: {
    matchCase: false,
    useRegex: false,
  },
  
  // Global search state
  globalSearchQuery: '',
  globalSearchResults: [],
  globalSearchOptions: {
    matchCase: false,
    useRegex: false,
  },
  showGlobalSearch: false,
  
  // Tab reordering
  draggedTabId: null,
  dropTargetTabId: null,
  
  // Context menu state
  contextMenu: {
    visible: false,
    x: 0,
    y: 0,
    selectedText: '',
  },
  
  // Actions
  addTab: (tab) => {
    const newTab = {
      id: Date.now().toString(),
      title: tab.name || 'Untitled',
      content: tab.content || '',
      path: tab.path || null,
      isDirty: false,
      ...tab
    };
    
    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id
    }));
  },
  
  addNewTab: () => {
    const newTab = {
      id: Date.now().toString(),
      title: 'Untitled',
      content: '',
      path: null,
      isDirty: false,
    };
    
    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id
    }));
  },
  
  updateTab: (id, updates) => {
    set((state) => ({
      tabs: state.tabs.map(tab => 
        tab.id === id ? { ...tab, ...updates } : tab
      )
    }));
  },
  
  removeTab: (id) => {
    set((state) => {
      const newTabs = state.tabs.filter(tab => tab.id !== id);
      let newActiveTabId = state.activeTabId;
      
      if (id === state.activeTabId && newTabs.length > 0) {
        const currentIndex = state.tabs.findIndex(tab => tab.id === id);
        newActiveTabId = newTabs[Math.min(currentIndex, newTabs.length - 1)].id;
      } else if (newTabs.length === 0) {
        newActiveTabId = null;
      }
      
      return {
        tabs: newTabs,
        activeTabId: newActiveTabId
      };
    });
  },
  
  setActiveTab: (id) => {
    set({ activeTabId: id });
  },
  
  // Tab reordering
  setDraggedTab: (tabId) => {
    set({ draggedTabId: tabId });
  },
  
  setDropTarget: (tabId) => {
    set({ dropTargetTabId: tabId });
  },
  
  reorderTabs: (fromIndex, toIndex) => {
    set((state) => {
      const newTabs = [...state.tabs];
      const [movedTab] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, movedTab);
      return { tabs: newTabs };
    });
  },
  
  // Highlight rules
  addHighlightRule: (rule) => {
    const newRule = {
      id: Date.now().toString(),
      ...rule
    };
    set((state) => ({
      highlightRules: [...state.highlightRules, newRule]
    }));
  },
  
  removeHighlightRule: (id) => {
    set((state) => ({
      highlightRules: state.highlightRules.filter(rule => rule.id !== id)
    }));
  },
  
  updateHighlightRule: (id, updates) => {
    set((state) => ({
      highlightRules: state.highlightRules.map(rule =>
        rule.id === id ? { ...rule, ...updates } : rule
      )
    }));
  },
  
  // Context menu
  showContextMenu: (x, y, selectedText) => {
    set({
      contextMenu: {
        visible: true,
        x,
        y,
        selectedText
      }
    });
  },
  
  hideContextMenu: () => {
    set({
      contextMenu: {
        visible: false,
        x: 0,
        y: 0,
        selectedText: ''
      }
    });
  },
  
  applyRuleFromSelection: (color = '#3b82f6') => {
    const state = get();
    const selectedText = state.contextMenu.selectedText;
    
    if (selectedText.trim()) {
      // Add a new highlight rule based on selected text
      const newRule = {
        regex: selectedText,
        color: color,
        caseSensitive: false
      };
      
      get().addHighlightRule(newRule);
      get().hideContextMenu();
    }
  },
  
  // UI settings
  toggleWrapMode: () => {
    set((state) => ({
      wrapMode: state.wrapMode === 'on' ? 'off' : 'on'
    }));
  },
  
  toggleTheme: () => {
    set((state) => ({
      theme: state.theme === 'dark' ? 'light' : 'dark'
    }));
  },
  
  toggleHighlightRules: () => {
    set((state) => ({
      showHighlightRules: !state.showHighlightRules
    }));
  },
  
  // Search
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  
  setSearchResults: (results) => {
    set({ searchResults: results });
  },
  
  setSearchOptions: (options) => {
    set((state) => ({
      searchOptions: { ...state.searchOptions, ...options }
    }));
  },
  
  // Global search
  setGlobalSearchQuery: (query) => {
    set({ globalSearchQuery: query });
  },
  
  setGlobalSearchResults: (results) => {
    set({ globalSearchResults: results });
  },
  
  setGlobalSearchOptions: (options) => {
    set((state) => ({
      globalSearchOptions: { ...state.globalSearchOptions, ...options }
    }));
  },
  
  toggleGlobalSearch: () => {
    set((state) => ({
      showGlobalSearch: !state.showGlobalSearch
    }));
  },
  
  // Getters
  getActiveTab: () => {
    const state = get();
    return state.tabs.find(tab => tab.id === state.activeTabId);
  },
  
  getTabById: (id) => {
    const state = get();
    return state.tabs.find(tab => tab.id === id);
  },

  // Reset store to default state
  resetToDefaults: () => {
    // Clear localStorage to force a complete reset
    localStorage.removeItem('log-viewer-storage');
    
    set({
      highlightRules: [
        { id: '1', regex: 'ERROR', color: '#ef4444', caseSensitive: false },
        { id: '2', regex: 'GET', color: '#eab308', caseSensitive: false },
        { id: '3', regex: 'INFO', color: '#3b82f6', caseSensitive: false },
        { id: '4', regex: 'POST', color: '#8b5cf6', caseSensitive: false },
        { id: '5', regex: 'WARN', color: '#fbbf24', caseSensitive: false },
        { id: '6', regex: 'warning', color: '#f97316', caseSensitive: false },
      ],
      wrapMode: 'on',
      theme: 'dark',
      showHighlightRules: true,
      searchOptions: {
        matchCase: false,
        useRegex: false,
      },
      globalSearchOptions: {
        matchCase: false,
        useRegex: false,
      },
      showGlobalSearch: false,
    });
  }
}));

export default useStore;