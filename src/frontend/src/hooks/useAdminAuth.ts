import { useState, useEffect } from 'react';

const ADMIN_AUTH_KEY = 'admin_authenticated';
const ADMIN_USERNAME = 'ANAS';
const ADMIN_PASSWORD = 'Anas@2020';

/**
 * Custom hook to manage admin authentication state with sessionStorage persistence
 */
export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check sessionStorage on mount
  useEffect(() => {
    const adminAuth = sessionStorage.getItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(adminAuth === 'true');
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
  const loginAdmin = (username: string, password: string): boolean => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
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
