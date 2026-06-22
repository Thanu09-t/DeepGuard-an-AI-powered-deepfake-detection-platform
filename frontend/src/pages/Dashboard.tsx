import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, CheckCircle, Activity, FileVideo, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const chartData = [
  { name: 'Mon', fake: 12, real: 45 },
  { name: 'Tue', fake: 19, real: 38 },
  { name: 'Wed', fake: 15, real: 42 },
  { name: 'Thu', fake: 22, real: 35 },
  { name: 'Fri', fake: 8, real: 50 },
  { name: 'Sat', fake: 30, real: 20 },
  { name: 'Sun', fake: 14, real: 30 },
];

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const Dashboard = () => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // In MVP, we might get CORS error or server not running, use fallback
    axios.get(`${API_BASE_URL}/api/v1/history`)
      .then(res => setHistory(res.data))
      .catch(() => {
        setHistory([
          { id: "REP-98234-AX", filename: "sample_face.jpg", type: "image", score: 92.5, status: "Fake", date: "2026-05-30T10:00:00Z" },
          { id: "REP-98235-BY", filename: "interview.mp4", type: "video", score: 15.2, status: "Real", date: "2026-05-30T11:30:00Z" }
        ]);
      });
  }, []);

  const handleDeleteScan = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/reports/${id}`);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.warn("API error while deleting report, deleting from local state", err);
      setHistory(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear all scan history? This action cannot be undone.")) {
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/history/clear`);
      setHistory([]);
    } catch (err) {
      console.warn("API error while clearing history, clearing local state", err);
      setHistory([]);
    }
  };

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
        <div className="glass-panel rounded-xl p-6 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Recent Scans</h3>
            {history.length > 0 && (
              <button 
                onClick={handleClearHistory}
                className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 font-medium bg-red-500/5 px-2 py-1 rounded border border-red-500/10 hover:bg-red-500/15"
                title="Erase all scan history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
          </div>
          <div className="space-y-4 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                <ShieldAlert className="w-8 h-8 opacity-40" />
                <p className="text-sm">No recent scans found.</p>
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-between group hover:border-primary/40 transition-all">
                  <Link to={`/app/reports/${item.id}`} className="flex-1 flex items-center justify-between mr-3 min-w-0">
                    <div className="min-w-0 pr-2">
                      <p className="font-medium text-sm text-slate-200 truncate w-32 group-hover:text-primary transition-colors">{item.filename}</p>
                      <p className="text-xs text-slate-400 capitalize truncate">{item.type} • {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === 'Fake' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                        {item.status}
                      </span>
                      <span className="text-xs font-mono mt-1 text-slate-400">{item.score.toFixed(1)}%</span>
                    </div>
                  </Link>
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteScan(item.id); }}
                    className="p-1.5 rounded-md hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors shrink-0"
                    title="Delete scan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
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
