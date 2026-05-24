import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import Dashboard from './Dashboard';
import Analytics from './Analytics';

// Protect routes that require authentication
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/auth" />;
};

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
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
  );
}
