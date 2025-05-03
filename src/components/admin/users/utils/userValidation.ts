
/**
 * Valida si el correo electrónico tiene un formato válido
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Valida si la contraseña cumple con los requisitos mínimos
 */
export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};
