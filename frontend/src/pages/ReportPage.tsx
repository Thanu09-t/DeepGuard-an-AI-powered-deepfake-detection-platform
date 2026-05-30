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
          <p className="text-slate-400">Report ID: REP-{Math.floor(Math.random() * 90000) + 10000}-AX</p>
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
                  <div className="aspect-video bg-slate-800 rounded-lg mb-3 relative overflow-hidden flex items-center justify-center">
                     <p className="text-slate-600 font-mono text-sm">ANALYSIS_SECTOR_0{idx + 1}</p>
                     {scanResult.isFake && (
                       <div className={`absolute ${idx === 0 ? 'top-1/3 right-1/3 w-16 h-16' : 'bottom-1/3 left-1/3 w-12 h-12'} bg-danger/50 rounded-full blur-xl mix-blend-screen`}></div>
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
