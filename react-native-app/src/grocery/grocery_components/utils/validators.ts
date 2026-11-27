/**
 * Form Validation Utilities
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

export const isValidPhone = (phone: string): boolean => {
  const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
  return re.test(phone.trim());
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Must contain at least one uppercase letter (A-Z)' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Must contain at least one lowercase letter (a-z)' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Must contain at least one number (0-9)' };
  }
  if (!/[@$!%*?&#^()_+\-=\[\]{}|;:,.<>~`'"\\/]/.test(password)) {
    return { isValid: false, message: 'Must contain at least one special character (e.g. @#$!)' };
  }
  return { isValid: true };
};

