import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import { 
  Search, MapPin, Sparkles, Navigation, Calendar, Plus, Compass, 
  ShieldCheck, HelpCircle, Users, CheckCircle, ArrowRight, Star
} from 'lucide-react';

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
  
  // FAQ state
  const [openFaq, setOpenFaq] = useState(null);

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

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="flex-grow bg-slate-50 pb-0 overflow-y-auto">
      {/* Restored: Premium Desktop Widescreen Hero Banner (Styled in Professional Teal) */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900 text-white py-12 md:py-16 px-6 mb-8 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none select-none">
          {/* Vector grid aesthetics */}
          <div className="w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="flex-1 text-center md:text-left">
            <span className="bg-teal-500/25 border border-teal-400/30 text-teal-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider select-none">
              🔥 Start hosting locally
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mt-4 max-w-xl">
              Discover Real-World Getogathers.
            </h1>
            <p className="text-sm md:text-base text-teal-100 mt-4 leading-relaxed max-w-lg">
              Get-To-Gather links you with local events of any scale. Host board game sessions in parks, Tech code hacks, 7v7 football matches, or acoustic music jams in your city.
            </p>
            <div className="flex flex-wrap items-center gap-3.5 mt-8 justify-center md:justify-start">
              <button
                onClick={() => navigate('/create')}
                className="bg-white hover:bg-gray-100 text-primary font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Plus size={16} strokeWidth={2.5} /> Host Getogather
              </button>
              <button
                onClick={() => navigate('/map')}
                className="bg-teal-650 hover:bg-teal-700 text-white border border-teal-500/50 font-bold text-xs px-6 py-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Compass size={16} /> Explore Map
              </button>
            </div>
          </div>
          
          {/* Stats indicator box for PC view (Restored & Refined with Professional Stats) */}
          <div className="hidden lg:flex flex-col gap-3 bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-3xl shrink-0 w-80 shadow-2xl">
            <h3 className="font-bold text-sm text-teal-200 uppercase tracking-wider">Active Community Metrics</h3>
            <div className="border-b border-white/10 pb-2 mt-2">
              <p className="text-[10px] text-teal-300 font-bold uppercase">Verified Hosts</p>
              <p className="text-xl font-extrabold text-white">850+ Organizers</p>
            </div>
            <div className="border-b border-white/10 pb-2">
              <p className="text-[10px] text-teal-300 font-bold uppercase">Success Attendance Rate</p>
              <p className="text-xl font-extrabold text-white">98.4% Checked In</p>
            </div>
            <div>
              <p className="text-[10px] text-teal-300 font-bold uppercase">Active Gatherings</p>
              <p className="text-xl font-extrabold text-white">1,420+ Monthly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Discover Layout (Events, Search & Filters) */}
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
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-xs text-gray-400 font-bold">Querying gatherings...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white border border-gray-150 rounded-3xl p-12 text-center max-w-md mx-auto shadow-xs">
            <span className="text-4xl">💤</span>
            <h3 className="font-extrabold text-gray-900 text-base mt-4">No events found</h3>
            <p className="text-xs text-gray-500 mt-2 mb-6 leading-relaxed">
              No gatherings found for "{activeCategory}" matching your keywords. Create a new one to invite others!
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
            {/* Trending sliders */}
            {!search && activeCategory === 'All' && trendingEvents.length > 0 && (
              <div>
                <h3 className="text-xs font-black text-gray-950 uppercase tracking-widest flex items-center gap-1.5 mb-4 font-sans">
                  <Sparkles size={14} className="text-amber-500 fill-amber-100" /> Trending Meetups
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {trendingEvents.slice(0, 4).map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              </div>
            )}

            {/* Main grid catalog */}
            <div className="mb-12">
              <h3 className="text-xs font-black text-gray-950 uppercase tracking-widest flex items-center gap-1.5 mb-4 font-sans">
                <Calendar size={14} className="text-primary" /> 
                {search || activeCategory !== 'All' || nearMeActive ? 'All Search Results' : 'Recommended Meetups'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {events.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* How it Works Section */}
      <section className="bg-white border-t border-b border-gray-150 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">How Get-To-Gather Works</h2>
            <p className="text-sm text-gray-500 leading-relaxed mt-3">
              We align guest incentives with host privileges, cultivating active, trust-centered local chapters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative text-center">
              <div className="w-12 h-12 bg-purple-50 text-primary rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-4 border border-purple-100 shadow-sm">
                1
              </div>
              <h3 className="font-extrabold text-sm text-gray-900">Browse Map</h3>
              <p className="text-xs text-gray-500 leading-relaxed mt-2 px-4">
                Open the interactive coordinates map to locate active sports, gaming, and tech gatherings near you.
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-12 h-12 bg-purple-50 text-primary rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-4 border border-purple-100 shadow-sm">
                2
              </div>
              <h3 className="font-extrabold text-sm text-gray-900">Request Entry</h3>
              <p className="text-xs text-gray-500 leading-relaxed mt-2 px-4">
                Submit an RSVP. Hosts evaluate check-in records and verified profiles to select community members.
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-12 h-12 bg-purple-50 text-primary rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-4 border border-purple-100 shadow-sm">
                3
              </div>
              <h3 className="font-extrabold text-sm text-gray-900">Attend Offline</h3>
              <p className="text-xs text-gray-500 leading-relaxed mt-2 px-4">
                Go to the resolved coordinates. Meet neighbors and check in to boost your local reputation score.
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-12 h-12 bg-purple-50 text-primary rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-4 border border-purple-100 shadow-sm">
                4
              </div>
              <h3 className="font-extrabold text-sm text-gray-900">Earn Free Tokens</h3>
              <p className="text-xs text-gray-500 leading-relaxed mt-2 px-4">
                Redeem your score milestones for free Host Credits, transforming from attendee into meetup creator.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Economy Highlights */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
              Creating Safe, Accountable, <br />
              <span className="text-primary">Spam-Free Local Nodes</span>
            </h2>
            <p className="text-sm text-gray-500 mt-4 leading-relaxed">
              Meeting strangers in offline spaces carries safety and accountability hurdles. 
              Our platform mechanics solve this using automated verification, anti-spam tokens, 
              and community reputations.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Verify Identity with Government ID</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Hosts link their official identification through secure portals, earning a visible Verified Host badge.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-primary flex items-center justify-center shrink-0 border border-teal-100">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Token Cost Restricts Coordinator Spam</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Every gathering requires consuming exactly 1 Host Credit, ensuring coordinate slots remain clean and authentic.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Reputation Boosts for Present Attendees</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Hosts verify presence offline via digital check-in sheets. Successful attendance builds community reputation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-100/50 border border-slate-200/60 rounded-3xl p-8 space-y-6">
            <h3 className="font-extrabold text-gray-900 text-lg">Why We Built Get-To-Gather</h3>
            <blockquote className="border-l-4 border-primary pl-4 text-xs text-gray-500 italic leading-relaxed">
              "We live in the most digitally connected era in human history, yet study after study shows record-high loneliness rates. 
              Online networks feed endless feeds but fail to facilitate actual, face-to-face meetups. Get-To-Gather is here to change that 
              by matching people by passion, allowing them to do what they actually like, rather than just what they can."
            </blockquote>

            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-10 rounded-full bg-teal-200 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" 
                  alt="Founder Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Vikram Malhotra</p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Community Lead, Get-To-Gather</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-50 border-t border-gray-150 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-primary text-xs font-bold uppercase tracking-wider bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">
              FAQs
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-3">Frequently Asked Questions</h2>
            <p className="text-xs text-gray-500 mt-1">Got questions? We've got answers.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How do I earn free Host Credits?",
                a: "You earn Community Score points by attending local meetups physically. The host marks your check-in via their digital dashboard during the event. Reaching score milestones automatically converts your reputation boosts into free Host Credits."
              },
              {
                q: "What is the Verified Host badge?",
                a: "Hosts can link official identification through our secure system. Once approved, they receive a permanent 'Verified Host' badge. This helps attendees know they are joining a safe, authenticated group."
              },
              {
                q: "Why does it cost 1 credit to host an event?",
                a: "The credit economy is built to prevent spam, duplicate coordinates, and empty listings. Requiring exactly 1 credit aligns host incentives and keeps the map-first listings of high quality."
              },
              {
                q: "Can I host games in local parks or turf spaces?",
                a: "Absolutely! You can choose any physical coordinates in your city (parks, turf networks, cafes, co-working lounges) and link a custom WhatsApp group URL for approved guests."
              }
            ].map((faq, index) => (
              <div 
                key={index} 
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-6 py-4.5 font-bold text-xs text-gray-800 flex justify-between items-center focus:outline-none hover:bg-slate-50/50"
                >
                  <span>{faq.q}</span>
                  <HelpCircle size={16} className={`text-gray-400 transition-transform ${openFaq === index ? 'rotate-180 text-primary' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 border-t border-gray-50 pt-3 text-xs text-gray-500 leading-relaxed bg-slate-50/25">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-gray-900 text-gray-400 border-t border-gray-850 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <span className="text-xl font-black text-white tracking-tight flex items-center gap-1.5 mb-4 select-none">
              Get-To-Gather<span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
            </span>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Rebuilding physical community networks in urban centers. Meet, collaborate, and share passions in neighborhood clusters.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => navigate('/')} className="hover:text-white transition-colors cursor-pointer">Discover Meetups</button></li>
              <li><button onClick={() => navigate('/map')} className="hover:text-white transition-colors cursor-pointer">Interactive Map</button></li>
              <li><button onClick={() => navigate('/create')} className="hover:text-white transition-colors cursor-pointer">Host a Circle</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Dashboard</h4>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors cursor-pointer">Organizer Console</button></li>
              <li><button onClick={() => navigate('/profile')} className="hover:text-white transition-colors cursor-pointer">Member Profile</button></li>
              <li><button onClick={() => navigate('/login')} className="hover:text-white transition-colors cursor-pointer">Quick Sign In</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Environment</h4>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span>Port 5173 (Vite + React)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span>Port 5000 (Express Node)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                <span>In-Memory MongoDB Active</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-500">
          <p>© 2026 Get-To-Gather. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Made with ❤️ for local community builders.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
