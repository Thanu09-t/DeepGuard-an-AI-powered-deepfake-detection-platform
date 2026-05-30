const Contact = () => {
  return (
    <div className="py-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
        <p className="text-slate-400">Get in touch for enterprise inquiries, demos, or to report fake content.</p>
      </div>

      <div className="liquid-glass p-8 rounded-[1.25rem]">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
              <input type="text" className="w-full liquid-glass border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input type="email" className="w-full liquid-glass border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="john@company.com" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
            <input type="text" className="w-full liquid-glass border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Company Name" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Inquiry Type</label>
            <select className="w-full liquid-glass border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none">
              <option>Request Demo</option>
              <option>Enterprise Inquiry</option>
              <option>Report Fake Content</option>
              <option>General Support</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
            <textarea rows={4} className="w-full liquid-glass border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="How can we help?"></textarea>
          </div>

          <button type="button" className="w-full py-3 rounded-lg glow-button-primary text-lg">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
