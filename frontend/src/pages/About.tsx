const About = () => {
  return (
    <div className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="liquid-glass p-12 rounded-[1.25rem] text-center">
        <h1 className="text-4xl font-bold text-white mb-8">Our Mission</h1>
        <p className="text-2xl text-slate-300 leading-relaxed font-light mb-8">
          DeepGuard AI helps individuals, media teams, cybersecurity professionals, and organizations verify digital content and fight misinformation using AI-powered forensic analysis.
        </p>
        <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-8 shadow-[0_0_10px_rgba(0,240,255,0.5)]"></div>
        <p className="text-slate-400 text-lg">
          In an era where generative AI makes it increasingly difficult to distinguish reality from fabrication, DeepGuard provides the essential tools to protect digital truth.
        </p>
      </div>
    </div>
  );
};

export default About;
