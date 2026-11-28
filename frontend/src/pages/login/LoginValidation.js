/**
 * Login Form Validation Logic
 */
import { isValidEmail } from '../../utils';

export const validateLoginForm = ({ email, password }) => {
  if (!email || !email.trim()) {
    return {
      isValid: false,
      error: 'Please enter your email address',
      field: 'email'
    };
  }

  if (!isValidEmail(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
      field: 'email'
    };
  }

  if (!password) {
    return {
      isValid: false,
      error: 'Please enter your password',
      field: 'password'
    };
  }

  return {
    isValid: true,
    error: '',
    field: null
  };
};

export default validateLoginForm;
