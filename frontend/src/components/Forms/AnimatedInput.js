import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';

const AnimatedInput = forwardRef(({ 
  type = 'text', 
  label, 
  error, 
  success, 
  icon, 
  helperText, 
  required = false,
  className = '',
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    setHasValue(e.target.value.length > 0);
    if (props.onBlur) props.onBlur(e);
  };

  const handleChange = (e) => {
    setHasValue(e.target.value.length > 0);
    if (props.onChange) props.onChange(e);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const getInputClasses = () => {
    const baseClasses = 'w-full px-4 py-3 border-2 rounded-lg transition-all duration-300 focus:outline-none';
    const focusClasses = isFocused ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-300';
    const stateClasses = error 
      ? 'border-red-500 ring-2 ring-red-200' 
      : success 
      ? 'border-green-500 ring-2 ring-green-200' 
      : '';
    
    return `${baseClasses} ${focusClasses} ${stateClasses} ${className}`;
  };

  const getLabelClasses = () => {
    const baseClasses = 'block text-sm font-medium mb-2 transition-all duration-300';
    const stateClasses = error 
      ? 'text-red-600' 
      : success 
      ? 'text-green-600' 
      : 'text-gray-700';
    const focusClasses = isFocused ? 'text-primary-600' : '';
    
    return `${baseClasses} ${stateClasses} ${focusClasses}`;
  };

  return (
    <div className="relative">
      {label && (
        <label className={getLabelClasses()}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
            error ? 'text-red-500' : success ? 'text-green-500' : isFocused ? 'text-primary-500' : 'text-gray-400'
          }`}>
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={`${getInputClasses()} ${icon ? 'pl-12' : ''}`}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
              error ? 'text-red-500' : success ? 'text-green-500' : isFocused ? 'text-primary-500' : 'text-gray-400'
            }`}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
        
        {success && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 animate-bounce">
            <Check size={20} />
          </div>
        )}
        
        {error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 animate-pulse">
            <X size={20} />
          </div>
        )}
      </div>
      
      {helperText && (
        <div className={`mt-2 text-sm transition-all duration-300 ${
          error ? 'text-red-600' : success ? 'text-green-600' : 'text-gray-500'
        }`}>
          {helperText}
        </div>
      )}
    </div>
  );
});

AnimatedInput.displayName = 'AnimatedInput';

export default AnimatedInput;
