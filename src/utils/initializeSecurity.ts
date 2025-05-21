
import { enforceHttps, setSecurityHeaders, checkSessionSecurity } from './securityUtils';

/**
 * Initialize all security features for the application
 */
export const initializeAppSecurity = (): void => {
  enforceHttps();
  setSecurityHeaders();
  
  // Additional security measures
  if (!checkSessionSecurity()) {
    console.warn('Session security check failed');
    // Could implement additional security measures here
  }
};
