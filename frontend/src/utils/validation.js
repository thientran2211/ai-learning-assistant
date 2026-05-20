/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Get validation status
 */
export const getEmailError = (email) => {
  if (!email) return null;
  if (!isValidEmail(email)) {
    return 'invalid_format';
  }
  return null;
};