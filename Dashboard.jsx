import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, CheckCircle, Copy, Link as LinkIcon, Loader2, LogOut, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getApiErrorMessage, getPublicShortUrl } from './api';

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [originalUrl, setOriginalUrl] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const totalClicks = useMemo(
    () => urls.reduce((sum, url) => sum + Number(url.clickCount || 0), 0),
    [urls]
  );

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    setError('');
    try {
      const res = await api.get('/api/urls/myurls');
      setUrls(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
        return;
      }
      setError(getApiErrorMessage(err, 'Could not load your links. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    const trimmedUrl = originalUrl.trim();

    if (!trimmedUrl) {
      setError('Please enter a URL to shorten.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.post('/api/urls/shorten', { originalUrl: trimmedUrl });
      setOriginalUrl('');
      if (res.data?.shortUrl) {
        setUrls((currentUrls) => [res.data, ...currentUrls.filter((url) => url.id !== res.data.id)]);
      }
      toast.success('Short link created');
      fetchUrls();
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Your session is not authorized to create links. Please log out and sign in again.');
        return;
      }

      setError(getApiErrorMessage(err, 'Error shortening URL'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async (shortUrl) => {
    const fullUrl = getPublicShortUrl(shortUrl);
    await navigator.clipboard.writeText(fullUrl);
    setCopiedCode(shortUrl);
    toast.success('Copied short link');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('JWT_TOKEN');
    navigate('/auth');
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-mark">
            <LinkIcon size={24} />
          </div>
          <div>
            <p className="brand-name">LinkOps</p>
            <p className="brand-subtitle">Short links and click intelligence</p>
          </div>
        </div>
        <button onClick={handleLogout} className="secondary-button">
          <LogOut className="button-icon" /> Logout
        </button>
      </header>

      <section className="page-hero">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="page-title">Manage every short link from one place.</h1>
          <p className="page-copy">
            Create cleaner URLs, copy them quickly, and jump into analytics without losing context.
          </p>
        </div>
      </section>

      <section className="stats-grid">
        <Metric label="Total links" value={urls.length} />
        <Metric label="Total clicks" value={totalClicks} />
        <Metric label="Average clicks" value={urls.length ? Math.round(totalClicks / urls.length) : 0} />
      </section>

      <section className="panel create-panel">
        <form onSubmit={handleShorten} className="create-form">
          <label className="sr-only" htmlFor="original-url">Long URL</label>
          <input
            id="original-url"
            type="url"
            required
            placeholder="Paste a long URL, for example https://example.com/reports/monthly"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            className="url-input"
          />
          <button type="submit" disabled={isSubmitting} className="primary-button">
            {isSubmitting ? <Loader2 className="button-icon spin" /> : <Plus className="button-icon" />}
            {isSubmitting ? 'Creating...' : 'Shorten URL'}
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Your links</h2>
            <p className="panel-subtitle">Recent links, destinations, and total clicks.</p>
          </div>
        </div>

        {isLoading ? (
          <StateBox icon={<Loader2 className="spin" />} title="Loading links..." />
        ) : urls.length === 0 ? (
          <StateBox
            icon={<LinkIcon />}
            title="No short links yet"
            copy="Create your first link above and it will appear here."
          />
        ) : (
          <ul className="link-list">
            {urls.map((url) => {
              const fullUrl = getPublicShortUrl(url.shortUrl);
              return (
                <li key={url.id || url.shortUrl} className="link-row">
                  <div>
                    <div className="short-link-wrap">
                      <a href={fullUrl} target="_blank" rel="noreferrer" className="short-link">
                        {fullUrl}
                      </a>
                      <button
                        onClick={() => handleCopy(url.shortUrl)}
                        className={`icon-button ${copiedCode === url.shortUrl ? 'success' : ''}`}
                        title="Copy short link"
                      >
                        {copiedCode === url.shortUrl ? <CheckCircle size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    <p className="long-link">{url.originalUrl}</p>
                  </div>

                  <div className="row-actions">
                    <div className="click-count">
                      <strong>{url.clickCount || 0}</strong>
                      <span>Clicks</span>
                    </div>
                    <button onClick={() => navigate(`/analytics/${url.shortUrl}`)} className="secondary-button">
                      <BarChart2 className="button-icon" /> Analytics
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}

function StateBox({ icon, title, copy }) {
  return (
    <div className="state-box">
      <div>
        <div className="state-icon">{icon}</div>
        <p className="state-title">{title}</p>
        {copy && <p className="state-copy">{copy}</p>}
      </div>
    </div>
  );
}
