import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  type = 'button', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)] shadow-sm hover:-translate-y-0.5 focus:ring-[var(--color-brand)]',
    ghost: 'bg-transparent text-[var(--color-brand)] border border-transparent hover:border-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:bg-opacity-5',
    danger: 'bg-[var(--color-status-error)] text-white hover:opacity-90 shadow-sm focus:ring-[var(--color-status-error)]',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
