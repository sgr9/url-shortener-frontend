import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link as LinkIcon, Lock, Mail, User } from 'lucide-react';
import api from './api';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ identifier: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const res = await api.post('/auth/public/login', { 
          identifier: formData.identifier, 
          password: formData.password 
        });
        localStorage.setItem('token', res.data.token);
        navigate('/');
      } else {
        await api.post('/auth/public/register', { 
          username: formData.username, 
          email: formData.email, 
          password: formData.password 
        });
        setIsLogin(true); // switch to login after successful register
        setError('Registration successful! Please log in.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <LinkIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
            {isLogin ? 'Sign in to your account' : 'Create new account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-sm text-center text-red-500 font-medium">{error}</div>}
          <div className="space-y-4">
            {isLogin ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username or Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-400"/></div>
                  <input type="text" required className="pl-10 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="johndoe" value={formData.identifier} onChange={(e) => setFormData({ ...formData, identifier: e.target.value })} />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-400"/></div>
                    <input type="text" required className="pl-10 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="johndoe" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400"/></div>
                    <input type="email" required className="pl-10 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400"/></div>
                <input type="password" required className="pl-10 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            {isLogin ? 'Sign in' : 'Register'}
          </button>
        </form>
        <div className="text-center mt-4">
          <button 
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
