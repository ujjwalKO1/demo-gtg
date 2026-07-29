import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, Plus, BarChart2, User } from 'lucide-react';

const BottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-[#FAF7F2] border-t-2 border-[#121212] px-6 py-2.5 flex justify-between items-center z-50">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 transition-colors ${
            isActive ? 'text-[#E05236]' : 'text-[#451A03] hover:text-[#291002]'
          }`
        }
      >
        <Home size={20} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[10px] font-bold font-sans">Discover</span>
      </NavLink>

      <NavLink
        to="/map"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 transition-colors ${
            isActive ? 'text-[#E05236]' : 'text-[#451A03] hover:text-[#291002]'
          }`
        }
      >
        <Map size={20} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[10px] font-bold font-sans">Map</span>
      </NavLink>

      {/* Floating Center Create Event Button */}
      <NavLink
        to="/create"
        className={({ isActive }) =>
          `flex flex-col items-center relative -top-6 bg-[#E05236] text-white p-3 rounded-full border-2 border-[#121212] shadow-[4px_4px_0_0_#121212] transition-all active:translate-y-1 active:shadow-none ${
            isActive ? 'bg-[#121212]' : ''
          }`
        }
      >
        <Plus size={24} strokeWidth={3} />
      </NavLink>

      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 transition-colors ${
            isActive ? 'text-[#E05236]' : 'text-[#451A03] hover:text-[#291002]'
          }`
        }
      >
        <BarChart2 size={20} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[10px] font-bold font-sans">Dashboard</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 transition-colors ${
            isActive ? 'text-[#E05236]' : 'text-[#451A03] hover:text-[#291002]'
          }`
        }
      >
        <User size={20} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[10px] font-bold font-sans">Profile</span>
      </NavLink>
    </div>
  );
};

export default BottomNav;
