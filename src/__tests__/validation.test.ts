import { describe, it, expect } from '@jest/globals';
import { 
  validateField, 
  validateForm, 
  isValidEmail, 
  isValidPassword, 
  getPasswordStrength 
} from '../lib/validation';

describe('Validation Library', () => {
  describe('validateField', () => {
    it('should validate required fields', () => {
      const result = validateField('', { required: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });

    it('should validate email format', () => {
      const invalidResult = validateField('invalid-email', { email: true });
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Please enter a valid email address');

      const validResult = validateField('test@example.com', { email: true });
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);
    });

    it('should validate minimum length', () => {
      const result = validateField('abc', { minLength: 5 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Must be at least 5 characters long');
    });

    it('should validate maximum length', () => {
      const result = validateField('abcdefghijk', { maxLength: 5 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Must be no more than 5 characters long');
    });

    it('should validate patterns', () => {
      const result = validateField('abc123', { pattern: /^[a-zA-Z]+$/ });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid format');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('getPasswordStrength', () => {
    it('should return low score for weak passwords', () => {
      const result = getPasswordStrength('weak');
      expect(result.score).toBeLessThan(3);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should return high score for strong passwords', () => {
      const result = getPasswordStrength('StrongP@ssw0rd123');
      expect(result.score).toBeGreaterThanOrEqual(4);
    });

    it('should provide helpful feedback', () => {
      const result = getPasswordStrength('password');
      expect(result.feedback).toContain('Include uppercase letters');
      expect(result.feedback).toContain('Include numbers');
    });
  });

  describe('validateForm', () => {
    it('should validate multiple fields', () => {
      const data = {
        email: 'invalid-email',
        password: 'weak'
      };
      
      const rules = {
        email: { required: true, email: true },
        password: { required: true, minLength: 8 }
      };
      
      const results = validateForm(data, rules);
      
      expect(results.email.isValid).toBe(false);
      expect(results.password.isValid).toBe(false);
    });
  });
});
