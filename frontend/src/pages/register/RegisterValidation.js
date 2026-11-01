/**
 * Register Form Validation Logic
 */
import { isValidEmail } from '../../utils';

export const validateRegisterForm = (formData) => {
  if (!formData.firstName || !formData.firstName.trim()) {
    return { isValid: false, error: 'Please enter your first name', field: 'firstName' };
  }
  if (!formData.surname || !formData.surname.trim()) {
    return { isValid: false, error: 'Please enter your surname', field: 'surname' };
  }
  if (!formData.email || !formData.email.trim()) {
    return { isValid: false, error: 'Please enter your email address', field: 'email' };
  }
  if (!isValidEmail(formData.email)) {
    return { isValid: false, error: 'Please enter a valid email address', field: 'email' };
  }
  if (!formData.phone || !formData.phone.trim()) {
    return { isValid: false, error: 'Please enter your phone number', field: 'phone' };
  }
  if (!formData.storeType) {
    return { isValid: false, error: 'Please select your store type', field: 'storeType' };
  }
  if (!formData.password) {
    return { isValid: false, error: 'Please enter a password', field: 'password' };
  }
  if (formData.password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters', field: 'password' };
  }
  if (formData.password !== formData.confirmPassword) {
    return { isValid: false, error: 'Passwords do not match', field: 'confirmPassword' };
  }

  return { isValid: true, error: '', field: null };
};

export default validateRegisterForm;
