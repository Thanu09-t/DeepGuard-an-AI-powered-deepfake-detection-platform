import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, Video, AlertTriangle, Shield, CheckCircle, X, Camera } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const DetectionDashboard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Webcam state
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Capturing / Recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingIntervalRef = useRef<any>(null);

  const startWebcam = async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
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

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const photoFile = new File([blob], `webcam-capture-${Date.now()}.png`, { type: 'image/png' });
          setFile(photoFile);
          stopWebcam();
        }
      }, 'image/png');
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    recordedChunksRef.current = [];
    setRecordingSeconds(0);
    
    try {
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
    } catch {
      try {
        const options = { mimeType: 'video/webm' };
        mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
      } catch {
        mediaRecorderRef.current = new MediaRecorder(streamRef.current);
      }
    }

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const videoFile = new File([blob], `webcam-record-${Date.now()}.webm`, { type: 'video/webm' });
      setFile(videoFile);
      stopWebcam();
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);

    recordingIntervalRef.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  const performAnalysis = async (scanFile: File) => {
    setIsScanning(true);
    setResult(null);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', scanFile);
    
    let endpoint = '/api/v1/detect/image';
    if (scanFile.type.startsWith('video/')) {
      endpoint = '/api/v1/detect/video';
    } else if (scanFile.type.startsWith('audio/')) {
      endpoint = '/api/v1/detect/audio';
    }
    
    try {
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const resData = response.data;
      const scanResult = resData.result;
      
      setResult({
        id: resData.file_id,
        status: scanResult.is_fake ? 'Deepfake Detected' : 'Authentic Media',
        confidence: scanResult.confidence_score,
        riskLevel: scanResult.is_fake ? 'High' : 'Low',
        isFake: scanResult.is_fake,
        anomalies_detected: scanResult.anomalies_detected,
        model_used: scanResult.model_used,
        analysis_time_ms: scanResult.analysis_time_ms
      });
    } catch (err: any) {
      console.error("API error: backend unreachable", err);
      setError("Could not connect to the DeepGuard backend server. Please make sure the backend is running (uvicorn main:app --reload) and try again. Real forensic analysis requires the backend.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleScan = () => {
    if (file) {
      performAnalysis(file);
    } else if (isWebcamActive && videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const photoFile = new File([blob], `webcam-capture-${Date.now()}.png`, { type: 'image/png' });
            setFile(photoFile);
            stopWebcam();
            performAnalysis(photoFile);
          }
        }, 'image/png');
      }
    }
  };

  // Connect stream to video element once it is mounted in the DOM
  useEffect(() => {
    if (isWebcamActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isWebcamActive]);

  useEffect(() => {
    return () => {
      stopWebcam();
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [stopWebcam]);

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
                className="w-full h-full max-h-[350px] object-cover rounded-xl border-2 border-primary/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
              />
              <div className="absolute bottom-4 left-0 right-0 flex flex-wrap items-center justify-center gap-3 px-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-8 pb-3 rounded-b-xl">
                {isRecording ? (
                  <button 
                    onClick={stopRecording} 
                    className="px-6 py-2.5 rounded-full bg-danger text-white hover:bg-danger/80 transition-colors shadow-lg flex items-center space-x-2 font-medium animate-pulse text-sm"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white mr-1"></span>
                    <span>Stop Recording ({recordingSeconds}s)</span>
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={handleScan} 
                      className="px-5 py-2.5 rounded-full glow-button-primary shadow-lg font-semibold text-xs tracking-wider uppercase transition-all"
                    >
                      Analyze Live Feed
                    </button>
                    <button 
                      onClick={capturePhoto} 
                      className="px-5 py-2.5 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 text-white font-medium text-xs uppercase tracking-wider transition-all shadow-lg flex items-center space-x-1.5"
                    >
                      <Camera className="w-3.5 h-3.5 text-primary" />
                      <span>Capture Photo</span>
                    </button>
                    <button 
                      onClick={startRecording} 
                      className="px-5 py-2.5 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 text-white font-medium text-xs uppercase tracking-wider transition-all shadow-lg flex items-center space-x-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-danger animate-ping"></span>
                      <span>Record Video</span>
                    </button>
                  </>
                )}
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
            <div className="text-center w-full max-w-lg mx-auto flex flex-col items-center">
              <div className="w-full aspect-video max-h-[300px] rounded-xl overflow-hidden border border-white/15 bg-slate-900/50 mb-6 flex items-center justify-center relative">
                {file.type.startsWith('image/') ? (
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                  />
                ) : file.type.startsWith('video/') ? (
                  <video 
                    src={URL.createObjectURL(file)} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-lg font-medium text-white truncate">{file.name}</p>
                    <p className="text-sm text-white/70 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
                <button 
                  onClick={() => setFile(null)} 
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 border border-white/10 hover:bg-black/80 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="w-full flex space-x-4">
                <button onClick={() => setFile(null)} className="flex-1 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 text-white font-medium text-sm">
                  Cancel
                </button>
                <button onClick={handleScan} className="flex-1 py-3.5 rounded-xl glow-button-primary text-white font-semibold text-sm">
                  Run AI Analysis
                </button>
              </div>
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
          
          {error && (
            <div className="p-3 mb-4 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start space-x-2 text-orange-400 text-xs leading-normal">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

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
                    fileInfo: file ? { name: file.name, type: file.type } : { name: 'Live Webcam Stream', type: 'video/webcam' },
                    fileUrl: file ? URL.createObjectURL(file) : null
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
