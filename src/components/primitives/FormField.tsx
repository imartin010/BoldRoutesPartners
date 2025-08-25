import { ReactNode } from 'react';

interface FormFieldProps {
  children: ReactNode;
  className?: string;
}

interface FormLabelProps {
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}

interface FormErrorProps {
  children: ReactNode;
  id?: string;
  className?: string;
}

interface FormHelpProps {
  children: ReactNode;
  id?: string;
  className?: string;
}

export function FormField({ children, className = '' }: FormFieldProps) {
  return (
    <div className={`form-field ${className}`}>
      {children}
    </div>
  );
}

export function FormLabel({ htmlFor, children, required, className = '' }: FormLabelProps) {
  return (
    <label 
      htmlFor={htmlFor} 
      className={`form-label ${className}`}
    >
      {children}
      {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
    </label>
  );
}

export function FormError({ children, id, className = '' }: FormErrorProps) {
  return (
    <p 
      id={id}
      className={`form-error ${className}`} 
      role="alert"
    >
      {children}
    </p>
  );
}

export function FormHelp({ children, id, className = '' }: FormHelpProps) {
  return (
    <p 
      id={id}
      className={`muted mt-1 ${className}`}
    >
      {children}
    </p>
  );
}
