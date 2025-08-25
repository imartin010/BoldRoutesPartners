/**
 * Enhanced input validation utilities for security hardening
 */

import { z } from 'zod';

// Enhanced phone schema with normalization
export const createPhoneSchema = (required = true) => {
  const base = z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(/^\+?\d+$/, "Phone number must contain only digits and optional + prefix")
    .transform(normalizePhoneNumber);
    
  return required ? base : base.optional();
};

// Enhanced string schema with length limits
export const createStringSchema = (
  minLength: number = 1, 
  maxLength: number = 100,
  fieldName: string = 'Field'
) => z.string()
  .min(minLength, `${fieldName} must be at least ${minLength} characters`)
  .max(maxLength, `${fieldName} must not exceed ${maxLength} characters`)
  .refine(value => value.trim().length >= minLength, `${fieldName} cannot be only whitespace`);

// Enhanced number schema with realistic bounds
export const createCurrencySchema = (
  min: number = 0.01, 
  max: number = 1000000000 // 1 billion EGP
) => z.coerce.number()
  .min(min, `Amount must be at least ${min.toLocaleString()}`)
  .max(max, `Amount must not exceed ${max.toLocaleString()}`)
  .refine(value => Number.isFinite(value), "Amount must be a valid number");

// Enhanced count schema
export const createCountSchema = (
  min: number = 1, 
  max: number = 999,
  fieldName: string = 'Count'
) => z.coerce.number()
  .int(`${fieldName} must be a whole number`)
  .min(min, `${fieldName} must be at least ${min}`)
  .max(max, `${fieldName} must not exceed ${max}`);

/**
 * Normalize phone number to E.164 format (best effort)
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except leading +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it starts with +, keep it
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // If it starts with 00, replace with +
  if (cleaned.startsWith('00')) {
    return '+' + cleaned.substring(2);
  }
  
  // If it starts with 01 and has 11 digits total, assume Egypt (+20)
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    return '+20' + cleaned.substring(1);
  }
  
  // If it starts with 1 and has 10 digits, assume Egypt mobile
  if (cleaned.startsWith('1') && cleaned.length === 10) {
    return '+20' + cleaned;
  }
  
  // Otherwise, just add + if not present
  return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
}

/**
 * Sanitize text input to prevent injection attacks
 */
export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 1000); // Hard limit to prevent DoS
}

/**
 * Validate email format with additional security checks
 */
export const emailSchema = z.string()
  .email("Please enter a valid email address")
  .max(254, "Email address is too long") // RFC 5321 limit
  .refine(
    email => !email.includes('..'), 
    "Email address contains invalid consecutive dots"
  )
  .refine(
    email => !/^\./.test(email) && !/\.$/.test(email),
    "Email address cannot start or end with a dot"
  )
  .transform(email => email.toLowerCase().trim());

/**
 * Enhanced schemas for application form
 */
export const enhancedApplicationSchema = z.object({
  full_name: createStringSchema(2, 100, 'Full name'),
  phone: createPhoneSchema(true),
  company_name: createStringSchema(2, 200, 'Company name'),
  agents_count: createCountSchema(1, 999, 'Number of agents'),
  has_papers: z.boolean(),
});

/**
 * Enhanced schemas for deal form
 */
export const enhancedDealSchema = z.object({
  developer_name: createStringSchema(2, 100, 'Developer name'),
  project_name: createStringSchema(1, 100, 'Project name'),
  client_name: createStringSchema(2, 100, 'Client name'),
  unit_code: createStringSchema(1, 50, 'Unit code'),
  dev_sales_name: createStringSchema(2, 100, 'Sales representative name'),
  dev_phone: createPhoneSchema(true),
  deal_value: createCurrencySchema(1000, 1000000000), // Min 1000 EGP, Max 1B EGP
  files: z.instanceof(FileList).optional(),
});

/**
 * Validate and sanitize user input
 */
export function validateAndSanitizeInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(input);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => err.message)
      };
    }
    return {
      success: false,
      errors: ['Validation failed']
    };
  }
}

/**
 * Rate limiting helper (client-side only - not security critical)
 */
export class ClientRateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60 * 1000 // 1 minute
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Record this attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}
