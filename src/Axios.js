import axios from 'axios';
import { host } from "./API";
import { auth } from './firebase';
import { signOut } from 'firebase/auth';

axios.defaults.baseURL = host;
axios.defaults.headers['Content-Type'] = 'application/json';

axios.interceptors.request.use(
  async (config) => {
    try {
      // Skip auth for login/register endpoints
      const url = config.url?.split('/') || [];
      const lastSegment = url[url.length - 1];
      
      if (lastSegment === 'login' || lastSegment === 'register') {
        delete config.headers.Authorization;
        return config;
      }

      // Get Firebase ID token if user is authenticated
      if (auth.currentUser) {
        const idToken = await auth.currentUser.getIdToken();
        config.headers['Authorization'] = `Bearer ${idToken}`;
      }
    } catch (error) {
      console.error('Error getting Firebase ID token:', error);
      // Continue without token if there's an error
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response } = error;
    
    if (response?.status === 401) {
      // Token expired or invalid, sign out user
      try {
        await logout();
      } catch (logoutError) {
        console.error('Error during logout:', logoutError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Logout a user
export const logout = () => {
  return signOut(auth)
    .then(() => {
      // Clear any remaining localStorage items
      localStorage.removeItem('user');
      localStorage.removeItem('token_created');
      localStorage.removeItem('access_token');
      localStorage.removeItem('expires_in');
      localStorage.removeItem('isAuthenticated');
      
      // Redirect to login page
      window.location.href = '/login';
      return true;
    })
    .catch((error) => {
      console.error('Logout error:', error);
      // Force logout even if Firebase signOut fails
      localStorage.clear();
      window.location.href = '/login';
      return false;
    });
};

export default axios;
