import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  default: 'bg-card border border-border',
  glass: 'glass',
  gradient: 'gradient-bg-subtle border border-border/50',
  elevated: 'bg-card shadow-xl shadow-black/5 border border-border',
};

export const Card = ({
  children,
  variant = 'default',
  className = '',
  hover = false,
  padding = 'md',
  onClick,
  ...props
}) => {
  const paddingSizes = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const baseClasses = `
    rounded-2xl
    ${variants[variant]}
    ${paddingSizes[padding]}
    ${hover ? 'card-hover cursor-pointer' : ''}
  `;

  if (onClick) {
    return (
      <motion.div
        whileHover={hover ? { y: -4 } : {}}
        className={`${baseClasses} ${className}`}
        onClick={onClick}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${baseClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between mb-4 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-xl font-bold text-foreground ${className}`}>{children}</h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-muted-foreground text-sm ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`flex items-center gap-4 mt-4 pt-4 border-t border-border ${className}`}>
    {children}
  </div>
);
