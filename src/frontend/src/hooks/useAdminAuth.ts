import { useState, useEffect } from 'react';
import { useInternetIdentity } from './useInternetIdentity';

const ADMIN_AUTH_KEY = 'admin_authenticated';
const ADMIN_USERNAME = '6352174912';
const ADMIN_PASSWORD = '63521';

/**
 * Custom hook to manage admin authentication state with sessionStorage persistence
 * Integrates with Internet Identity for backend authorization
 */
export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { identity, login: iiLogin, loginStatus } = useInternetIdentity();

  // Check sessionStorage on mount
  useEffect(() => {
    const adminAuth = sessionStorage.getItem(ADMIN_AUTH_KEY);
    const isAuth = adminAuth === 'true';
    setIsAuthenticated(isAuth);
  }, []);

  /**
   * Check if admin is currently authenticated
   */
  const checkIsAdminAuthenticated = (): boolean => {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  };

  /**
   * Attempt to login with provided credentials
   * @returns true if login successful, false otherwise
   */
  const loginAdmin = async (username: string, password: string): Promise<boolean> => {
    // Exact string matching for both username and password
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // First ensure Internet Identity is authenticated
      if (!identity) {
        try {
          await iiLogin();
          // Wait a bit for identity to be set
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error('[useAdminAuth] Failed to authenticate with Internet Identity:', error);
          return false;
        }
      }
      
      // Set admin authentication flag
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      setIsAuthenticated(true);
      return true;
    }
    
    return false;
  };

  /**
   * Logout admin and clear session
   */
  const logoutAdmin = (): void => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    checkIsAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
    isLoggingIn: loginStatus === 'logging-in',
    hasIdentity: !!identity,
  };
}
