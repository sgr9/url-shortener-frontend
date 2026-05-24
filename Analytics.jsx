import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowLeft, Activity } from 'lucide-react';
import api from './api';

export default function Analytics() {
  const { shortUrl } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetchAnalytics();
  }, [shortUrl]);

  const fetchAnalytics = async () => {
    try {
      // Generate ISO date formats for backend: 30 days ago to today
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);

      // Backend expects LocalDateTime like "2023-10-01T00:00:00"
      const startDateStr = start.toISOString().split('.')[0];
      const endDateStr = end.toISOString().split('.')[0];

      const res = await api.get(`/urls/analytics/${shortUrl}?startDate=${startDateStr}&endDate=${endDateStr}`);
      setData(res.data || []);
    } catch (err) {
      console.error('Error fetching analytics', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full p-6">
      <div className="flex items-center gap-4 mb-8 mt-4">
        <button onClick={() => navigate('/')} className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <Activity className="text-blue-600 h-6 w-6" />
          <h1 className="text-2xl font-bold text-slate-800">Analytics for /{shortUrl}</h1>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 h-[500px]">
        <h2 className="text-lg font-semibold text-slate-700 mb-6">Click Performance (Last 30 Days)</h2>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="clickDate" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">No clicks recorded in this period.</div>
        )}
      </div>
    </div>
  );
}
