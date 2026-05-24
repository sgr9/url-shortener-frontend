import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link as LinkIcon, BarChart2, Copy, LogOut, CheckCircle } from 'lucide-react';
import api from './api';

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [originalUrl, setOriginalUrl] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const res = await api.get('/urls/myurls');
      setUrls(res.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    try {
      await api.post('/urls/shorten', { originalUrl });
      setOriginalUrl('');
      fetchUrls();
    } catch (err) {
      console.error('Error shortening URL', err);
    }
  };

  const handleCopy = (shortUrl) => {
    // Generate the full direct URL to the backend for redirection
    const fullUrl = `http://localhost:8080/${shortUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedCode(shortUrl);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  return (
    <div className="max-w-5xl mx-auto w-full p-6">
      <div className="flex justify-between items-center mb-10 mt-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center shadow">
            <LinkIcon className="text-white h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">My Shortcuts</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors font-medium">
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-10">
        <form onSubmit={handleShorten} className="flex gap-4">
          <input type="url" required placeholder="Paste your long URL here... e.g., https://example.com/very/long/path" value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} className="flex-grow px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
          <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors whitespace-nowrap">
            Shorten URL
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {urls.length === 0 ? (
           <div className="p-10 text-center text-slate-500">You haven't shortened any URLs yet.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {urls.map((url) => (
              <li key={url.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="overflow-hidden mr-4 flex-grow">
                  <p className="text-blue-600 font-semibold text-lg flex items-center gap-2">
                    localhost:8080/{url.shortUrl}
                    <button onClick={() => handleCopy(url.shortUrl)} className="text-slate-400 hover:text-slate-600" title="Copy to clipboard">
                      {copiedCode === url.shortUrl ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                  </p>
                  <p className="text-slate-500 truncate mt-1 text-sm">{url.originalUrl}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right"><p className="text-2xl font-bold text-slate-700">{url.clickCount}</p><p className="text-xs text-slate-400 uppercase tracking-wide">Clicks</p></div>
                  <button onClick={() => navigate(`/analytics/${url.shortUrl}`)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Analytics"><BarChart2 size={24} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
