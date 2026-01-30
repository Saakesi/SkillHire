const variants = {
  default: 'bg-secondary text-secondary-foreground',
  primary: 'bg-primary/10 text-primary border border-primary/20',
  accent: 'bg-accent/10 text-accent border border-accent/20',
  success: 'bg-green-500/10 text-green-500 border border-green-500/20',
  warning: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
  danger: 'bg-red-500/10 text-red-500 border border-red-500/20',
  outline: 'border border-border text-muted-foreground',
  gradient: 'gradient-bg text-white',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
  dotColor,
  ...props
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-medium rounded-full
        transition-colors duration-200
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span
          className={`w-2 h-2 rounded-full ${dotColor || 'bg-current'}`}
          style={dotColor ? { backgroundColor: dotColor } : {}}
        />
      )}
      {children}
    </span>
  );
};
