/**
 * Validation utilities for dekantihr.com
 */

/**
 * Format a UTC ISO date string to Croatian local time.
 * Croatia is Europe/Zagreb (UTC+1 winter, UTC+2 summer).
 * 
 * @param dateStr - ISO 8601 string from Supabase (e.g. "2026-05-21T13:42:45.328656+00:00")
 * @param opts - optional: 'date' (21.05.2026), 'datetime' (21.05.2026. 15:42), 'time' (15:42)
 */
export function formatDate(dateStr: string | null | undefined, opts: 'date' | 'datetime' | 'time' = 'datetime'): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const locale = 'hr-HR';
    const tz = 'Europe/Zagreb';

    if (opts === 'date') {
      return d.toLocaleDateString(locale, { timeZone: tz, day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    if (opts === 'time') {
      return d.toLocaleTimeString(locale, { timeZone: tz, hour: '2-digit', minute: '2-digit' });
    }
    // datetime
    return d.toLocaleString(locale, {
      timeZone: tz,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

// ============================================================
// EMAIL VALIDATION
// ============================================================

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

// ============================================================
// PASSWORD VALIDATION
// ============================================================

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Validation result with errors
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Lozinka mora imati najmanje 8 znakova');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Lozinka mora sadržavati barem jedno veliko slovo');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Lozinka mora sadržavati barem jedno malo slovo');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Lozinka mora sadržavati barem jedan broj');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Lozinka mora sadržavati barem jedan poseban znak');
  }

  // Check against common passwords
  const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'password123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Lozinka je previše uobičajena');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================
// PHONE NUMBER VALIDATION
// ============================================================

/**
 * Validates Croatian phone number format
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export function isValidCroatianPhone(phone: string): boolean {
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Croatian phone formats:
  // +385XXXXXXXXX (international)
  // 0XXXXXXXXX (national)
  const phoneRegex = /^(\+385|0)[1-9]\d{7,8}$/;

  return phoneRegex.test(cleaned);
}

// ============================================================
// POSTAL CODE VALIDATION
// ============================================================

/**
 * Validates Croatian postal code format
 * @param postalCode - Postal code to validate
 * @returns true if valid, false otherwise
 */
export function isValidCroatianPostalCode(postalCode: string): boolean {
  // Croatian postal codes are 5 digits (10000-59999)
  const postalRegex = /^[1-5]\d{4}$/;
  return postalRegex.test(postalCode);
}

// ============================================================
// INPUT SANITIZATION
// ============================================================

/**
 * Sanitizes user input by removing potentially dangerous characters
 * @param input - Input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  // Remove HTML tags and script tags
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Validates and sanitizes search query
 * @param query - Search query to validate
 * @returns Validation result with sanitized query or error
 */
export function validateSearchQuery(query: string): { valid: boolean; sanitized?: string; error?: string } {
  const trimmed = query.trim();

  if (!trimmed) {
    return { valid: false, error: 'Unesite pojam za pretragu' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Pretraga je ograničena na 100 znakova' };
  }

  // Sanitize special characters
  const sanitized = sanitizeInput(trimmed);

  return { valid: true, sanitized };
}

// ============================================================
// QUANTITY VALIDATION
// ============================================================

/**
 * Validates product quantity
 * @param quantity - Quantity to validate
 * @param maxStock - Maximum available stock
 * @returns Validation result with error if invalid
 */
export function validateQuantity(quantity: number, maxStock: number): { valid: boolean; error?: string } {
  if (quantity < 1) {
    return { valid: false, error: 'Količina mora biti najmanje 1' };
  }

  if (quantity > maxStock) {
    return { valid: false, error: `Dostupno samo ${maxStock} komada` };
  }

  if (!Number.isInteger(quantity)) {
    return { valid: false, error: 'Količina mora biti cijeli broj' };
  }

  return { valid: true };
}
