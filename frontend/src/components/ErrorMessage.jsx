import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error">
      <strong>Error:</strong> {message}
      {onRetry && (
        <button 
          onClick={onRetry} 
          style={{ 
            marginLeft: '1rem', 
            padding: '0.25rem 0.5rem',
            background: 'transparent',
            border: '1px solid currentColor',
            borderRadius: '4px',
            color: 'inherit',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;