import React, { useState, useCallback, useEffect } from 'react';
import { z } from 'zod';
import { ValidationError } from '@/utils/errorHandling';

/**
 * Form validation hook using Zod schemas
 * Provides real-time validation feedback and error management
 * 
 * @example
 * const schema = z.object({
 *   folderName: z.string().min(1, 'Folder name is required').max(50, 'Folder name is too long'),
 *   folderRule: z.string().min(1, 'Folder rule is required'),
 * });
 * 
 * const { values, errors, setFieldValue, validateField, validateForm, isValid } = useFormValidation(schema, {
 *   folderName: '',
 *   folderRule: '',
 * });
 */
export interface UseFormValidationOptions<T> {
  /** Initial form values */
  initialValues: T;
  /** Validation mode: 'onChange' (real-time) or 'onSubmit' (on demand) */
  mode?: 'onChange' | 'onSubmit';
  /** Debounce delay in ms for onChange validation (default: 300) */
  debounceMs?: number;
  /** Callback when form is valid and submitted */
  onSubmit?: (values: T) => void | Promise<void>;
}

export interface UseFormValidationReturn<T> {
  /** Current form values */
  values: T;
  /** Set a field value and optionally validate */
  setFieldValue: <K extends keyof T>(field: K, value: T[K], validate?: boolean) => void;
  /** Set multiple field values at once */
  setValues: (newValues: Partial<T>) => void;
  /** Reset form to initial values */
  reset: () => void;
  /** Field-specific errors */
  errors: Partial<Record<keyof T, string>>;
  /** General form error (not field-specific) */
  formError: string | null;
  /** Set general form error */
  setFormError: (error: string | null) => void;
  /** Validate a specific field */
  validateField: (field: keyof T) => boolean;
  /** Validate entire form */
  validateForm: () => boolean;
  /** Check if form is valid */
  isValid: boolean;
  /** Check if form has been touched (any field modified) */
  isTouched: boolean;
  /** Clear all errors */
  clearErrors: () => void;
  /** Get error for a specific field */
  getFieldError: (field: keyof T) => string | undefined;
  /** Submit handler that validates before calling onSubmit */
  handleSubmit: () => Promise<void>;
}

export function useFormValidation<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  options: UseFormValidationOptions<T>
): UseFormValidationReturn<T> {
  const { initialValues, mode = 'onSubmit', debounceMs = 300, onSubmit } = options;
  
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Set<keyof T>>(new Set());
  const [debounceTimers, setDebounceTimers] = useState<Map<keyof T, ReturnType<typeof setTimeout>>>(new Map());
  const isMountedRef = React.useRef(true);

  // Clear debounce timers on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      debounceTimers.forEach(timer => clearTimeout(timer));
    };
  }, [debounceTimers]);

  // Validate a single field
  const validateField = useCallback(
    (field: keyof T): boolean => {
      try {
        // Validate the entire form but only track error for the specific field
        schema.parse(values);
        
        // Clear error if validation passes
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
        
        return true;
      } catch (error) {
        // Safely check for ZodError with issues array (Zod v3+ uses 'issues')
        if (error && typeof error === 'object' && 'issues' in error && error instanceof z.ZodError) {
          const zodError = error as z.ZodError;
          const issues = zodError.issues || [];
          
          if (Array.isArray(issues) && issues.length > 0) {
            const fieldError = issues.find((e: any) => {
              if (!e || typeof e !== 'object') return false;
              const path = e.path;
              return Array.isArray(path) && path.length > 0 && path[0] === String(field);
            });
            
            if (fieldError && fieldError.message) {
              setErrors(prev => ({
                ...prev,
                [field]: fieldError.message,
              }));
            } else {
              // Clear error if no error for this field
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
              });
            }
          } else {
            // No issues array or empty, clear field error
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[field];
              return newErrors;
            });
          }
        } else if (error && typeof error === 'object' && 'errors' in error) {
          // Fallback for older Zod versions
          const zodError = error as any;
          const errorList = zodError.errors || [];
          
          if (Array.isArray(errorList) && errorList.length > 0) {
            const fieldError = errorList.find((e: any) => {
              if (!e || typeof e !== 'object') return false;
              const path = e.path;
              return Array.isArray(path) && path.length > 0 && path[0] === String(field);
            });
            
            if (fieldError && fieldError.message) {
              setErrors(prev => ({
                ...prev,
                [field]: fieldError.message,
              }));
            } else {
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
              });
            }
          } else {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[field];
              return newErrors;
            });
          }
        } else {
          // If error is not a ZodError, just clear the field error
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
          });
        }
        
        return false;
      }
    },
    [values, schema]
  );

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    try {
      schema.parse(values);
      setErrors({});
      setFormError(null);
      return true;
    } catch (error) {
      // Handle ZodError with proper error extraction
      if (error && typeof error === 'object' && 'issues' in error) {
        // Zod v3+ uses 'issues' instead of 'errors'
        const zodError = error as z.ZodError;
        const issues = zodError.issues || [];
        const newErrors: Partial<Record<keyof T, string>> = {};
        
        issues.forEach((issue: any) => {
          if (issue && issue.path && Array.isArray(issue.path) && issue.path.length > 0) {
            const field = issue.path[0] as keyof T;
            if (field && issue.message && typeof issue.message === 'string' && !newErrors[field]) {
              newErrors[field] = issue.message;
            }
          }
        });
        
        setErrors(newErrors);
        // Always clear form error when we have field-specific errors
        setFormError(null);
        return false;
      } else if (error && typeof error === 'object' && 'errors' in error) {
        // Fallback for older Zod versions or different error structures
        const zodError = error as any;
        const errorList = zodError.errors || [];
        const newErrors: Partial<Record<keyof T, string>> = {};
        
        if (Array.isArray(errorList)) {
          errorList.forEach((err: any) => {
            if (err && err.path && Array.isArray(err.path) && err.path.length > 0) {
              const field = err.path[0] as keyof T;
              if (field && err.message && typeof err.message === 'string' && !newErrors[field]) {
                newErrors[field] = err.message;
              }
            }
          });
        }
        
        setErrors(newErrors);
        setFormError(null);
        return false;
      } else {
        // Unexpected error type
        setFormError('Validation failed. Please check your input.');
        return false;
      }
    }
  }, [values, schema]);

  // Set field value with optional validation
  const setFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K], validate = false) => {
      setValues(prev => ({ ...prev, [field]: value }));
      setTouchedFields(prev => new Set([...prev, field]));
      
      // Clear form error when user starts typing
      if (formError) {
        setFormError(null);
      }
      
      // Clear existing error for this field when user starts typing
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
      
      // Validate based on mode
      if (validate || mode === 'onChange') {
        // Clear existing debounce timer for this field
        const existingTimer = debounceTimers.get(field);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }
        
        // Debounce validation for onChange mode
        if (mode === 'onChange') {
          const timer = setTimeout(() => {
            // Only validate if component is still mounted
            if (isMountedRef.current) {
              try {
                validateField(field);
              } catch (err) {
                // Silently fail validation errors in debounced callback
                // to prevent unhandled promise rejections
                console.error('Validation error in debounced callback:', err);
              }
            }
            setDebounceTimers(prev => {
              const newTimers = new Map(prev);
              newTimers.delete(field);
              return newTimers;
            });
          }, debounceMs);
          
          setDebounceTimers(prev => new Map(prev).set(field, timer));
        } else {
          validateField(field);
        }
      }
    },
    [mode, debounceMs, validateField, errors, formError, debounceTimers]
  );

  // Set multiple values at once
  const setValuesMultiple = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
    setTouchedFields(prev => new Set([...prev, ...(Object.keys(newValues) as (keyof T)[])]));
  }, []);

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setFormError(null);
    setTouchedFields(new Set());
    debounceTimers.forEach(timer => clearTimeout(timer));
    setDebounceTimers(new Map());
  }, [initialValues, debounceTimers]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
    setFormError(null);
  }, []);

  // Get error for specific field
  const getFieldError = useCallback(
    (field: keyof T): string | undefined => {
      return errors[field];
    },
    [errors]
  );

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    setFormError(null);
    
    if (!validateForm()) {
      return;
    }
    
    if (onSubmit) {
      try {
        await onSubmit(values);
      } catch (error) {
        if (error instanceof ValidationError) {
          if (error.field) {
            setErrors(prev => ({
              ...prev,
              [error.field!]: error.message,
            }));
          } else {
            setFormError(error.message);
          }
        } else if (error instanceof Error) {
          setFormError(error.message);
        } else {
          setFormError('An unexpected error occurred. Please try again.');
        }
      }
    }
  }, [values, validateForm, onSubmit]);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0 && formError === null;

  // Check if form has been touched
  const isTouched = touchedFields.size > 0;

  return {
    values,
    setFieldValue,
    setValues: setValuesMultiple,
    reset,
    errors,
    formError,
    setFormError,
    validateField,
    validateForm,
    isValid,
    isTouched,
    clearErrors,
    getFieldError,
    handleSubmit,
  };
}

