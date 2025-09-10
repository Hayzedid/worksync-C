import React, { useState, useEffect } from 'react';
import { ValidationRule, validateField, ValidationResult } from '../lib/validation';

interface ValidatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  rules?: ValidationRule;
  showErrors?: boolean;
  onChange?: (value: string, isValid: boolean) => void;
  onValidationChange?: (result: ValidationResult) => void;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  rules = {},
  showErrors = true,
  onChange,
  onValidationChange,
  className = '',
  value = '',
  ...props
}) => {
  const [inputValue, setInputValue] = useState<string>(String(value));
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] });
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const validationResult = validateField(newValue, rules);
    setValidation(validationResult);
    
    onChange?.(newValue, validationResult.isValid);
    onValidationChange?.(validationResult);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const showErrorState = touched && showErrors && !validation.isValid;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {rules.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        {...props}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] focus:border-transparent
          ${showErrorState 
            ? 'border-red-300 bg-red-50' 
            : 'border-gray-300 bg-white'
          }
          ${className}
        `}
      />
      {showErrorState && validation.errors.length > 0 && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

interface ValidatedTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label?: string;
  rules?: ValidationRule;
  showErrors?: boolean;
  onChange?: (value: string, isValid: boolean) => void;
  onValidationChange?: (result: ValidationResult) => void;
}

export const ValidatedTextarea: React.FC<ValidatedTextareaProps> = ({
  label,
  rules = {},
  showErrors = true,
  onChange,
  onValidationChange,
  className = '',
  value = '',
  ...props
}) => {
  const [inputValue, setInputValue] = useState<string>(String(value));
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] });
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const validationResult = validateField(newValue, rules);
    setValidation(validationResult);
    
    onChange?.(newValue, validationResult.isValid);
    onValidationChange?.(validationResult);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const showErrorState = touched && showErrors && !validation.isValid;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {rules.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        {...props}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm resize-vertical
          focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] focus:border-transparent
          ${showErrorState 
            ? 'border-red-300 bg-red-50' 
            : 'border-gray-300 bg-white'
          }
          ${className}
        `}
      />
      {showErrorState && validation.errors.length > 0 && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}
      {rules.maxLength && (
        <p className="text-xs text-gray-500 text-right">
          {inputValue.length}/{rules.maxLength}
        </p>
      )}
    </div>
  );
};

interface ValidatedSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  rules?: ValidationRule;
  showErrors?: boolean;
  options: { value: string; label: string }[];
  onChange?: (value: string, isValid: boolean) => void;
  onValidationChange?: (result: ValidationResult) => void;
}

export const ValidatedSelect: React.FC<ValidatedSelectProps> = ({
  label,
  rules = {},
  showErrors = true,
  options,
  onChange,
  onValidationChange,
  className = '',
  value = '',
  ...props
}) => {
  const [selectValue, setSelectValue] = useState<string>(String(value));
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] });
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setSelectValue(String(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectValue(newValue);
    
    const validationResult = validateField(newValue, rules);
    setValidation(validationResult);
    
    onChange?.(newValue, validationResult.isValid);
    onValidationChange?.(validationResult);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const showErrorState = touched && showErrors && !validation.isValid;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {rules.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        {...props}
        value={selectValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] focus:border-transparent
          ${showErrorState 
            ? 'border-red-300 bg-red-50' 
            : 'border-gray-300 bg-white'
          }
          ${className}
        `}
      >
        <option value="">Select an option...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {showErrorState && validation.errors.length > 0 && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

// Form wrapper component
interface ValidatedFormProps {
  onSubmit: (data: Record<string, any>, isValid: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export const ValidatedForm: React.FC<ValidatedFormProps> = ({
  onSubmit,
  children,
  className = ''
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formValidation, setFormValidation] = useState<Record<string, boolean>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = Object.values(formValidation).every(Boolean);
    onSubmit(formData, isValid);
  };

  const updateField = (name: string, value: any, isValid: boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormValidation(prev => ({ ...prev, [name]: isValid }));
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const childProps = child.props as any;
          if (childProps.name) {
            return React.cloneElement(child as any, {
              onChange: (value: any, isValid: boolean) => {
                updateField(childProps.name, value, isValid);
                childProps.onChange?.(value, isValid);
              }
            });
          }
        }
        return child;
      })}
    </form>
  );
};
