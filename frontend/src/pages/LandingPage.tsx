import { Link } from 'react-router-dom';
import { FileVideo, FileAudio, ImageIcon, ArrowUpRight, Play, Clock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import BlurText from '../components/BlurText';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex flex-col pt-24 pb-8 overflow-hidden">
        
        {/* Hero Content Layer */}
        <div className="relative z-10 flex-1 flex flex-col px-4 items-center">
          
          <motion.div 
            initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
            animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
            transition={{ delay: 0.4, ease: "easeOut" }}
            className="liquid-glass rounded-full px-1.5 py-1.5 flex items-center mb-6 shadow-sm"
          >
            <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-semibold mr-3">New</span>
            <span className="text-sm text-white/90 pr-3 font-body">DeepGuard 2.0 Live Analysis Now Available</span>
          </motion.div>

          <BlurText 
            text="Detect Deepfakes Before They Cause Damage"
            className="text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.8] max-w-4xl justify-center tracking-[-2px] text-center"
          />

          <motion.p 
            initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
            animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
            transition={{ delay: 0.8, ease: "easeOut" }}
            className="mt-6 text-sm md:text-base text-white/90 max-w-2xl text-center font-body font-light leading-tight"
          >
            AI-powered platform to detect fake images, manipulated videos, and synthetic voices. Verify the authenticity of digital content with unparalleled confidence scores and forensic reports.
          </motion.p>

          <motion.div 
            initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
            animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
            transition={{ delay: 1.1, ease: "easeOut" }}
            className="mt-8 flex items-center gap-6"
          >
            <Link to="/app/dashboard" className="liquid-glass-strong rounded-full px-6 py-3 flex items-center text-sm font-medium text-white hover:bg-white/10 transition-colors">
              Start Detection <ArrowUpRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>

          <motion.div 
            initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
            animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
            transition={{ delay: 1.3, ease: "easeOut" }}
            className="mt-12 flex flex-wrap justify-center gap-4"
          >
            <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem] flex flex-col justify-between">
              <Clock className="w-7 h-7 text-white mb-6" strokeWidth={1.5} />
              <div>
                <p className="text-4xl tracking-[-1px] leading-none font-heading italic text-white">&lt; 3s</p>
                <p className="text-xs text-white font-body font-light mt-2">Analysis per File</p>
              </div>
            </div>
            <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem] flex flex-col justify-between">
              <Globe className="w-7 h-7 text-white mb-6" strokeWidth={1.5} />
              <div>
                <p className="text-4xl tracking-[-1px] leading-none font-heading italic text-white">99.1%</p>
                <p className="text-xs text-white font-body font-light mt-2">Detection Accuracy</p>
              </div>
            </div>
          </motion.div>

          {/* Partners Row */}
          <motion.div 
            initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
            animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
            transition={{ delay: 1.4, ease: "easeOut" }}
            className="mt-auto pt-16 flex flex-col items-center gap-4 w-full"
          >
            <div className="liquid-glass rounded-full px-4 py-1.5 text-xs font-medium text-white/90">
              Trusted by top newsrooms and cybersecurity firms
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 font-heading italic text-2xl md:text-3xl text-white tracking-tight mt-2 opacity-80">
              <span>Reuters</span>
              <span>·</span>
              <span>CyberDef</span>
              <span>·</span>
              <span>Verity</span>
              <span>·</span>
              <span>Sentinel</span>
              <span>·</span>
              <span>Aegis</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: CAPABILITIES */}
      <section className="relative min-h-screen w-full overflow-hidden flex flex-col">
        <div className="relative z-10 px-8 md:px-16 lg:px-20 pt-24 pb-16 flex flex-col min-h-screen">
          <div className="mb-auto">
            <p className="text-sm font-body text-white/80 mb-6 uppercase tracking-wider">// Platform Capabilities</p>
            <h2 className="font-heading italic text-white text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px]">
              Detection<br/>Evolved
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            
            {/* Feature 1 */}
            <div className="liquid-glass rounded-[1.25rem] p-6 min-h-[420px] flex flex-col relative overflow-hidden group">
              {/* AI Brain Image Background */}
              <div className="absolute inset-0 top-12 bottom-24 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all duration-700 z-0 pointer-events-none">
                <img 
                  src="/ai_brain.png" 
                  alt="AI Forensics Brain" 
                  className="w-full h-full object-cover mix-blend-screen opacity-50 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 mask-image-gradient" 
                  style={{ WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 80%)' }}
                />
              </div>

              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="w-11 h-11 liquid-glass-strong bg-black/40 backdrop-blur-md rounded-[0.75rem] flex items-center justify-center border border-white/20 shadow-lg">
                  <ImageIcon className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                </div>
                <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                  <span className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap bg-black/40 backdrop-blur-md">Pixel Analysis</span>
                  <span className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap bg-black/40 backdrop-blur-md">GAN Artifacts</span>
                  <span className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap bg-black/40 backdrop-blur-md">Metadata</span>
                </div>
              </div>
              <div className="mt-auto relative z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent -mx-6 -mb-6 p-6 pt-12">
                <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none mb-3">Image Forensics</h3>
                <p className="text-sm text-white/90 font-body font-light leading-snug max-w-[32ch]">
                  Detect AI-generated or heavily edited images instantly. Our models scan for invisible noise patterns and unnatural pixel blending.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="liquid-glass rounded-[1.25rem] p-6 min-h-[420px] flex flex-col relative overflow-hidden group">
              {/* Video Forensics Image Background */}
              <div className="absolute inset-0 top-12 bottom-24 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all duration-700 z-0 pointer-events-none">
                <img 
                  src="/video_forensics.png" 
                  alt="Video Forensics Tracking Mesh" 
                  className="w-full h-full object-cover mix-blend-screen opacity-50 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 mask-image-gradient" 
                  style={{ WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 80%)' }}
                />
              </div>

              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="w-11 h-11 liquid-glass-strong bg-black/40 backdrop-blur-md rounded-[0.75rem] flex items-center justify-center border border-white/20 shadow-lg">
                  <FileVideo className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                </div>
                <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                  <span className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap bg-black/40 backdrop-blur-md">Frame-by-Frame</span>
                  <span className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap bg-black/40 backdrop-blur-md">Face-Swap</span>
                  <span className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap bg-black/40 backdrop-blur-md">Lip-Sync</span>
                </div>
              </div>
              <div className="mt-auto relative z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent -mx-6 -mb-6 p-6 pt-12">
                <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none mb-3">Video Analysis</h3>
                <p className="text-sm text-white/90 font-body font-light leading-snug max-w-[32ch]">
                  Analyze videos frame-by-frame. Detect deepfake facial manipulation and micro-anomalies in lip-syncing algorithms.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="liquid-glass rounded-[1.25rem] p-6 min-h-[420px] flex flex-col relative overflow-hidden group">
              {/* Audio Forensics Image Background */}
              <div className="absolute inset-0 top-12 bottom-24 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all duration-700 z-0 pointer-events-none">
                <img 
                  src="/audio_forensics.png" 
                  alt="Audio Forensics Spectral Map" 
                  className="w-full h-full object-cover mix-blend-screen opacity-50 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 mask-image-gradient" 
                  style={{ WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 80%)' }}
                />
              </div>

              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="w-11 h-11 liquid-glass-strong bg-black/40 backdrop-blur-md rounded-[0.75rem] flex items-center justify-center border border-white/20 shadow-lg">
                  <FileAudio className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                </div>
                <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                  <span className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap bg-black/40 backdrop-blur-md">Voice Clone</span>
                  <span className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap bg-black/40 backdrop-blur-md">Spectral Map</span>
                  <span className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap bg-black/40 backdrop-blur-md">Real-time</span>
                </div>
              </div>
              <div className="mt-auto relative z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent -mx-6 -mb-6 p-6 pt-12">
                <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none mb-3">Audio Detection</h3>
                <p className="text-sm text-white/90 font-body font-light leading-snug max-w-[32ch]">
                  Identify synthetic and cloned voices using deep spectral analysis, distinguishing genuine speech from AI generation.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
