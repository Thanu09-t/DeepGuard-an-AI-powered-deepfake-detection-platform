import { Download, Shield, Clock, Cpu, Map, Loader2, FileJson, AlertTriangle } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const ReportPage = () => {
  const { reportId } = useParams<{ reportId?: string }>();
  const location = useLocation();
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(!!reportId);
  const [error, setError] = useState<string | null>(null);
  const [fetchedReport, setFetchedReport] = useState<any>(null);
  const [fallbackReportId] = useState('REP-98234-AX');

  useEffect(() => {
    if (reportId) {
      axios.get(`${API_BASE_URL}/api/v1/reports/${reportId}`)
        .then(res => {
          setFetchedReport(res.data);
        })
        .catch(err => {
          console.error("Error fetching report:", err);
          setError("Failed to fetch report from database. Using offline simulated report details.");
          // Use a simulated fallback report if offline to prevent blank screen
          setFetchedReport({
            id: reportId,
            filename: reportId.includes('98235') ? 'Voice_Note_002.wav' : reportId.includes('98236') ? 'ID_Verification.jpg' : 'Q4_CEO_Interview.mp4',
            type: reportId.includes('98235') ? 'audio/wav' : reportId.includes('98236') ? 'image/jpeg' : 'video/mp4',
            score: reportId.includes('98236') ? 12.4 : 94.2,
            is_fake: !reportId.includes('98236'),
            model_used: reportId.includes('98235') ? 'Wav2Lip CNN' : reportId.includes('98236') ? 'Vision Transformer' : 'TimeSformer + LSTM',
            analysis_time_ms: 1250,
            details: {
              anomalies_detected: !reportId.includes('98236') ? ["facial artifact detected", "inconsistent lighting"] : []
            },
            created_at: new Date().toISOString()
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [reportId]);

  // Use passed state, fetched state, or fallback to default mock data
  const scanResult = fetchedReport 
    ? {
        id: fetchedReport.id,
        isFake: fetchedReport.is_fake,
        status: fetchedReport.is_fake ? 'Deepfake Detected' : 'Authentic Media',
        confidence: fetchedReport.score,
        riskLevel: fetchedReport.is_fake ? 'High' : 'Low',
        model_used: fetchedReport.model_used,
        analysis_time_ms: fetchedReport.analysis_time_ms,
        details: fetchedReport.details,
      }
    : (location.state?.scanResult || {
        id: 'REP-98234-AX',
        isFake: true,
        status: 'Deepfake Detected',
        confidence: 94.2,
        riskLevel: 'High',
        model_used: 'TimeSformer + LSTM',
        analysis_time_ms: 1250
      });
  
  const fileInfo = fetchedReport
    ? {
        name: fetchedReport.filename,
        type: fetchedReport.type || (fetchedReport.filename.endsWith('.mp4') || fetchedReport.filename.endsWith('.webm') ? 'video/mp4' : fetchedReport.filename.endsWith('.wav') ? 'audio/wav' : 'image/jpeg')
      }
    : (location.state?.fileInfo || {
        name: 'Q4_CEO_Interview.mp4',
        type: 'video/mp4'
      });

  const fileUrl = location.state?.fileUrl || null;

  const isVideo = fileInfo.type.startsWith('video') || fileInfo.type === 'video';
  const isImage = fileInfo.type.startsWith('image') || fileInfo.type === 'image';
  const isAudio = fileInfo.type.startsWith('audio') || fileInfo.type === 'audio';
  
  // Dynamic styling based on result
  const colorTheme = scanResult.isFake ? 'danger' : 'green-500';
  const colorHex = scanResult.isFake ? '#ff2a2a' : '#22c55e';

  const getInsights = () => {
    const anomalies = scanResult.details?.anomalies_detected || scanResult.anomalies_detected;
    if (anomalies && anomalies.length > 0) {
      return anomalies.map((anomaly: string, idx: number) => ({
        title: anomaly,
        desc: `Forensic analysis detected a mismatch anomaly in segment ${idx + 1}.`,
        conf: `${Math.round(scanResult.confidence)}%`,
        layer: isVideo ? 'Temporal Layer' : isImage ? 'Pixel Grid' : 'Spectral Base'
      }));
    }

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
      
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#050a15',
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          // Find all glassmorphism elements in the cloned document and simplify styles for html2canvas
          const glassElements = clonedDoc.querySelectorAll('.liquid-glass, .liquid-glass-strong');
          glassElements.forEach((el: any) => {
            el.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            el.style.background = '#050a15';
            el.style.backdropFilter = 'none';
            el.style.webkitBackdropFilter = 'none';
          });
          
          // Disable pseudo-element styles (which use complex -webkit-mask/mask-composite rules that crash html2canvas)
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            .liquid-glass::before, .liquid-glass::after,
            .liquid-glass-strong::before, .liquid-glass-strong::after {
              display: none !important;
              content: none !important;
              background: none !important;
              -webkit-mask: none !important;
              mask: none !important;
            }
          `;
          clonedDoc.head.appendChild(style);

          // Clean up style tags to replace oklch/oklab colors which crash html2canvas (common in Tailwind CSS v4)
          const styleTags = clonedDoc.querySelectorAll('style');
          styleTags.forEach((styleTag: any) => {
            let cssText = styleTag.textContent;
            if (cssText) {
              // Replace oklch/oklab colors with basic color equivalents to prevent html2canvas parsing crash
              // Replace red-like oklch with danger red
              cssText = cssText.replace(/oklch\(\s*0\.[45]\d*\s+0\.[12]\d*\s+1[56]\d*\s*\)/g, '#ff2a2a');
              // Replace green-like oklch with success green
              cssText = cssText.replace(/oklch\(\s*0\.[678]\d*\s+0\.[12]\d*\s+1[45]\d*\s*\)/g, '#22c55e');
              // Replace cyan/blue oklch with cyan primary
              cssText = cssText.replace(/oklch\(\s*0\.[789]\d*\s+0\.[12]\d*\s+2[234]\d*\s*\)/g, '#00f0ff');
              // Replace dark/black oklch with dark slate
              cssText = cssText.replace(/oklch\(\s*0\.1\d*\s+0\.[01]\d*\s+\d+\d*\s*\)/g, '#050a15');
              
              // Fallback: replace any remaining oklch/oklab with a standard color
              cssText = cssText.replace(/oklch\([^)]+\)/g, '#cbd5e1'); // neutral slate
              cssText = cssText.replace(/oklab\([^)]+\)/g, '#cbd5e1');
              styleTag.textContent = cssText;
            }
          });

          // Replace HTML5 video elements with a render-safe placeholder
          const videoElements = clonedDoc.querySelectorAll('video');
          videoElements.forEach((video: any) => {
            const placeholder = clonedDoc.createElement('div');
            placeholder.className = 'w-full h-full bg-slate-900/80 flex flex-col items-center justify-center text-white/50 border border-white/5 rounded-lg';
            placeholder.innerHTML = `
              <div style="font-size: 11px; font-family: monospace; letter-spacing: 0.1em; text-transform: uppercase;">
                VIDEO TIMELINE CORE
              </div>
            `;
            placeholder.style.width = (video.offsetWidth || 300) + 'px';
            placeholder.style.height = (video.offsetHeight || 180) + 'px';
            placeholder.style.backgroundColor = '#0f172a';
            placeholder.style.display = 'flex';
            placeholder.style.flexDirection = 'column';
            placeholder.style.alignItems = 'center';
            placeholder.style.justifyContent = 'center';
            video.parentNode.replaceChild(placeholder, video);
          });
        }
      });
      
      const data = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = pdfHeight;
      let position = 0;
      
      // Page 1
      pdf.addImage(data, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      
      // Add pages sequentially if content extends past the first page
      // Using a threshold of 10px avoids creating a blank page for small fractional overflows
      while (heightLeft > 10) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(data, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`DeepGuard_Report_${fileInfo.name.split('.')[0]}.pdf`);
    } catch (error: any) {
      console.error("Error generating PDF via html2canvas:", error);
      alert(`Advanced PDF generation failed: ${error.message || error}. Falling back to browser print.`);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadJSON = () => {
    const reportDataString = JSON.stringify({
      report_id: scanResult.id,
      timestamp: new Date().toISOString(),
      file_info: {
        name: fileInfo.name,
        type: fileInfo.type
      },
      verdict: {
        is_fake: scanResult.isFake,
        confidence: scanResult.confidence,
        risk_level: scanResult.riskLevel,
        status: scanResult.status
      },
      model_metadata: {
        model_used: scanResult.model_used || (isVideo ? 'TimeSformer + LSTM' : isImage ? 'Vision Transformer' : 'Wav2Lip CNN'),
        analysis_time_ms: scanResult.analysis_time_ms || 1200
      },
      detailed_anomalies: scanResult.details?.anomalies_detected || scanResult.anomalies_detected || insights.map((i: any) => i.title),
      raw_details: scanResult.details || {}
    }, null, 2);

    const blob = new Blob([reportDataString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DeepGuard_Forensic_Log_${fileInfo.name.split('.')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-400">Loading forensic report details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {error && (
        <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-start space-x-3 text-orange-400 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Forensic Analysis Report</h1>
          <p className="text-slate-400">Report ID: {scanResult.id || fallbackReportId}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
          <Link to="/app/overview" className="text-slate-400 hover:text-white transition-colors text-sm font-medium mr-2">
            &larr; Back to Overview
          </Link>
          <button 
            onClick={handleDownloadJSON}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 flex items-center text-slate-300 font-medium text-sm transition-all"
            title="Download full raw analysis data"
          >
            <FileJson className="w-4 h-4 mr-2 text-primary" />
            JSON Log
          </button>
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-6 py-2 rounded-lg glow-button-primary flex items-center shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
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
              {insights.map((insight: any, idx: number) => (
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
