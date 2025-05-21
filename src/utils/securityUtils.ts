
/**
 * Security utility functions for the application
 */

import { toast } from 'sonner';

/**
 * Enforce HTTPS in production environments
 * Redirects HTTP requests to HTTPS
 */
export const enforceHttps = (): void => {
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'http:' &&
    window.location.hostname !== 'localhost'
  ) {
    window.location.href = window.location.href.replace('http:', 'https:');
  }
};

/**
 * Set security-related HTTP headers
 * These headers help protect against common web vulnerabilities
 */
export const setSecurityHeaders = (): void => {
  if (typeof document !== 'undefined') {
    // Content Security Policy - restricts which resources can be loaded
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.gpteng.co https://checkout.razorpay.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.googleapis.com https://cdn.gpteng.co; img-src 'self' data: https://*.supabase.co https://cdn.gpteng.co; style-src 'self' 'unsafe-inline'; frame-src 'self' https://checkout.razorpay.com;";
    document.head.appendChild(cspMeta);

    // X-Frame-Options - prevents clickjacking attacks
    const xfoMeta = document.createElement('meta');
    xfoMeta.httpEquiv = 'X-Frame-Options';
    xfoMeta.content = 'SAMEORIGIN';
    document.head.appendChild(xfoMeta);

    // Strict Transport Security - forces HTTPS connections
    const hstsMeta = document.createElement('meta');
    hstsMeta.httpEquiv = 'Strict-Transport-Security';
    hstsMeta.content = 'max-age=31536000; includeSubDomains; preload';
    document.head.appendChild(hstsMeta);

    // X-Content-Type-Options - prevents MIME type sniffing
    const xctoMeta = document.createElement('meta');
    xctoMeta.httpEquiv = 'X-Content-Type-Options';
    xctoMeta.content = 'nosniff';
    document.head.appendChild(xctoMeta);

    // Referrer Policy - controls what information is sent in the Referer header
    const referrerMeta = document.createElement('meta');
    referrerMeta.name = 'referrer';
    referrerMeta.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(referrerMeta);
  }
};

/**
 * Check password strength and return a score and feedback
 * @param password The password to check
 * @returns Object containing score (0-4) and feedback messages
 */
export const checkPasswordStrength = (password: string): { score: number; feedback: string } => {
  // Initialize with lowest score
  let score = 0;
  const feedback: string[] = [];

  if (!password) {
    return { score: 0, feedback: 'Please enter a password' };
  }

  // Length check
  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
  } else {
    score += 1;
  }

  // Complexity checks
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add uppercase letters');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add lowercase letters');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add numbers');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add special characters');
  }

  // Common patterns check
  if (/12345|qwerty|password|admin|user/i.test(password)) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common patterns');
  }

  // Ensure score is within bounds
  score = Math.min(4, score);

  // Generate feedback message based on score
  let feedbackMessage = '';
  
  if (feedback.length > 0) {
    feedbackMessage = feedback.join('. ');
  } else {
    switch(score) {
      case 4:
        feedbackMessage = 'Very strong password';
        break;
      case 3:
        feedbackMessage = 'Strong password';
        break;
      case 2:
        feedbackMessage = 'Moderate password';
        break;
      default:
        feedbackMessage = 'Weak password';
    }
  }

  return { score, feedback: feedbackMessage };
};
