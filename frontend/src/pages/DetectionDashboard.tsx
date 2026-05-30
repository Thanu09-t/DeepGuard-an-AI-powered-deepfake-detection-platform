import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, Video, AlertTriangle, Shield, CheckCircle, X } from 'lucide-react';

const DetectionDashboard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Webcam state
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsWebcamActive(true);
      setFile(null);
      setResult(null);
    } catch (err) {
      console.error("Error accessing webcam: ", err);
      alert("Could not access webcam. Please check permissions.");
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
  };

  const handleScan = () => {
    if (!file && !isWebcamActive) return;
    setIsScanning(true);
    setResult(null);
    
    // Simulate scan
    setTimeout(() => {
      setIsScanning(false);
      const isFake = Math.random() > 0.4;
      setResult({
        status: isFake ? 'Deepfake Detected' : 'Authentic Media',
        confidence: isFake ? Math.floor(85 + Math.random() * 14) : Math.floor(90 + Math.random() * 9),
        riskLevel: isFake ? 'High' : 'Low',
        isFake
      });
    }, 2500);
  };

  useEffect(() => {
    return () => stopWebcam();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Detection Engine</h1>
          <p className="text-white/70">Upload media or start live webcam detection.</p>
        </div>
        {!isWebcamActive ? (
          <button onClick={startWebcam} className="flex items-center space-x-2 liquid-glass hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-colors">
            <Video className="w-4 h-4" />
            <span>Live Webcam</span>
          </button>
        ) : (
          <button onClick={stopWebcam} className="flex items-center space-x-2 bg-danger/20 border border-danger hover:bg-danger/40 text-white px-4 py-2 rounded-lg transition-colors">
            <X className="w-4 h-4" />
            <span>Stop Webcam</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Area */}
        <div className="lg:col-span-2 liquid-glass rounded-[1.25rem] p-8 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
          
          {isWebcamActive && !isScanning && !result && (
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover rounded-xl border-2 border-primary/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
              />
              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <button onClick={handleScan} className="px-8 py-3 rounded-full glow-button-primary shadow-lg text-lg">
                  Analyze Live Feed
                </button>
              </div>
            </div>
          )}

          {!file && !isScanning && !result && !isWebcamActive && (
            <div 
              className="w-full h-full border-2 border-dashed border-primary/30 rounded-xl flex flex-col items-center justify-center p-12 cursor-pointer hover:border-primary transition-colors bg-white/5"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="w-16 h-16 text-primary mb-4 glow-text" />
              <p className="text-xl font-medium text-white">Drag & drop media to scan</p>
              <p className="text-sm text-white/50 mt-2">Supports Images, Videos, and Audio</p>
            </div>
          )}

          {file && !isScanning && !result && !isWebcamActive && (
            <div className="text-center w-full max-w-md mx-auto">
              <div className="p-8 liquid-glass rounded-xl mb-6">
                <p className="text-lg font-medium text-white truncate">{file.name}</p>
                <p className="text-sm text-white/70 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button onClick={handleScan} className="w-full py-4 rounded-xl glow-button-primary text-lg">
                Run AI Analysis
              </button>
            </div>
          )}

          {isScanning && (
            <div className="text-center flex flex-col items-center z-10">
              <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                <Shield className="w-10 h-10 text-primary glow-text" />
              </div>
              <h3 className="text-xl font-semibold text-white">Analyzing Forensic Signatures</h3>
              <p className="text-white/70 mt-2">Scanning neural noise and spectral artifacts...</p>
            </div>
          )}

          {result && (
            <div className="w-full h-full flex flex-col justify-center items-center z-10">
              <div className="relative w-full aspect-video liquid-glass rounded-lg overflow-hidden mb-6 flex items-center justify-center">
                <p className="text-white/50 font-mono text-sm tracking-wider">MEDIA_PREVIEW_WITH_HEATMAP</p>
                {result.isFake && (
                  <div className="absolute inset-0 pointer-events-none mix-blend-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-danger/60 via-transparent to-transparent"></div>
                )}
              </div>
              <button onClick={() => { setFile(null); setResult(null); setIsWebcamActive(false); }} className="px-6 py-2 liquid-glass rounded-lg hover:bg-white/10 text-white">
                Scan Another Source
              </button>
            </div>
          )}

          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*,audio/*" onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
               setFile(e.target.files[0]);
               stopWebcam();
            }
          }} />
        </div>

        {/* Status Area */}
        <div className="liquid-glass rounded-[1.25rem] p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-6 border-b border-white/10 pb-4">Analysis Results</h3>
          
          {result ? (
            <div className="space-y-6 flex-1">
              <div>
                <p className="text-sm text-white/70 mb-1">Detection Status</p>
                <div className={`flex items-center p-3 rounded-lg border ${result.isFake ? 'bg-danger/20 border-danger/50 text-danger' : 'bg-green-500/20 border-green-500/50 text-green-400'}`}>
                  {result.isFake ? <AlertTriangle className="w-5 h-5 mr-3" /> : <CheckCircle className="w-5 h-5 mr-3" />}
                  <span className="font-bold text-lg">{result.status}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-sm text-white/70">Confidence Score</p>
                  <span className={`text-2xl font-bold ${result.isFake ? 'text-danger glow-text drop-shadow-[0_0_8px_rgba(255,42,42,0.8)]' : 'text-primary glow-text'}`}>
                    {result.confidence}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${result.isFake ? 'bg-danger' : 'bg-primary'}`} style={{ width: `${result.confidence}%` }}></div>
                </div>
              </div>

              <div>
                <p className="text-sm text-white/70 mb-1">Risk Level</p>
                <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${result.isFake ? 'bg-danger text-white' : 'bg-green-500 text-white'}`}>
                  {result.riskLevel}
                </span>
              </div>
              
              <div className="pt-6 border-t border-white/10 mt-auto">
                <Link 
                  to="/app/reports" 
                  state={{ 
                    scanResult: result, 
                    fileInfo: file ? { name: file.name, type: file.type } : { name: 'Live Webcam Stream', type: 'video/webcam' } 
                  }}
                  className="w-full py-3 rounded-lg border border-primary text-primary hover:bg-primary/20 transition-colors glow-text flex justify-center items-center font-medium"
                >
                  View Full Report
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/40 space-y-4">
              <Shield className="w-12 h-12 opacity-50" />
              <p className="text-center text-sm">Select a source to view detailed forensic analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetectionDashboard;
