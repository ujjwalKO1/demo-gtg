import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, ShieldCheck } from 'lucide-react';

const EventCard = ({ event, isDark = false }) => {
  const navigate = useNavigate();

  // Helper to color-code categories
  const getCategoryStyles = (category) => {
    switch (category) {
      case 'Sports':
        return isDark 
          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/50' 
          : 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Tech':
        return isDark 
          ? 'bg-blue-950/40 text-blue-300 border-blue-900/50' 
          : 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Social':
        return isDark 
          ? 'bg-amber-950/40 text-amber-300 border-amber-900/50' 
          : 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Food':
        return isDark 
          ? 'bg-red-950/40 text-red-300 border-red-900/50' 
          : 'bg-red-50 text-red-700 border-red-100';
      case 'Music':
        return isDark 
          ? 'bg-indigo-950/40 text-indigo-300 border-indigo-900/50' 
          : 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Art':
        return isDark 
          ? 'bg-pink-950/40 text-pink-300 border-pink-900/50' 
          : 'bg-pink-50 text-pink-700 border-pink-100';
      case 'Study':
        return isDark 
          ? 'bg-cyan-950/40 text-cyan-300 border-cyan-900/50' 
          : 'bg-cyan-50 text-cyan-700 border-cyan-100';
      case 'Gaming':
        return isDark 
          ? 'bg-purple-950/40 text-purple-300 border-purple-900/50' 
          : 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return isDark 
          ? 'bg-slate-900 text-slate-300 border-slate-800' 
          : 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const formattedDate = new Date(event.dateTime).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div
      onClick={() => navigate(`/event/${event._id}`)}
      className={`${
        isDark 
          ? 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800 text-white shadow-2xl hover:border-slate-700' 
          : 'bg-white border-gray-100 text-gray-900 shadow-xs hover:shadow-md'
      } rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer active:scale-[0.99] flex flex-col`}
    >
      {/* Cover Image & Category Chip */}
      <div className="relative h-40 w-full bg-slate-900">
        <img
          src={event.coverImage}
          alt={event.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shadow-sm ${getCategoryStyles(event.category)}`}>
            {event.category}
          </span>
        </div>
        {event.spotsLeft <= 2 && event.spotsLeft > 0 && (
          <div className="absolute top-3 right-3">
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
              Almost Full
            </span>
          </div>
        )}
        {event.spotsLeft === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-xs">
            <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
              Event Full
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className={`font-bold leading-snug text-base mb-2 line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {event.title}
          </h3>

          {/* Organizer Info & Verified badge */}
          <div className={`flex items-center gap-1.5 mb-3 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            <span className="text-[11px]">Hosted by</span>
            <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>{event.organizer?.name}</span>
            {event.organizer?.isVerified && (
              <ShieldCheck size={14} className="text-primary fill-purple-100" title="Verified Organizer" />
            )}
          </div>

          {/* Date & Time */}
          <div className={`flex items-center gap-2 text-xs mb-2 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            <Calendar size={14} className="text-slate-400 shrink-0" />
            <span>{formattedDate}</span>
          </div>

          {/* Location & Distance */}
          <div className={`flex items-center gap-2 text-xs mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            <MapPin size={14} className="text-slate-400 shrink-0" />
            <span className="line-clamp-1 flex-1">{event.location.address}</span>
            {event.distance !== undefined && event.distance !== null && (
              <span className="font-semibold text-primary shrink-0 bg-purple-50 px-1.5 py-0.5 rounded-md text-[10px]">
                {event.distance} km away
              </span>
            )}
          </div>
        </div>

        {/* Footer Info: Spots left */}
        <div className={`pt-3 border-t flex justify-between items-center text-xs ${isDark ? 'border-slate-800/80 text-slate-400' : 'border-gray-50 text-gray-550'}`}>
          <div className="flex items-center gap-1">
            <Users size={14} className="text-slate-400" />
            <span>
              Limit: <strong className={isDark ? 'text-slate-200' : 'text-gray-700'}>{event.participantLimit}</strong>
            </span>
          </div>
          <span className="font-medium">
            {event.spotsLeft > 0 ? (
              <span>
                <strong className="text-primary font-bold">{event.spotsLeft}</strong> spots left
              </span>
            ) : (
              <span className="text-rose-500 font-semibold">No spots left</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
