import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // Tab management
      tabs: [],
      activeTabId: null,
      
      // Highlight rules
      highlightRules: [
        { id: '1', regex: 'ERROR', color: '#ef4444', caseSensitive: false },
        { id: '2', regex: 'GET', color: '#eab308', caseSensitive: false },
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
      
      // Getters
      getActiveTab: () => {
        const state = get();
        return state.tabs.find(tab => tab.id === state.activeTabId);
      },
      
      getTabById: (id) => {
        const state = get();
        return state.tabs.find(tab => tab.id === id);
      }
    }),
    {
      name: 'log-viewer-storage',
      partialize: (state) => ({
        highlightRules: state.highlightRules,
        wrapMode: state.wrapMode,
        theme: state.theme,
        searchOptions: state.searchOptions,
        showHighlightRules: state.showHighlightRules,
        // Don't persist tabs to avoid content mixing issues
      }),
    }
  )
);

export default useStore;