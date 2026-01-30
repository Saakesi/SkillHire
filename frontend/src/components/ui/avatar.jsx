import React from 'react';

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-xl',
  '2xl': 'w-32 h-32 text-2xl',
};

export const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  className = '',
  status,
  ...props
}) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
  };

  return (
    <div className={`relative inline-block ${className}`} {...props}>
      {src ? (
        <img
          src={src}
          alt={alt || name}
          className={`${sizes[size]} rounded-full object-cover ring-2 ring-border`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold ring-2 ring-border`}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${statusColors[status]} ring-2 ring-background`}
        />
      )}
    </div>
  );
};
