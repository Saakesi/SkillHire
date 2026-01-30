import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  gradient: 'gradient-bg text-white hover:opacity-90 shadow-lg shadow-primary/30',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground',
  ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
  github: 'bg-[#24292e] text-white hover:bg-[#1b1f23] shadow-lg',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-6 text-base',
  lg: 'h-14 px-8 text-lg',
  icon: 'h-10 w-10',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-semibold rounded-xl
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </motion.button>
  );
};
