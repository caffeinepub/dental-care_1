import { useState, useEffect } from 'react';

const ADMIN_AUTH_KEY = 'admin_authenticated';
const ADMIN_USERNAME = '6352174912';
const ADMIN_PASSWORD = '63521';

/**
 * Custom hook to manage admin authentication state with sessionStorage persistence
 * Simple username/password validation without Internet Identity
 */
export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

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
  };
}
