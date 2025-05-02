
/**
 * Validates email format
 * @param email Email to validate
 * @returns Boolean indicating if the email format is valid
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Checks if the email is one of the special known users
 * @param email Email to check
 * @returns Boolean indicating if it's a special user
 */
export const isSpecialUser = (email: string): boolean => {
  const specialUsers = ['antonio_yupa@sergen.pe'];
  return specialUsers.includes(email.toLowerCase().trim());
};

/**
 * Gets the known ID for a special user
 * @param email Email of the special user
 * @returns The known user ID or null if not a special user
 */
export const getSpecialUserId = (email: string): string | null => {
  if (email.toLowerCase().trim() === 'antonio_yupa@sergen.pe') {
    return 'b99fc3a6-9529-43c8-8fc6-18ec986b1c25';
  }
  return null;
};
