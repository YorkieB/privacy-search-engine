import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

console.log('Main.jsx loaded');

// Error boundary for debugging
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    console.error('Error caught by boundary:', error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          background: '#fff',
          color: '#000',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h1>Something went wrong</h1>
          <p>Check browser console for details</p>
        </div>
      );
    }
    return this.props.children;
  }
}

try {
  const rootElement = document.getElementById('root');
  console.log('Root element found:', rootElement);
  
  const root = ReactDOM.createRoot(rootElement);
  console.log('React root created');
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('App rendered');
} catch (error) {
  console.error('Fatal error:', error);
  document.body.innerHTML = '<h1>Fatal error</h1><p>' + error.message + '</p>';
}