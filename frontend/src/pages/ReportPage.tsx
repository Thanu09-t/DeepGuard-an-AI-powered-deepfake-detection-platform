import { Download, Shield, Clock, Cpu, Map, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const ReportPage = () => {
  const location = useLocation();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Use passed state or fallback to default mock data
  const scanResult = location.state?.scanResult || {
    isFake: true,
    status: 'Deepfake Detected',
    confidence: 94.2,
    riskLevel: 'High'
  };
  
  const fileInfo = location.state?.fileInfo || {
    name: 'Q4_CEO_Interview.mp4',
    type: 'video/mp4'
  };

  const fileUrl = location.state?.fileUrl || null;

  const isVideo = fileInfo.type.startsWith('video');
  const isImage = fileInfo.type.startsWith('image');
  const isAudio = fileInfo.type.startsWith('audio');
  
  // Dynamic styling based on result
  const colorTheme = scanResult.isFake ? 'danger' : 'green-500';
  const colorHex = scanResult.isFake ? '#ff2a2a' : '#22c55e';

  const getInsights = () => {
    if (!scanResult.isFake) {
      return [
        { title: 'Natural Sensor Noise Profile', desc: 'Analysis matches expected camera physics without synthetic smoothing.', conf: '99%', layer: 'Base Analysis' },
        { title: 'Continuous Phase Coherence', desc: 'No temporal or spectral anomalies detected across analysis windows.', conf: '98%', layer: 'Surface Level' }
      ];
    }
    if (isVideo) {
      return [
        { title: 'Facial Boundary Artifacts', desc: 'Detected pixel blending and temporal jitter around the jawline boundary.', conf: '98%', layer: 'Temporal Layer' },
        { title: 'Lip-Sync Mismatch', desc: 'Phoneme-viseme mapping deviates significantly from natural speech.', conf: '91%', layer: 'Audio-Visual Layer' }
      ];
    }
    if (isAudio) {
      return [
        { title: 'Synthetic Spectral Frequencies', desc: 'High-frequency cutoffs typical of neural vocoder generation.', conf: '96%', layer: 'Spectral Base' },
        { title: 'Unnatural Phase Alignment', desc: 'Phase coherence lacks natural breath mechanics and ambient variations.', conf: '94%', layer: 'Waveform Level' }
      ];
    }
    return [
      { title: 'GAN Pixel Anomaly', desc: 'Unnatural grid-like patterns detected in high-frequency domains.', conf: '97%', layer: 'Pixel Grid' },
      { title: 'Inconsistent Lighting Geometry', desc: 'Shadow casting does not logically align with global illumination.', conf: '89%', layer: 'Semantic Layer' }
    ];
  };

  const insights = getInsights();

  const handleDownload = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);
    
    try {
      const element = reportRef.current;
      
      // html2canvas often hangs on backdrop-filters (liquid-glass) or mix-blend-modes.
      // A common reliable approach is to clone the element and remove problematic classes, 
      // but a simpler fallback is window.print() if it fails.
      
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#050a15',
        useCORS: true,
        logging: false, // set true to debug
        ignoreElements: () => {
          // Ignore problematic elements if needed
          return false;
        }
      });
      
      const data = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });
      
      const imgProperties = pdf.getImageProperties(data);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
      
      pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`DeepGuard_Report_${fileInfo.name.split('.')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF via html2canvas:", error);
      alert("Advanced PDF generation failed. Falling back to browser print.");
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Forensic Analysis Report</h1>
          <p className="text-slate-400">Report ID: {scanResult.id || `REP-${Math.floor(Math.random() * 90000) + 10000}-AX`}</p>
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          {!location.state && (
            <Link to="/app/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
              &larr; Back to Dashboard
            </Link>
          )}
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-6 py-2 rounded-lg glow-button-primary flex items-center shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            {isDownloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      <div ref={reportRef} className={`liquid-glass rounded-[1.25rem] overflow-hidden border-t-4 ${scanResult.isFake ? 'border-t-danger' : 'border-t-green-500'} bg-[#050a15]`}>
        {/* Header Summary */}
        <div className="p-8 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/5">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">{fileInfo.name}</h2>
            <div className="flex space-x-4 text-sm text-slate-400 mt-2">
              <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {new Date().toISOString().split('T')[0]} {new Date().toLocaleTimeString()}</span>
              <span className="flex items-center"><Cpu className="w-4 h-4 mr-1" /> {isVideo ? 'Video Analysis' : isImage ? 'Image Forensics' : 'Audio Analysis'}</span>
            </div>
          </div>
          <div className={`bg-${colorTheme}/10 border border-${colorTheme}/30 rounded-xl p-4 text-center min-w-[200px]`}>
            <p className={`text-sm font-medium text-${colorTheme} mb-1 uppercase tracking-wider`}>Detection Result</p>
            <p className={`text-2xl font-bold text-${colorTheme} glow-text drop-shadow-[0_0_8px_${colorHex}]`}>
              {scanResult.status}
            </p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-slate-400 mb-1">Confidence Score</p>
              <p className={`text-3xl font-bold text-${colorTheme} glow-text`}>{scanResult.confidence}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Risk Level</p>
              <p className={`text-xl font-bold text-${colorTheme} mt-1`}>{scanResult.riskLevel}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Model Used</p>
              <p className="text-lg font-medium text-white mt-1">
                {isVideo ? 'TimeSformer + LSTM' : isImage ? 'Vision Transformer' : 'Wav2Lip CNN'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">File Type</p>
              <p className="text-lg font-medium text-white mt-1">{fileInfo.type}</p>
            </div>
          </div>

          {/* Model Explanation */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary" /> Model Explanation
            </h3>
            <div className="liquid-glass p-6 rounded-xl border border-white/10 text-white/80 leading-relaxed font-light">
              {scanResult.isFake ? (
                <p>The temporal analysis model identified significant inconsistencies. Specifically, {isVideo ? 'blending artifacts were detected around the facial boundary, indicative of a face-swap manipulation (DeepFaceLab or similar architecture). Lip-sync analysis using Wav2Lip embeddings showed a deviation from natural phoneme-viseme mappings.' : isImage ? 'invisible noise patterns and unnatural pixel blending were detected, strongly suggesting the image was generated by a Diffusion or GAN model.' : 'spectral frequency analysis found traces of voice cloning algorithms, with abnormal vocal tract resonances that do not match human speech.'}</p>
              ) : (
                <p>The analysis model found no significant inconsistencies. {isVideo ? 'Frame-by-frame progression and lip-syncing appear completely natural without any blending artifacts or temporal jitter.' : isImage ? 'Pixel-level noise distribution matches natural camera sensor patterns without synthetic GAN artifacts.' : 'The vocal spectral map aligns perfectly with natural human speech frequencies.'}</p>
              )}
            </div>
          </div>

          {/* Analysis Regions */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Map className="w-5 h-5 mr-2 text-primary" /> Detailed Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.map((insight, idx) => (
                <div key={idx} className={`liquid-glass rounded-xl border ${scanResult.isFake ? 'border-danger/30' : 'border-green-500/30'} p-4`}>
                  <div className="aspect-video bg-slate-900 rounded-lg mb-3 relative overflow-hidden flex items-center justify-center border border-white/5">
                    {/* Scanner / pulse CSS animations injection */}
                    <style>{`
                      @keyframes scanner {
                        0% { top: 0%; }
                        50% { top: 100%; }
                        100% { top: 0%; }
                      }
                      .custom-scanner {
                        position: absolute;
                        left: 0;
                        right: 0;
                        height: 2px;
                        background-color: #00f0ff;
                        box-shadow: 0 0 10px #00f0ff;
                        animation: scanner 4s infinite linear;
                        z-index: 10;
                      }
                      @keyframes pulse-heat {
                        0% { transform: scale(1); opacity: 0.45; }
                        50% { transform: scale(1.2); opacity: 0.8; }
                        100% { transform: scale(1); opacity: 0.45; }
                      }
                      .pulse-heat-1 {
                        animation: pulse-heat 2s infinite ease-in-out;
                      }
                      .pulse-heat-2 {
                        animation: pulse-heat 2.8s infinite ease-in-out;
                      }
                      @keyframes bar-bounce {
                        0%, 100% { height: 15%; }
                        50% { height: var(--h); }
                      }
                      .audio-bar {
                        width: 8px;
                        border-radius: 4px 4px 0 0;
                        animation: bar-bounce 1.2s infinite ease-in-out;
                        animation-delay: var(--d);
                      }
                    `}</style>

                    {isAudio ? (
                      /* Audio Spectrogram Visualization */
                      <div className="w-full h-full flex items-end justify-center gap-1.5 px-6 pb-6 bg-slate-950/70 relative">
                        <div className="absolute top-3 left-4 text-[10px] font-mono text-slate-400 tracking-wider">SPECTRAL FREQUENCY DENSITY (SECTOR_0{idx + 1})</div>
                        {[
                          { h: '65%', d: '0.1s' }, { h: '85%', d: '0.4s' }, { h: '45%', d: '0.2s' }, { h: '90%', d: '0.6s' },
                          { h: '30%', d: '0.3s' }, { h: '75%', d: '0.8s' }, { h: '55%', d: '0.5s' }, { h: '80%', d: '0.7s' },
                          { h: '40%', d: '0.2s' }, { h: '95%', d: '0.4s' }, { h: '70%', d: '0.6s' }, { h: '50%', d: '0.1s' },
                          { h: '85%', d: '0.5s' }, { h: '60%', d: '0.3s' }, { h: '75%', d: '0.8s' }, { h: '35%', d: '0.2s' }
                        ].map((bar, i) => (
                          <div 
                            key={i} 
                            className={`audio-bar ${scanResult.isFake ? 'bg-danger/80' : 'bg-green-500/80'}`} 
                            style={{ 
                              '--h': bar.h, 
                              '--d': bar.d, 
                              boxShadow: scanResult.isFake ? '0 0 8px rgba(255,42,42,0.4)' : '0 0 8px rgba(34,197,94,0.4)' 
                            } as any} 
                          />
                        ))}
                      </div>
                    ) : fileUrl ? (
                      /* Visual Media Analysis (Image or Video) */
                      <div className="w-full h-full relative">
                        {/* Original Media Preview (Sector 1) */}
                        {idx === 0 ? (
                          <>
                            {isVideo ? (
                              <video src={fileUrl} className="w-full h-full object-cover animate-fade-in" muted playsInline autoPlay loop />
                            ) : (
                              <img src={fileUrl} alt="Forensic Scan" className="w-full h-full object-cover" />
                            )}
                            {/* Scanning horizontal line */}
                            <div className="custom-scanner" />
                            <div className="absolute top-2 left-2 bg-black/65 border border-white/10 px-2.5 py-0.5 rounded text-[9px] font-mono text-primary tracking-wider uppercase">
                              Spatial Core Grid Scan
                            </div>
                          </>
                        ) : (
                          /* Forensic Thermal Heatmap Overlay (Sector 2) */
                          <>
                            {isVideo ? (
                              <video src={fileUrl} className="w-full h-full object-cover filter brightness-[0.6] contrast-[1.4] hue-rotate-[130deg] saturate-[2]" muted playsInline autoPlay loop />
                            ) : (
                              <img src={fileUrl} alt="Forensic Heatmap" className="w-full h-full object-cover filter brightness-[0.6] contrast-[1.4] hue-rotate-[130deg] saturate-[2]" />
                            )}
                            
                            {scanResult.isFake ? (
                              /* Manipulated Red Hotspots */
                              <>
                                <div className="absolute inset-0 bg-red-600/10 mix-blend-color-burn"></div>
                                <div className="absolute top-1/4 left-1/3 w-20 h-20 bg-danger/55 rounded-full blur-xl pulse-heat-1 mix-blend-screen"></div>
                                <div className="absolute bottom-1/3 right-1/4 w-14 h-14 bg-danger/50 rounded-full blur-xl pulse-heat-2 mix-blend-screen"></div>
                                <div className="absolute top-2 left-2 bg-danger/80 border border-danger px-2.5 py-0.5 rounded text-[9px] font-mono text-white tracking-wider uppercase">
                                  Neural Heatmap Output
                                </div>
                              </>
                            ) : (
                              /* Verified Coherence green elements */
                              <>
                                <div className="absolute inset-0 bg-green-500/5 mix-blend-screen"></div>
                                <div className="absolute inset-0 flex items-center justify-center border border-green-500/20 bg-green-500/5">
                                  <span className="text-[10px] tracking-widest text-green-400 bg-black/60 border border-green-500/30 px-3 py-1 rounded font-mono uppercase">
                                    Verified Coherent Pixels
                                  </span>
                                </div>
                                <div className="absolute top-2 left-2 bg-green-500/80 border border-green-600 px-2.5 py-0.5 rounded text-[9px] font-mono text-white tracking-wider uppercase">
                                  Structure Verification
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      /* Default Fallback HUD Graphic (no live file url) */
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/60 p-4 border border-white/5 relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50"></div>
                        <Shield className={`w-8 h-8 ${scanResult.isFake ? 'text-danger animate-pulse' : 'text-green-500'} mb-2`} />
                        <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">HUD SECTOR SCAN_0{idx + 1}</span>
                        {scanResult.isFake ? (
                          <div className={`absolute ${idx === 0 ? 'top-1/3 right-1/3 w-16 h-16' : 'bottom-1/3 left-1/3 w-12 h-12'} bg-danger/25 rounded-full blur-xl mix-blend-screen pulse-heat-1`}></div>
                        ) : (
                          <div className="absolute inset-0 border border-green-500/10 rounded-lg m-4 pointer-events-none"></div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="font-medium text-white text-sm">{insight.title}</p>
                  <p className="text-xs text-white/60 mt-1 mb-2 leading-relaxed">{insight.desc}</p>
                  <p className="text-xs text-slate-400">Confidence: {insight.conf} • Layer: {insight.layer}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportPage;
