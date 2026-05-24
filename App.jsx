import { Component } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Auth from './Auth';
import Dashboard from './Dashboard';
import Analytics from './Analytics';

// Protect routes that require authentication
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('JWT_TOKEN') || localStorage.getItem('token');
  return token ? children : <Navigate to="/auth" />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <div className="app-root">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2600,
            style: {
              border: '1px solid #e2e8f0',
              boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)',
              color: '#0f172a',
            },
          }}
        />
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/analytics/:shortUrl" element={
            <PrivateRoute><Analytics /></PrivateRoute>
          } />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="auth-page">
          <section className="panel runtime-error">
            <p className="eyebrow">Frontend error</p>
            <h1 className="page-title">The app could not render.</h1>
            <p className="page-copy">{this.state.error.message}</p>
            <button className="primary-button" onClick={() => window.location.reload()}>
              Reload app
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
