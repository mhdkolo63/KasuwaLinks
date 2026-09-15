export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+?234|0)?[\d\s-]{10,14}$/;
  return phoneRegex.test(phone.trim());
}

export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function validatePrice(price: string): { valid: boolean; value?: number } {
  const num = parseFloat(price);
  if (isNaN(num) || num < 0) return { valid: false };
  return { valid: true, value: num };
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateSignIn(email: string, password: string): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address.' });
  }
  if (!isValidPassword(password)) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters.' });
  }
  return errors;
}

export function validateSignUp(
  fullName: string,
  email: string,
  password: string,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!isNonEmpty(fullName)) {
    errors.push({ field: 'fullName', message: 'Please enter your full name.' });
  }
  if (!isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address.' });
  }
  if (!isValidPassword(password)) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters.' });
  }
  return errors;
}
