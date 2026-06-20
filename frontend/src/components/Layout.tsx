import { Outlet, Link, useLocation } from 'react-router-dom';
import { Shield, ArrowUpRight, Menu, X } from 'lucide-react';
import FadingVideo from './FadingVideo';
import Chatbot from './Chatbot';
import { useState } from 'react';

const Layout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Overview', path: '/app/overview' },
    { name: 'Scanner', path: '/app/dashboard' },
    { name: 'Analytics', path: '/app/analytics' },
    { name: 'Reports', path: '/app/reports' },
    { name: 'Pricing', path: '/pricing' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-white relative">
      
      {/* Persistent Global Background Video */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <FadingVideo 
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ width: "100%", height: "100%" }}
        />
        {/* Subtle overlay to ensure readability */}
        <div className="absolute inset-0 bg-black/40 mix-blend-multiply"></div>
      </div>

      {/* Cinematic Top Navbar */}
      <nav className="fixed top-4 left-0 right-0 px-4 md:px-8 lg:px-16 z-50 flex items-center justify-between pointer-events-none">
        
        {/* Left: Logo */}
        <Link to="/" className="w-12 h-12 liquid-glass rounded-full flex items-center justify-center pointer-events-auto shrink-0 transition-transform hover:scale-105">
          <Shield className="w-5 h-5 text-white" />
        </Link>

        {/* Center: Links Pill */}
        <div className="hidden lg:flex liquid-glass rounded-full px-1.5 py-1.5 items-center pointer-events-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors font-body ${
                  isActive 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          
          <Link to="/app/dashboard" className="ml-2 bg-white text-black px-4 py-2 rounded-full text-sm font-medium flex items-center whitespace-nowrap hover:bg-white/90 transition-colors">
            Start Detection <ArrowUpRight className="ml-1 w-4 h-4" />
          </Link>
        </div>

        {/* Right: Spacer to balance logo on desktop */}
        <div className="w-12 h-12 shrink-0 hidden lg:block pointer-events-auto"></div>
        
        {/* Mobile menu button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden liquid-glass rounded-full w-12 h-12 flex items-center justify-center pointer-events-auto transition-transform active:scale-95"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md pt-24 px-4 flex flex-col pointer-events-auto lg:hidden">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-6 py-4 rounded-xl text-lg font-medium transition-colors font-body ${
                    isActive 
                      ? 'bg-white/10 text-white border border-white/20' 
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            
            <Link 
              to="/app/dashboard" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-4 bg-white text-black px-6 py-4 rounded-xl text-lg font-medium flex items-center justify-between hover:bg-white/90 transition-colors"
            >
              Start Detection <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full relative z-10 flex flex-col pt-24 pb-8 pointer-events-auto">
        <Outlet />
      </main>

      {/* Global AI Chatbot Widget */}
      <Chatbot />
    </div>
  );
};

export default Layout;
