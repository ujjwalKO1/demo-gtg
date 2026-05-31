import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, ShieldCheck } from 'lucide-react';

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  // Helper to color-code categories
  const getCategoryStyles = (category) => {
    switch (category) {
      case 'Sports':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Tech':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Social':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Food':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'Music':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Art':
        return 'bg-pink-50 text-pink-700 border-pink-100';
      case 'Study':
        return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      case 'Gaming':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
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
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99] flex flex-col"
    >
      {/* Cover Image & Category Chip */}
      <div className="relative h-40 w-full bg-gray-100">
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
          <h3 className="font-bold text-gray-900 leading-snug text-base mb-2 line-clamp-1">
            {event.title}
          </h3>

          {/* Organizer Info & Verified badge */}
          <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500">
            <span className="text-[11px]">Hosted by</span>
            <span className="font-medium text-gray-700">{event.organizer?.name}</span>
            {event.organizer?.isVerified && (
              <ShieldCheck size={14} className="text-primary fill-purple-100" title="Verified Organizer" />
            )}
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
            <Calendar size={14} className="text-gray-400 shrink-0" />
            <span>{formattedDate}</span>
          </div>

          {/* Location & Distance */}
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-4">
            <MapPin size={14} className="text-gray-400 shrink-0" />
            <span className="line-clamp-1 flex-1">{event.location.address}</span>
            {event.distance !== undefined && event.distance !== null && (
              <span className="font-semibold text-primary shrink-0 bg-purple-50 px-1.5 py-0.5 rounded-md text-[10px]">
                {event.distance} km away
              </span>
            )}
          </div>
        </div>

        {/* Footer Info: Spots left */}
        <div className="pt-3 border-t border-gray-50 flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Users size={14} className="text-gray-400" />
            <span>
              Limit: <strong className="text-gray-700">{event.participantLimit}</strong>
            </span>
          </div>
          <span className="font-medium text-gray-600">
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
