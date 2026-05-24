import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Link as LinkIcon, Lock, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getApiErrorMessage } from './api';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ identifier: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const res = await api.post('/api/auth/public/login', {
          identifier: formData.identifier,
          password: formData.password,
        });
        localStorage.setItem('JWT_TOKEN', JSON.stringify(res.data.token));
        localStorage.setItem('token', res.data.token);
        toast.success('Signed in successfully');
        navigate('/');
      } else {
        await api.post('/api/auth/public/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        setIsLogin(true);
        toast.success('Account created. Please sign in.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, isLogin ? 'Unable to sign in' : 'Unable to create account'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-frame">
        <section className="auth-showcase">
          <Brand subtitle="Professional URL management" />

          <div className="showcase-copy">
            <p className="showcase-kicker">Campaign-ready links</p>
            <h1>Shorten. Share. Measure.</h1>
            <p>
              A focused workspace for creating short URLs, monitoring engagement,
              and keeping high-value links organized.
            </p>
          </div>

          <div className="showcase-stats">
            <div className="showcase-stat">
              <strong>30d</strong>
              <span>click insights</span>
            </div>
            <div className="showcase-stat">
              <strong>1s</strong>
              <span>copy flow</span>
            </div>
            <div className="showcase-stat">
              <strong>JWT</strong>
              <span>secure access</span>
            </div>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-wrap">
            <div className="mobile-brand">
              <Brand subtitle="Professional URL management" />
            </div>

            <p className="eyebrow">{isLogin ? 'Welcome back' : 'Get started'}</p>
            <h2 className="auth-title">{isLogin ? 'Sign in to LinkOps' : 'Create your workspace'}</h2>
            <p className="auth-copy">
              {isLogin
                ? 'Manage short links and review performance from a polished dashboard.'
                : 'Create your account and start turning long URLs into trackable short links.'}
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              {error && <div className="alert">{error}</div>}

              {isLogin ? (
                <Field
                  label="Username or email"
                  icon={User}
                  type="text"
                  placeholder="johndoe"
                  value={formData.identifier}
                  onChange={(value) => setFormData({ ...formData, identifier: value })}
                />
              ) : (
                <>
                  <Field
                    label="Username"
                    icon={User}
                    type="text"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(value) => setFormData({ ...formData, username: value })}
                  />
                  <Field
                    label="Email"
                    icon={Mail}
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(value) => setFormData({ ...formData, email: value })}
                  />
                </>
              )}

              <Field
                label="Password"
                icon={Lock}
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(value) => setFormData({ ...formData, password: value })}
              />

              <button type="submit" disabled={isSubmitting} className="primary-button">
                {isSubmitting ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
                {!isSubmitting && <ArrowRight className="button-icon" />}
              </button>
            </form>

            <button
              className="ghost-button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
            >
              {isLogin ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function Brand({ subtitle }) {
  return (
    <div className="brand-row">
      <div className="brand-mark">
        <LinkIcon size={24} />
      </div>
      <div>
        <p className="brand-name">LinkOps</p>
        <p className="brand-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, type, placeholder, value, onChange }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="input-shell">
        <Icon className="input-icon" />
        <input
          type={type}
          required
          className="input-control"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </span>
    </label>
  );
}
