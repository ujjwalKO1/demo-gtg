import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#FAF7F2] border-t border-[#E6DFD3] pt-16 pb-8 mt-auto w-full relative z-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-extrabold text-[#291002] tracking-tight mb-4">
              Get-To-Gather<span className="text-[#E05236]">.</span>
            </h2>
            <p className="text-[#78350F] text-sm max-w-sm mb-6 leading-relaxed">
              Turn plans into memories. The easiest way to discover, host, and join hyper-local meetups in your city.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-[#EAE5D9] flex items-center justify-center text-[#5C2D12] hover:bg-[#E05236] hover:text-white transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#EAE5D9] flex items-center justify-center text-[#5C2D12] hover:bg-[#E05236] hover:text-white transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#EAE5D9] flex items-center justify-center text-[#5C2D12] hover:bg-[#E05236] hover:text-white transition-colors">
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-[#451A03] mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link to="/map" className="text-[#78350F] hover:text-[#E05236] text-sm transition-colors">Map View</Link></li>
              <li><Link to="/create" className="text-[#78350F] hover:text-[#E05236] text-sm transition-colors">Host a Meetup</Link></li>
              <li><Link to="/dashboard" className="text-[#78350F] hover:text-[#E05236] text-sm transition-colors">Dashboard</Link></li>
              <li><a href="#" className="text-[#78350F] hover:text-[#E05236] text-sm transition-colors">Safety Guidelines</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-[#451A03] mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-[#78350F] hover:text-[#E05236] text-sm transition-colors">About Us</a></li>
              <li><a href="#" className="text-[#78350F] hover:text-[#E05236] text-sm transition-colors">Contact</a></li>
              <li><a href="#" className="text-[#78350F] hover:text-[#E05236] text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-[#78350F] hover:text-[#E05236] text-sm transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#EAE5D9] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#92400E] text-xs font-medium">
            &copy; {new Date().getFullYear()} Get-To-Gather. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-[#92400E] text-xs font-bold bg-[#EAE5D9] px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Systems Operational
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
