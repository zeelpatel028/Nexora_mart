/**
 * Centralized Input Validation Utilities
 */

/**
 * Standard email format check
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Password strength check (at least 6 characters)
 */
export const isValidPassword = (password, minLength = 6) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= minLength;
};

/**
 * Basic phone number format check (digits, spaces, hyphens, plus)
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.trim().replace(/\s+/g, ''));
};

/**
 * Sanitizes input string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim();
};
