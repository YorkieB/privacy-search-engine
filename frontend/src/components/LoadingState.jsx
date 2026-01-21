import React from 'react';

const LoadingState = ({ message = "Loading..." }) => {
  return (
    <div className="loading">
      <span className="loading-spinner"></span>
      {message}
    </div>
  );
};

export default LoadingState;