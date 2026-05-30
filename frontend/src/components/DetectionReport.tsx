import { AlertTriangle, CheckCircle, Shield, Clock, Cpu, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const DetectionReport = ({ report }: { report: any }) => {
  const isFake = report.is_fake;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel p-6 rounded-2xl h-full flex flex-col border-t-4 ${isFake ? 'border-t-red-500' : 'border-t-green-500'}`}
    >
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Analysis Complete</h2>
          <p className="text-sm text-slate-400">Forensic AI scan finished</p>
        </div>
        <div className={`p-3 rounded-full ${isFake ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
          {isFake ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
        </div>
      </div>

      <div className="flex-1 space-y-6">
        <div className="text-center p-6 bg-slate-900/50 rounded-xl border border-slate-700/50">
          <p className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-widest">Authenticity Score</p>
          <div className="flex items-end justify-center space-x-2">
            <span className={`text-6xl font-black ${isFake ? 'text-red-400' : 'text-green-400'}`}>
              {isFake ? report.confidence_score : (100 - report.confidence_score).toFixed(1)}
              <span className="text-3xl ml-1">%</span>
            </span>
          </div>
          <p className={`mt-3 font-semibold text-lg ${isFake ? 'text-red-400' : 'text-green-400'}`}>
            {isFake ? 'HIGH RISK - MANIPULATION DETECTED' : 'CLEAN - NO MANIPULATION DETECTED'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-lg flex items-center space-x-3">
            <Cpu className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Model Used</p>
              <p className="text-sm font-medium text-slate-200">{report.model_used}</p>
            </div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg flex items-center space-x-3">
            <Clock className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Processing Time</p>
              <p className="text-sm font-medium text-slate-200">{report.analysis_time_ms} ms</p>
            </div>
          </div>
        </div>

        {report.anomalies_detected && report.anomalies_detected.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Anomalies Detected
            </h4>
            <ul className="space-y-2">
              {report.anomalies_detected.map((anomaly: string, idx: number) => (
                <li key={idx} className="flex items-center text-sm text-slate-300 bg-red-500/10 px-3 py-2 rounded-md border border-red-500/20">
                  <Shield className="w-3 h-3 text-red-400 mr-2" />
                  {anomaly}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-700">
        <button className="w-full py-3 px-4 rounded-lg font-medium text-slate-300 border border-slate-600 hover:bg-slate-800 transition-colors">
          Download PDF Report
        </button>
      </div>
    </motion.div>
  );
};

export default DetectionReport;
