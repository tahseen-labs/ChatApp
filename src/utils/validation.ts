import { VALIDATION } from '../constants/index';

export const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const isValidPassword = (password: string): boolean =>
  password.length >= VALIDATION.MIN_PASSWORD_LENGTH;

export const isValidUsername = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length >= VALIDATION.MIN_USERNAME_LENGTH && trimmed.length <= VALIDATION.MAX_USERNAME_LENGTH;
};

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validateLoginForm = (email: string, password: string): ValidationResult => {
  if (!email.trim()) return { valid: false, error: 'Email is required.' };
  if (!isValidEmail(email)) return { valid: false, error: 'Enter a valid email address.' };
  if (!password) return { valid: false, error: 'Password is required.' };
  return { valid: true };
};

export const validateRegisterForm = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): ValidationResult => {
  if (!isValidUsername(name)) {
    return {
      valid: false,
      error: `Name must be ${VALIDATION.MIN_USERNAME_LENGTH}-${VALIDATION.MAX_USERNAME_LENGTH} characters.`,
    };
  }
  if (!isValidEmail(email)) return { valid: false, error: 'Enter a valid email address.' };
  if (!isValidPassword(password)) {
    return { valid: false, error: `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters.` };
  }
  if (password !== confirmPassword) return { valid: false, error: 'Passwords do not match.' };
  return { valid: true };
};
