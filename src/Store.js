import { useState, useEffect } from 'react';
import { createContainer } from 'react-tracked';

import { loadState, saveState } from './Helpers';

const globalState = {
  // Declare your global variable and functions here
  layoutMode: 'static',
  layoutColorMode: 'dark',
  currencies: [],
  currentCurrency: null,
  user: null,
  isAuthenticated: false
};

const useLocalState = () => {
  const [processedState, setProcessedState] = useState(() => {
    const savedState = loadState();
    if (savedState) {
      // Check if user data exists in localStorage on app start
      const savedUser = localStorage.getItem('user');
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      
      if (savedUser && isAuthenticated) {
        try {
          return {
            ...savedState,
            user: JSON.parse(savedUser),
            isAuthenticated: true
          };
        } catch (error) {
          console.error('Error parsing saved user data:', error);
        }
      }
    }
    return globalState;
  });
  
  useEffect(() => {
    saveState(processedState);
  }, [processedState]);
  
  return [processedState, setProcessedState];
};

export const { Provider, useTracked } = createContainer(useLocalState);
