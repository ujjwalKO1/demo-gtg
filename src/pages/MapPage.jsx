import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LeafletMap from '../components/LeafletMap';
import { MapPin, Navigation, Calendar, Users, ShieldCheck, X, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { name: 'All', emoji: '🔍' },
  { name: 'Social', emoji: '🎉' },
  { name: 'Tech', emoji: '💻' },
  { name: 'Sports', emoji: '⚽' },
  { name: 'Music', emoji: '🎵' },
  { name: 'Food', emoji: '🍕' }
];

const MapPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Geolocation and map states
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Default Bangalore
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/events?category=${encodeURIComponent(activeCategory)}`);
        const data = await response.json();
        if (data.success) {
          setEvents(data.events);
          if (data.events.length > 0 && !selectedEvent) {
            // Pick first event to center initially ONLY if we don't have user location yet
            // Check using a ref or just let the navigator logic handle it.
            // Actually, let's just let the map center on user location entirely if possible,
            // or just center on first event as fallback if location is not granted.
            const firstEv = data.events[0];
            if (firstEv.location?.latitude && firstEv.location?.longitude) {
              setMapCenter((prevCenter) => {
                // If map is still on the default Bangalore center (12.9716), override it.
                // Otherwise (meaning GPS located them), don't steal the camera.
                if (prevCenter[0] === 12.9716 && prevCenter[1] === 77.5946) {
                  return [firstEv.location.latitude, firstEv.location.longitude];
                }
                return prevCenter;
              });
            }
          }
        }
      } catch (err) {
        console.error('Error loading events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [activeCategory]);

  const locateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = [position.coords.latitude, position.coords.longitude];
          setUserLocation(loc);
          setMapCenter(loc);
        },
        (error) => {
          console.error(error);
          if (error.code === 1) {
            toast.error('Location permission denied. Please allow location access in your browser.');
          } else if (error.code === 3) {
            toast.error('Location request timed out. Your GPS signal might be weak indoors.');
          } else {
            toast.error('Could not determine your location.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 25000,
          maximumAge: 30000
        }
      );
    }
  };

  useEffect(() => {
    locateUser();
  }, []);

  const handleSelectEvent = (event) => {
    if (selectedEvent?._id === event._id) {
      navigate(`/event/${event._id}`);
      return;
    }
    setSelectedEvent(event);
    if (event.location?.latitude && event.location?.longitude) {
      setMapCenter([event.location.latitude, event.location.longitude]);
    }
  };

  return (
    <div className="flex-grow flex flex-col md:flex-row h-[calc(100vh-69px)] overflow-hidden">
      {/* LEFT COLUMN: Event Lists Sidebar (Visible on PC, Hidden/Overlay on Mobile) */}
      <div className="w-full md:w-96 lg:w-[420px] bg-[#FAF7F2] border-r border-[#E6DFD3] flex flex-col shrink-0 h-[45vh] md:h-full z-20 shadow-md md:shadow-none">
        {/* Category Filters inside Sidebar */}
        <div className="p-4 border-b border-[#E6DFD3] bg-[#F4F0E8]/40 shrink-0">
          <h2 className="font-extrabold text-sm text-[#3E2723] mb-3 uppercase tracking-wider">Discover on Map</h2>
          
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setActiveCategory(cat.name);
                  setSelectedEvent(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all border cursor-pointer ${
                  activeCategory === cat.name
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-white text-[#5D4037] border-[#E6DFD3] hover:bg-[#FAF7F2]'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* List of events matching category */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-3 text-[11px] text-[#5D4037] font-bold">Querying location pins...</p>
            </div>
          ) : events.length === 0 ? (
            <p className="text-xs text-[#5D4037]/60 text-center py-12">No active gatherings in this category.</p>
          ) : (
            events.map((ev) => (
              <div
                key={ev._id}
                onClick={() => handleSelectEvent(ev)}
                className={`border rounded-2xl p-3.5 flex gap-3 cursor-pointer hover:bg-[#F4F0E8]/50 hover:border-primary/30 transition-all duration-150 relative ${
                  selectedEvent?._id === ev._id 
                    ? 'border-primary bg-amber-50/40 ring-1 ring-amber-100' 
                    : 'border-[#E6DFD3] bg-white'
                }`}
              >
                <img
                  src={ev.coverImage}
                  alt={ev.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="bg-amber-50 border border-amber-100 text-primary text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                        {ev.category}
                      </span>
                      {ev.spotsLeft <= 2 && ev.spotsLeft > 0 && (
                        <span className="text-rose-500 font-black text-[8px] uppercase tracking-wider animate-pulse">
                          Almost Full
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-xs text-[#3E2723] leading-snug mt-1 truncate">{ev.title}</h3>
                    <p className="text-[10px] text-[#5D4037]/70 mt-0.5">by {ev.organizer?.name}</p>
                  </div>
                  
                  <div className="flex items-center justify-between gap-3 text-[10px] mt-2">
                    <div className="flex items-center gap-3 text-slate-500 min-w-0">
                      <span className="flex items-center gap-1 font-semibold text-[#5D4037] shrink-0">
                        <Users size={12} className="text-[#5D4037]/50" /> {ev.spotsLeft} spots left
                      </span>
                      <span className="truncate flex items-center gap-0.5 text-[#5D4037]/75">
                        <MapPin size={10} className="text-[#5D4037]/50 shrink-0" /> {ev.location.address.split(',')[0]}
                      </span>
                    </div>
                    {selectedEvent?._id === ev._id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/event/${ev._id}`);
                        }}
                        className="bg-primary hover:bg-primary-dark text-white text-[9px] font-black px-2.5 py-1 rounded-lg transition-all flex items-center gap-0.5 shrink-0 animate-fade-in cursor-pointer"
                      >
                        Details <ChevronRight size={10} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Map Area */}
      <div className="flex-grow relative h-full">
        {/* Floating Locator Trigger */}
        <button
          onClick={locateUser}
          className="absolute right-4 top-4 z-10 bg-[#FAF7F2] border border-[#E6DFD3] text-[#3E2723] p-3.5 rounded-full shadow-lg hover:bg-[#F4F0E8] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Locate my position"
        >
          <Navigation size={18} className="fill-[#3E2723] text-[#3E2723]" />
        </button>

        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-xs text-gray-400 font-bold">Synchronizing leaflet map tiles...</p>
          </div>
        ) : (
          <LeafletMap
            events={events}
            center={mapCenter}
            zoom={13}
            onMarkerClick={handleSelectEvent}
            userLocation={userLocation}
          />
        )}

        {/* Mobile-Only Preview Slide-up Card Overlay (Hidden on Desktop) */}
        {selectedEvent && (
          <div className="md:hidden absolute bottom-4 left-4 right-4 z-10 bg-white rounded-3xl border border-gray-100 p-4 shadow-2xl flex flex-col gap-3 animate-slide-up">
            <div className="flex gap-3 relative">
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={16} />
              </button>

              <img
                src={selectedEvent.coverImage}
                alt={selectedEvent.title}
                className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0"
              />
              <div className="flex-grow min-w-0 pr-6">
                <span className="bg-purple-50 text-primary border border-purple-100 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {selectedEvent.category}
                </span>
                <h3 className="font-bold text-gray-900 text-sm leading-tight mt-1 truncate">
                  {selectedEvent.title}
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Hosted by {selectedEvent.organizer?.name}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-[11px] text-gray-550 bg-gray-50 p-2.5 rounded-2xl border border-gray-100/60">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-gray-400 shrink-0" />
                <span>{new Date(selectedEvent.dateTime).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-gray-400 shrink-0" />
                <span className="truncate">{selectedEvent.location.address}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="text-[11px] text-gray-550 flex items-center gap-1">
                <Users size={12} /> {selectedEvent.spotsLeft} spots remaining
              </span>
              <button
                onClick={() => navigate(`/event/${selectedEvent._id}`)}
                className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
              >
                Details <ChevronRight size={12} className="inline-block" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
