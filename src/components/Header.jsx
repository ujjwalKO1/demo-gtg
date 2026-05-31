import React from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

const Header = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-150 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 select-none shrink-0">
          <span className="text-2xl font-black tracking-tight text-primary flex items-center gap-1.5">
            GTG <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-primary border border-purple-100 rounded-full font-mono uppercase tracking-wider">Web</span>
          </span>
        </Link>

        {/* Desktop PC Nav Links */}
        <nav className="hidden sm:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-gray-500">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `transition-all border-b-2 pb-1 ${
                isActive ? 'text-primary border-primary' : 'border-transparent text-gray-500 hover:text-primary'
              }`
            }
          >
            Discover
          </NavLink>
          <NavLink
            to="/map"
            className={({ isActive }) =>
              `transition-all border-b-2 pb-1 ${
                isActive ? 'text-primary border-primary' : 'border-transparent text-gray-500 hover:text-primary'
              }`
            }
          >
            Map View
          </NavLink>
          <NavLink
            to="/create"
            className={({ isActive }) =>
              `transition-all border-b-2 pb-1 ${
                isActive ? 'text-primary border-primary' : 'border-transparent text-gray-500 hover:text-primary'
              }`
            }
          >
            Host Meetup
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `transition-all border-b-2 pb-1 ${
                isActive ? 'text-primary border-primary' : 'border-transparent text-gray-500 hover:text-primary'
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
                className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs hover:bg-amber-100 transition-all select-none"
              >
                <span className="text-amber-500">⚡</span>
                <span>{user.hostCredits} Credits</span>
              </Link>

              {/* User profile dropdown trigger */}
              <div
                onClick={() => navigate('/profile')}
                className="relative w-9 h-9 rounded-xl border border-gray-200 cursor-pointer overflow-hidden hover:scale-105 active:scale-95 transition-all shrink-0"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
                {user.isVerified && (
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-[1px]">
                    <ShieldCheck size={12} className="text-primary fill-purple-100" />
                  </div>
                )}
              </div>
            </>
          )}

          {!isAuthenticated && (
            <Link
              to="/login"
              className="text-xs font-bold text-primary border border-primary px-4 py-2 rounded-full hover:bg-purple-50 transition-colors"
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
