import React from 'react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import { Provider, useTracked } from './Store';
import Routes from './Routes';

import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './extra/nova-light.css';
import 'primeflex/primeflex.css';
import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';
import '@fullcalendar/list/main.css';
import './extra/layout.css'; // Sigma theme from primereact
import './extra/blueberry-orange.css'; // Custom theme made by me
import './App.css'; // Is for testing CSS

const app_name = process.env.REACT_APP_APP_NAME;

const AppContent = () => {
  const [state, setState] = useTracked();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          emailVerified: firebaseUser.emailVerified,
          photoURL: firebaseUser.photoURL,
          role: 'user' // Default role
        };
        
        setState(prev => ({ 
          ...prev, 
          user: userData,
          isAuthenticated: true 
        }));
        
        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
      } else {
        // User is signed out
        setState(prev => ({ 
          ...prev, 
          user: null,
          isAuthenticated: false 
        }));
        
        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_created');
        localStorage.removeItem('expires_in');
        localStorage.removeItem('isAuthenticated');
      }
    });

    return () => unsubscribe();
  }, [setState]);

  return <Routes />;
};

const App = () => (
  <Provider>
    <Helmet
      defaultTitle={app_name}
      titleTemplate={`%s | ${app_name}`}
      meta={[
        { name: 'title', content: 'Expense Tracker - Track and manage your expenses on the go' },
        { name: 'description', content: 'Expense Tracker - Track and manage your expenses on the go' },
        {
          name: 'keywords',
          content: 'expense,tracker,expense-tracker'
        },
        { name: 'og:url', content: 'domain' },
        { property: 'og:image', content: 'public_image_url' }
      ]}
    />
    <AppContent />
  </Provider>
);

export default App;
