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
    const isAuth = adminAuth === 'true';
    console.log('[useAdminAuth] ===== ADMIN AUTH INITIALIZATION =====');
    console.log('[useAdminAuth] Initializing admin auth state:', {
      timestamp: new Date().toISOString(),
      isAuthenticated: isAuth,
      sessionStorageValue: adminAuth,
      sessionStorageKeys: Object.keys(sessionStorage),
    });
    setIsAuthenticated(isAuth);
  }, []);

  /**
   * Check if admin is currently authenticated
   */
  const checkIsAdminAuthenticated = (): boolean => {
    const isAuth = sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    console.log('[useAdminAuth] Checking admin authentication:', {
      timestamp: new Date().toISOString(),
      isAuthenticated: isAuth,
      sessionStorageValue: sessionStorage.getItem(ADMIN_AUTH_KEY),
    });
    return isAuth;
  };

  /**
   * Attempt to login with provided credentials
   * @returns true if login successful, false otherwise
   */
  const loginAdmin = (username: string, password: string): boolean => {
    console.log('[useAdminAuth] ===== ADMIN LOGIN ATTEMPT =====');
    console.log('[useAdminAuth] Login attempt:', {
      timestamp: new Date().toISOString(),
      username,
      passwordLength: password.length,
      expectedUsername: ADMIN_USERNAME,
      expectedPasswordLength: ADMIN_PASSWORD.length,
      usernameMatch: username === ADMIN_USERNAME,
      passwordMatch: password === ADMIN_PASSWORD,
    });

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      setIsAuthenticated(true);
      console.log('[useAdminAuth] ===== LOGIN SUCCESSFUL =====');
      console.log('[useAdminAuth] Login successful:', {
        timestamp: new Date().toISOString(),
        username,
        sessionStorageSet: sessionStorage.getItem(ADMIN_AUTH_KEY),
      });
      return true;
    }
    
    console.log('[useAdminAuth] ===== LOGIN FAILED =====');
    console.log('[useAdminAuth] Login failed: Invalid credentials');
    return false;
  };

  /**
   * Logout admin and clear session
   */
  const logoutAdmin = (): void => {
    console.log('[useAdminAuth] ===== ADMIN LOGOUT =====');
    console.log('[useAdminAuth] Logging out admin:', {
      timestamp: new Date().toISOString(),
      wasAuthenticated: isAuthenticated,
    });
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(false);
    console.log('[useAdminAuth] Logout complete, sessionStorage cleared');
  };

  return {
    isAuthenticated,
    checkIsAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
  };
}
