import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, Plus, BarChart2, User } from 'lucide-react';

const BottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-white border-t border-gray-200 px-6 py-2.5 flex justify-between items-center z-50 shadow-lg">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 transition-colors ${
            isActive ? 'text-primary' : 'text-gray-400'
          }`
        }
      >
        <Home size={18} />
        <span className="text-[9px] font-medium font-sans">Discover</span>
      </NavLink>

      <NavLink
        to="/map"
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 transition-colors ${
            isActive ? 'text-primary' : 'text-gray-400'
          }`
        }
      >
        <Map size={18} />
        <span className="text-[9px] font-medium font-sans">Map</span>
      </NavLink>

      {/* Floating Center Create Event Button */}
      <NavLink
        to="/create"
        className={({ isActive }) =>
          `flex flex-col items-center relative -top-5 bg-primary text-white p-3 rounded-full shadow-lg shadow-purple-200 transition-all ${
            isActive ? 'ring-4 ring-purple-100' : ''
          }`
        }
      >
        <Plus size={22} strokeWidth={3} />
      </NavLink>

      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 transition-colors ${
            isActive ? 'text-primary' : 'text-gray-400'
          }`
        }
      >
        <BarChart2 size={18} />
        <span className="text-[9px] font-medium font-sans">Dashboard</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center gap-0.5 transition-colors ${
            isActive ? 'text-primary' : 'text-gray-400'
          }`
        }
      >
        <User size={18} />
        <span className="text-[9px] font-medium font-sans">Profile</span>
      </NavLink>
    </div>
  );
};

export default BottomNav;
