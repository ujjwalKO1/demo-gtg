import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import { Search, MapPin, Sparkles, Navigation, Calendar, Plus, Compass } from 'lucide-react';

const CATEGORIES = [
  { name: 'All', emoji: '🔍' },
  { name: 'Social', emoji: '🎉' },
  { name: 'Tech', emoji: '💻' },
  { name: 'Sports', emoji: '⚽' },
  { name: 'Music', emoji: '🎵' },
  { name: 'Food', emoji: '🍕' },
  { name: 'Art', emoji: '🎨' },
  { name: 'Study', emoji: '📚' },
  { name: 'Gaming', emoji: '🎮' }
];

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Geolocation states
  const [userCoords, setUserCoords] = useState(null);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [radius, setRadius] = useState(15); // Search radius 15km

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      let url = `/api/events?search=${encodeURIComponent(search)}&category=${encodeURIComponent(activeCategory)}`;
      
      if (nearMeActive && userCoords) {
        url += `&lat=${userCoords.latitude}&lng=${userCoords.longitude}&radius=${radius}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [search, activeCategory, nearMeActive, userCoords, radius]);

  const handleNearMeToggle = () => {
    if (nearMeActive) {
      setNearMeActive(false);
      setUserCoords(null);
      return;
    }

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setNearMeActive(true);
      },
      (error) => {
        console.error(error);
        alert('Could not retrieve your location.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const trendingEvents = events.filter(e => e.organizer?.isVerified || e.spotsLeft <= 2);

  return (
    <div className="flex-grow bg-slate-50 pb-16 overflow-y-auto">
      {/* Premium Desktop Widescreen Hero Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 text-white py-12 md:py-16 px-6 mb-8 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none select-none">
          {/* Vector grid aesthetics */}
          <div className="w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="flex-1 text-center md:text-left">
            <span className="bg-purple-500/25 border border-purple-400/30 text-purple-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider select-none">
              🔥 Start hosting locally
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mt-4 max-w-xl">
              Discover Real-World Getogathers.
            </h1>
            <p className="text-sm md:text-base text-purple-100 mt-4 leading-relaxed max-w-lg">
              GTG links you with local events of any scale. Host UNO sessions in parks, Tech code hacks, 7v7 football matches, or acoustic music jams in your city.
            </p>
            <div className="flex flex-wrap items-center gap-3.5 mt-8 justify-center md:justify-start">
              <button
                onClick={() => navigate('/create')}
                className="bg-white hover:bg-gray-100 text-primary font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={16} strokeWidth={2.5} /> Host Getogather
              </button>
              <button
                onClick={() => navigate('/map')}
                className="bg-purple-650 hover:bg-purple-700 text-white border border-purple-500/50 font-bold text-xs px-6 py-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Compass size={16} /> Explore Map
              </button>
            </div>
          </div>
          
          {/* Stats indicator box for PC view */}
          <div className="hidden lg:flex flex-col gap-3 bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-3xl shrink-0 w-80 shadow-2xl">
            <h3 className="font-bold text-sm text-purple-200 uppercase tracking-wider">Active Community Metrics</h3>
            <div className="border-b border-white/10 pb-2 mt-2">
              <p className="text-[10px] text-purple-300 font-bold uppercase">Reputation Verified</p>
              <p className="text-xl font-extrabold text-white">Trust Badging Enabled</p>
            </div>
            <div className="border-b border-white/10 pb-2">
              <p className="text-[10px] text-purple-300 font-bold uppercase">Credit Earning Rate</p>
              <p className="text-xl font-extrabold text-white">1 Credit per 5 RSVPs</p>
            </div>
            <div>
              <p className="text-[10px] text-purple-300 font-bold uppercase">Cloud Database</p>
              <p className="text-xl font-extrabold text-white">MongoDB Atlas Tier</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Discover Layout */}
      <div className="content-container">
        {/* Search, filters, slider range controls */}
        <div className="bg-white border border-gray-150 rounded-3xl p-5 mb-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search games, tech meetups, sports, jams..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium text-gray-800"
              />
            </div>

            {/* Geolocation Button */}
            <button
              onClick={handleNearMeToggle}
              className={`px-5 py-3 rounded-2xl border font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                nearMeActive
                  ? 'bg-primary text-white border-primary shadow-md shadow-purple-100'
                  : 'bg-gray-50 text-gray-550 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Navigation size={14} className={nearMeActive ? 'fill-white' : ''} />
              <span>Near Me</span>
            </button>
          </div>

          {/* Location Range Slider */}
          {nearMeActive && userCoords && (
            <div className="bg-purple-50/50 border border-purple-100 px-4 py-3 rounded-2xl flex flex-col gap-1 w-full md:w-72 shrink-0">
              <div className="flex justify-between items-center text-[10px] font-extrabold text-primary uppercase">
                <span>Search Range:</span>
                <span>{radius} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-1 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          )}
        </div>

        {/* Categories Chip Panel */}
        <div className="mb-8">
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none select-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all border cursor-pointer ${
                  activeCategory === cat.name
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Render Lists */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-xs text-gray-400 font-bold">Querying getogathers...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white border border-gray-150 rounded-3xl p-12 text-center max-w-md mx-auto shadow-xs">
            <span className="text-4xl">💤</span>
            <h3 className="font-extrabold text-gray-900 text-base mt-4">No events found</h3>
            <p className="text-xs text-gray-500 mt-2 mb-6 leading-relaxed">
              No getogathers found for "{activeCategory}" matching your keywords. Create a new one to invite others!
            </p>
            <button
              onClick={() => navigate('/create')}
              className="bg-primary hover:bg-primary-dark text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md"
            >
              Start Event Group
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Trending sliders (only on default search filters) */}
            {!search && activeCategory === 'All' && trendingEvents.length > 0 && (
              <div>
                <h2 className="text-sm font-black text-gray-950 uppercase tracking-widest flex items-center gap-1.5 mb-4 font-sans">
                  <Sparkles size={16} className="text-amber-500 fill-amber-100" /> Trending Meetups
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {trendingEvents.slice(0, 4).map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              </div>
            )}

            {/* Main grid catalog */}
            <div>
              <h2 className="text-sm font-black text-gray-950 uppercase tracking-widest flex items-center gap-1.5 mb-4 font-sans">
                <Calendar size={16} className="text-primary" /> 
                {search || activeCategory !== 'All' || nearMeActive ? 'All Search Results' : 'Recommended Meetups'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {events.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
