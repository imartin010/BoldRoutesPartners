import { forwardRef } from 'react';
import { thousands } from '../utils/format';

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, placeholder = 'Enter amount', className = '', error }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value.replace(/,/g, ''); // Remove existing commas
      // Allow empty string or valid numbers
      if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
        onChange(inputValue);
      }
    };

    const displayValue = value ? thousands(parseFloat(value) || 0) : '';

    return (
      <div className="w-full">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-elegant-500 text-xs sm:text-sm">EGP</span>
          </div>
          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            placeholder={placeholder}
            className={`input pl-10 sm:pl-12 ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} ${className}`}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
