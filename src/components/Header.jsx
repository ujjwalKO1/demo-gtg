import React from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

const Header = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-[#FDFBF7] border-b-2 border-[#121212] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 select-none shrink-0">
          <span className="text-2xl font-display font-bold tracking-tight text-[#121212] flex items-center gap-1">
            Get-To-Gather<span className="w-2.5 h-2.5 bg-[#E05236] border border-[#121212]"></span>
          </span>
        </Link>

        {/* Desktop PC Nav Links */}
        <nav className="hidden sm:flex items-center gap-6 text-[15px] font-semibold text-[#121212]">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `transition-all px-3 py-1.5 rounded-lg border-2 ${
                isActive ? 'bg-[#E05236] text-[#FDFBF7] border-[#121212] shadow-[2px_2px_0_0_#121212]' : 'border-transparent hover:border-[#121212] hover:bg-black/5'
              }`
            }
          >
            Discover
          </NavLink>
          <NavLink
            to="/map"
            className={({ isActive }) =>
              `transition-all px-3 py-1.5 rounded-lg border-2 ${
                isActive ? 'bg-[#E05236] text-[#FDFBF7] border-[#121212] shadow-[2px_2px_0_0_#121212]' : 'border-transparent hover:border-[#121212] hover:bg-black/5'
              }`
            }
          >
            Map View
          </NavLink>
          <NavLink
            to="/create"
            className={({ isActive }) =>
              `transition-all px-3 py-1.5 rounded-lg border-2 ${
                isActive ? 'bg-[#E05236] text-[#FDFBF7] border-[#121212] shadow-[2px_2px_0_0_#121212]' : 'border-transparent hover:border-[#121212] hover:bg-black/5'
              }`
            }
          >
            Host Meetup
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `transition-all px-3 py-1.5 rounded-lg border-2 ${
                isActive ? 'bg-[#E05236] text-[#FDFBF7] border-[#121212] shadow-[2px_2px_0_0_#121212]' : 'border-transparent hover:border-[#121212] hover:bg-black/5'
              }`
            }
          >
            Dashboard
          </NavLink>
        </nav>

        {/* Right side items */}
        <div className="flex items-center gap-4">
          {isAuthenticated && user && (
            <>
              {/* Host Credits Pill Display */}
              <Link
                to="/profile"
                className="flex items-center gap-1.5 bg-[#FFF48F] border-2 border-[#121212] text-[#121212] px-3.5 py-1.5 rounded-lg text-sm font-bold shadow-[2px_2px_0_0_#121212] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#121212] transition-all select-none"
              >
                <span>{user.hostCredits} Credits</span>
              </Link>

              {/* User profile dropdown trigger */}
              <div
                onClick={() => navigate('/profile')}
                className="relative w-10 h-10 rounded-lg border-2 border-[#121212] cursor-pointer overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-[2px_2px_0_0_#121212] shrink-0"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
                {user.isVerified && (
                  <div className="absolute bottom-0 right-0 bg-[#E05236] border border-[#121212] rounded-full p-[1px]">
                    <ShieldCheck size={12} className="text-white" />
                  </div>
                )}
              </div>
            </>
          )}

          {!isAuthenticated && (
            <Link
              to="/login"
              className="text-sm font-bold text-[#FDFBF7] bg-[#121212] border-2 border-[#121212] px-5 py-2 rounded-lg hover:bg-transparent hover:text-[#121212] transition-colors shadow-[2px_2px_0_0_#121212]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
