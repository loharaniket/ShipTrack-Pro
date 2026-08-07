import React from 'react';

const Input = ({ label, id, error, className = '', ...props }) => {
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)] bg-transparent
          ${error ? 'border-[var(--color-status-error)]' : 'border-gray-300 dark:border-gray-600'}
          dark:text-white dark:bg-gray-800
        `}
        {...props}
      />
      {error && <p className="text-xs text-[var(--color-status-error)] mt-1">{error}</p>}
    </div>
  );
};

export default Input;
