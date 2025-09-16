import { InputHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  'form-input',
  {
    variants: {
      variant: {
        default: '',
        error: 'border-red-500 focus:ring-red-500',
      },
      size: {
        sm: 'px-3 py-2 text-sm min-h-[36px]',
        default: '',
        lg: 'px-4 py-4 text-lg min-h-[52px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, error, ...props }, ref) => {
    return (
      <input
        className={inputVariants({ 
          variant: error ? 'error' : variant, 
          size, 
          className 
        })}
        ref={ref}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
export type { InputProps };
