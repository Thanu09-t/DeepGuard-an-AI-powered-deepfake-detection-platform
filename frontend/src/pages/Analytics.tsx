import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ShieldAlert, CheckCircle, FileVideo, Shield, FileAudio, ImageIcon } from 'lucide-react';

const dailyData = [
  { name: 'Mon', authentic: 120, deepfake: 45 }, 
  { name: 'Tue', authentic: 190, deepfake: 82 }, 
  { name: 'Wed', authentic: 150, deepfake: 60 },
  { name: 'Thu', authentic: 220, deepfake: 110 }, 
  { name: 'Fri', authentic: 310, deepfake: 185 }, 
  { name: 'Sat', authentic: 280, deepfake: 130 }, 
  { name: 'Sun', authentic: 140, deepfake: 55 },
];

const manipulationData = [
  { name: 'Face-Swap', value: 45 },
  { name: 'Voice Clone', value: 25 },
  { name: 'Lip-Sync', value: 20 },
  { name: 'GAN Image', value: 10 },
];
const MANIPULATION_COLORS = ['#ff2a2a', '#ff7b00', '#ff00d4', '#8a2be2'];

const recentReports = [
  { id: 'REP-98234-AX', file: 'Q4_CEO_Interview.mp4', type: 'Video', date: '2026-05-30 14:32', risk: 'High', score: '94.2%', status: 'Deepfake Detected' },
  { id: 'REP-98235-BY', file: 'Voice_Note_002.wav', type: 'Audio', date: '2026-05-30 15:10', risk: 'High', score: '98.7%', status: 'Deepfake Detected' },
  { id: 'REP-98236-CZ', file: 'ID_Verification.jpg', type: 'Image', date: '2026-05-30 16:05', risk: 'Low', score: '12.4%', status: 'Authentic' },
  { id: 'REP-98237-DW', file: 'Press_Release.mp4', type: 'Video', date: '2026-05-30 16:45', risk: 'Medium', score: '65.1%', status: 'Suspicious' },
];

const Analytics = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Platform Analytics</h1>
        <p className="text-slate-400">Monitor deepfake detection metrics and system activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Files Scanned" value="14,248" icon={FileVideo} color="text-primary" />
        <StatCard title="Deepfakes Detected" value="3,562" icon={ShieldAlert} color="text-danger" />
        <StatCard title="Model Confidence" value="99.4%" icon={CheckCircle} color="text-green-400" />
        <StatCard title="Threat Reports" value="1,204" icon={Shield} color="text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stacked Bar Chart - Daily Detections */}
        <div className="liquid-glass rounded-[1.25rem] p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-6 text-slate-200">Daily Analysis Overview</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0c1529', borderColor: '#1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="authentic" name="Authentic Media" stackId="a" fill="#00f0ff" radius={[0, 0, 4, 4]} />
                <Bar dataKey="deepfake" name="Deepfakes Detected" stackId="a" fill="#ff2a2a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Manipulation Types */}
        <div className="liquid-glass rounded-[1.25rem] p-6 flex flex-col">
          <h3 className="text-lg font-semibold mb-2 text-slate-200">Manipulation Typology</h3>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={manipulationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {manipulationData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={MANIPULATION_COLORS[index % MANIPULATION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0c1529', borderColor: '#1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {manipulationData.map((entry, index) => (
              <div key={entry.name} className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: MANIPULATION_COLORS[index] }}></span>
                <span className="text-xs text-slate-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Forensic Reports Table */}
      <div className="liquid-glass rounded-[1.25rem] overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-200">Recent Forensic Reports</h3>
          <button className="text-sm text-primary hover:text-white transition-colors">View All Reports</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-sm text-slate-400">
                <th className="px-6 py-4 font-medium">Report ID</th>
                <th className="px-6 py-4 font-medium">Analyzed File</th>
                <th className="px-6 py-4 font-medium">Risk Level</th>
                <th className="px-6 py-4 font-medium">Confidence</th>
                <th className="px-6 py-4 font-medium">Verdict</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentReports.map((report) => (
                <tr key={report.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-300">{report.id}</td>
                  <td className="px-6 py-4 text-white flex items-center">
                    {report.type === 'Video' && <FileVideo className="w-4 h-4 mr-2 text-slate-400" />}
                    {report.type === 'Audio' && <FileAudio className="w-4 h-4 mr-2 text-slate-400" />}
                    {report.type === 'Image' && <ImageIcon className="w-4 h-4 mr-2 text-slate-400" />}
                    {report.file}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      report.risk === 'High' ? 'bg-danger/20 text-danger border border-danger/30' : 
                      report.risk === 'Medium' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
                      'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {report.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-300">{report.score}</td>
                  <td className={`px-6 py-4 font-medium ${
                    report.status === 'Deepfake Detected' ? 'text-danger' : 
                    report.status === 'Suspicious' ? 'text-orange-400' : 'text-green-400'
                  }`}>
                    {report.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="liquid-glass rounded-[1.25rem] p-6 flex items-start justify-between border-l-4 border-l-primary/50 hover:border-l-primary transition-colors">
    <div>
      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
    </div>
    <div className={`p-3 rounded-lg bg-slate-900/50 border border-slate-800 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

export default Analytics;
