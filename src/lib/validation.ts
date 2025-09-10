export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  numeric?: boolean;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateField = (value: any, rules: ValidationRule): ValidationResult => {
  const errors: string[] = [];

  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    errors.push('This field is required');
    return { isValid: false, errors };
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: true, errors: [] };
  }

  const stringValue = String(value).trim();

  // Length validations
  if (rules.minLength && stringValue.length < rules.minLength) {
    errors.push(`Must be at least ${rules.minLength} characters long`);
  }

  if (rules.maxLength && stringValue.length > rules.maxLength) {
    errors.push(`Must be no more than ${rules.maxLength} characters long`);
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    errors.push('Invalid format');
  }

  // Email validation
  if (rules.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(stringValue)) {
      errors.push('Please enter a valid email address');
    }
  }

  // URL validation
  if (rules.url) {
    try {
      new URL(stringValue);
    } catch {
      errors.push('Please enter a valid URL');
    }
  }

  // Numeric validation
  if (rules.numeric) {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      errors.push('Must be a valid number');
    } else {
      if (rules.min !== undefined && numValue < rules.min) {
        errors.push(`Must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && numValue > rules.max) {
        errors.push(`Must be no more than ${rules.max}`);
      }
    }
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      errors.push(customError);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, ValidationRule>
): Record<string, ValidationResult> => {
  const results: Record<string, ValidationResult> = {};

  Object.keys(rules).forEach(field => {
    results[field] = validateField(data[field], rules[field]);
  });

  return results;
};

// Common validation rules
export const validationRules = {
  email: {
    required: true,
    email: true,
    maxLength: 100
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 50,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/
  },
  title: {
    required: true,
    minLength: 1,
    maxLength: 100
  },
  description: {
    maxLength: 500
  },
  url: {
    url: true
  },
  phone: {
    pattern: /^\+?[\d\s\-\(\)]+$/
  }
};

// Validation utility functions
export const isValidEmail = (email: string): boolean => {
  return validateField(email, { email: true }).isValid;
};

export const isValidPassword = (password: string): boolean => {
  return validateField(password, validationRules.password).isValid;
};

export const getPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return { score: 0, feedback: ['Password is required'] };
  }

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Use at least 8 characters');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include lowercase letters');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include uppercase letters');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include numbers');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include special characters');
  }

  // Length bonus
  if (password.length >= 12) {
    score += 1;
  }

  return { score, feedback };
};
