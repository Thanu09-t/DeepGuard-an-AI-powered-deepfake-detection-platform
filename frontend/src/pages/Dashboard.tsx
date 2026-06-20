import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, CheckCircle, Activity, FileVideo } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Mon', fake: 12, real: 45 },
  { name: 'Tue', fake: 19, real: 38 },
  { name: 'Wed', fake: 15, real: 42 },
  { name: 'Thu', fake: 22, real: 35 },
  { name: 'Fri', fake: 8, real: 50 },
  { name: 'Sat', fake: 30, real: 20 },
  { name: 'Sun', fake: 14, real: 30 },
];

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : ''
);

const Dashboard = () => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // In MVP, we might get CORS error or server not running, use fallback
    axios.get(`${API_BASE_URL}/api/v1/history`)
      .then(res => setHistory(res.data))
      .catch(() => {
        setHistory([
          { id: "1", filename: "sample_face.jpg", type: "image", score: 92.5, status: "Fake", date: "2026-05-30T10:00:00Z" },
          { id: "2", filename: "interview.mp4", type: "video", score: 15.2, status: "Real", date: "2026-05-30T11:30:00Z" }
        ]);
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Scans" value="1,248" icon={Activity} color="text-blue-400" />
        <StatCard title="Deepfakes Detected" value="342" icon={ShieldAlert} color="text-red-400" />
        <StatCard title="Authentic Media" value="906" icon={CheckCircle} color="text-green-400" />
        <StatCard title="Avg processing time" value="1.2s" icon={FileVideo} color="text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="glass-panel rounded-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Detection Trends (Past 7 Days)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="fake" fill="#ef4444" radius={[4, 4, 0, 0]} name="Deepfakes" />
                <Bar dataKey="real" fill="#22c55e" radius={[4, 4, 0, 0]} name="Authentic" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* History List */}
        <div className="glass-panel rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Recent Scans</h3>
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-slate-200 truncate w-32">{item.filename}</p>
                  <p className="text-xs text-slate-400 capitalize">{item.type} • {new Date(item.date).toLocaleTimeString()}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.status === 'Fake' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                    {item.status}
                  </span>
                  <span className="text-xs font-mono mt-1 text-slate-400">{item.score.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
  <div className="glass-panel rounded-xl p-6 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="text-3xl font-bold text-slate-100 mt-2">{value}</p>
    </div>
    <div className={`p-3 rounded-lg bg-slate-800 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

export default Dashboard;
