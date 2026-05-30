import { Check, X } from 'lucide-react';

const Pricing = () => {
  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white mb-4">Transparent Pricing for Deepfake Detection</h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">Choose the plan that fits your security needs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Free Plan */}
        <div className="liquid-glass rounded-2xl p-8 flex flex-col">
          <h3 className="text-2xl font-semibold text-white mb-2">Free</h3>
          <p className="text-slate-400 mb-6">For casual users</p>
          <div className="text-4xl font-bold text-white mb-8">$0<span className="text-lg text-slate-500 font-normal">/mo</span></div>
          <ul className="space-y-4 mb-8 flex-1">
            <FeatureItem text="5 scans per day" included={true} />
            <FeatureItem text="Image detection only" included={true} />
            <FeatureItem text="Video & Audio detection" included={false} />
            <FeatureItem text="PDF reports" included={false} />
          </ul>
          <button className="w-full py-3 rounded-lg border border-slate-600 text-white hover:bg-slate-800 transition-colors">Current Plan</button>
        </div>

        {/* Pro Plan */}
        <div className="liquid-glass rounded-2xl p-8 flex flex-col border border-primary shadow-[0_0_20px_rgba(0,240,255,0.2)] relative transform md:-translate-y-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Most Popular</div>
          <h3 className="text-2xl font-semibold text-primary glow-text mb-2">Pro</h3>
          <p className="text-slate-400 mb-6">For professionals & creators</p>
          <div className="text-4xl font-bold text-white mb-8">$49<span className="text-lg text-slate-500 font-normal">/mo</span></div>
          <ul className="space-y-4 mb-8 flex-1">
            <FeatureItem text="Unlimited scans" included={true} />
            <FeatureItem text="Image, Video & Audio detection" included={true} />
            <FeatureItem text="PDF forensic reports" included={true} />
            <FeatureItem text="History tracking" included={true} />
            <FeatureItem text="API access" included={false} />
          </ul>
          <button className="w-full py-3 rounded-lg glow-button-primary">Upgrade to Pro</button>
        </div>

        {/* Enterprise Plan */}
        <div className="liquid-glass rounded-2xl p-8 flex flex-col">
          <h3 className="text-2xl font-semibold text-white mb-2">Enterprise</h3>
          <p className="text-slate-400 mb-6">For organizations & teams</p>
          <div className="text-4xl font-bold text-white mb-8">Custom</div>
          <ul className="space-y-4 mb-8 flex-1">
            <FeatureItem text="Everything in Pro" included={true} />
            <FeatureItem text="API access" included={true} />
            <FeatureItem text="Team dashboard (Multi-user)" included={true} />
            <FeatureItem text="Real-time monitoring" included={true} />
            <FeatureItem text="Priority support" included={true} />
          </ul>
          <button className="w-full py-3 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors">Contact Sales</button>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ text, included }: { text: string, included: boolean }) => (
  <li className="flex items-center">
    {included ? (
      <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
    ) : (
      <X className="w-5 h-5 text-slate-600 mr-3 flex-shrink-0" />
    )}
    <span className={included ? "text-slate-200" : "text-slate-500 line-through"}>{text}</span>
  </li>
);

export default Pricing;
