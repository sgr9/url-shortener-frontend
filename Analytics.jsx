import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, ArrowLeft, Loader2, MousePointerClick, TrendingUp } from 'lucide-react';
import api, { getApiErrorMessage, getPublicShortUrl } from './api';

export default function Analytics() {
  const { shortUrl } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const totalClicks = useMemo(
    () => data.reduce((sum, point) => sum + Number(point.count || 0), 0),
    [data]
  );
  const peakClicks = useMemo(
    () => data.reduce((max, point) => Math.max(max, Number(point.count || 0)), 0),
    [data]
  );

  useEffect(() => {
    fetchAnalytics();
  }, [shortUrl]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError('');

    try {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);

      const startDateStr = start.toISOString().split('.')[0];
      const endDateStr = end.toISOString().split('.')[0];

      const res = await api.get(`/api/urls/analytics/${shortUrl}?startDate=${startDateStr}&endDate=${endDateStr}`);
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load analytics for this link.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <button onClick={() => navigate('/')} className="icon-button" title="Back to dashboard">
            <ArrowLeft size={19} />
          </button>
          <div>
            <p className="brand-name">Analytics</p>
            <p className="brand-subtitle">/{shortUrl}</p>
          </div>
        </div>
        <a href={getPublicShortUrl(shortUrl)} target="_blank" rel="noreferrer" className="secondary-button analytics-link">
          {getPublicShortUrl(shortUrl)}
        </a>
      </header>

      <section className="page-hero">
        <div>
          <p className="eyebrow">Performance</p>
          <h1 className="page-title">Click analytics for this short link.</h1>
          <p className="page-copy">Review engagement over the last 30 days and spot the strongest day of activity.</p>
        </div>
      </section>

      <section className="stats-grid">
        <Metric icon={MousePointerClick} label="Clicks in range" value={totalClicks} />
        <Metric icon={TrendingUp} label="Peak day" value={peakClicks} />
        <Metric icon={Activity} label="Data points" value={data.length} />
      </section>

      <section className="panel chart-card">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Click performance</h2>
            <p className="panel-subtitle">Last 30 days</p>
          </div>
        </div>

        <div className="chart-box">
          {isLoading ? (
            <StateBox icon={<Loader2 className="spin" />} title="Loading analytics..." />
          ) : error ? (
            <StateBox icon={<Activity />} title={error} />
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 20, bottom: 8, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="clickDate" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ stroke: '#99f6e4', strokeWidth: 2 }}
                  contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 18px 50px rgba(15, 23, 42, 0.12)' }}
                />
                <Line type="monotone" dataKey="count" stroke="#0f766e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <StateBox icon={<Activity />} title="No clicks recorded" copy="This link has no activity in the selected period." />
          )}
        </div>
      </section>
    </main>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="stat-card">
      <Icon className="metric-icon" size={22} />
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
