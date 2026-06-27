import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import { 
  Search, MapPin, Sparkles, Navigation, Calendar, Plus, Compass, 
  ShieldCheck, HelpCircle, Users, CheckCircle, ArrowRight, Quote
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
    <div className="flex-grow bg-slate-950 text-slate-100 pb-0 overflow-y-auto relative min-h-screen">
      {/* Glow Blobs Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none select-none"></div>
      <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none select-none"></div>
      <div className="absolute bottom-[10%] left-[20%] w-[35%] h-[35%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none select-none"></div>

      {/* Restored Split Hero Layout with Dark Glassmorphism (No Metrics stats card) */}
      <div className="max-w-7xl mx-auto px-6 mt-8 mb-10">
        <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-center gap-12">
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
            <div className="w-full h-full bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
          </div>

          <div className="flex-1 text-center md:text-left z-10">
            <span className="inline-flex items-center gap-1.5 bg-teal-950/40 border border-teal-900/50 text-teal-300 text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest select-none mb-6 animate-pulse-slow">
              <Sparkles size={12} className="fill-teal-300/10" /> Physical Connection Reimagined
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Discover Passionate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">Local Gatherings.</span>
            </h1>
            <p className="text-sm md:text-base text-slate-350 mt-5 leading-relaxed max-w-xl mx-auto md:mx-0">
              Get-To-Gather is a local meetup platform designed for physical activities. 
              Find chess tables, coding circles, football games, or acoustic music jams 
              happening directly in your neighborhood.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mt-8 justify-center md:justify-start">
              <button
                onClick={() => navigate('/map')}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs px-6.5 py-3.5 rounded-xl transition-all shadow-lg shadow-teal-500/10 flex items-center gap-2 cursor-pointer active:scale-97"
              >
                <Compass size={16} /> Explore Interactive Map
              </button>
              <button
                onClick={() => navigate('/create')}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs px-6.5 py-3.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer active:scale-97"
              >
                <Plus size={16} /> Host a Gathering
              </button>
            </div>
          </div>

          {/* Restored split side - Showing a floating glass card preview of a live event instead of active metrics */}
          <div className="hidden lg:flex flex-1 justify-center items-center z-10 relative">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6.5 rounded-3xl w-80 shadow-2xl relative animate-float hover:scale-105 transition-all duration-300">
              <div className="absolute -top-3 -right-3 bg-teal-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-xl shadow-md">
                Tonight
              </div>
              <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest block mb-1">Acoustic Jam Session</span>
              <h3 className="font-extrabold text-base text-white">Cubbon Park Guitar Club</h3>
              
              <div className="mt-4 space-y-2 text-xs text-slate-400">
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="text-teal-400" />
                  <span>Bangalore, India</span>
                </p>
                <p className="flex items-center gap-2">
                  <Calendar size={14} className="text-teal-400" />
                  <span>7:30 PM • 3 km away</span>
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                <span className="bg-slate-850 px-2.5 py-1 rounded-md">Music & Social</span>
                <span className="text-teal-400 font-bold">5 spots left</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Discover Layout (Events, Search & Filters) */}
      <div className="content-container z-10 relative">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-white tracking-tight">Search Neighborhood Events</h2>
          <p className="text-xs text-slate-400 mt-1">Filter events by coordinates, keyword queries, or categories</p>
        </div>

        {/* Search, filters, slider range controls (Glassmorphism styling) */}
        <div className="bg-white/[0.03] backdrop-blur-lg border border-white/10 rounded-3xl p-5 mb-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search games, tech meetups, sports, jams..."
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all font-medium text-white placeholder-slate-400"
              />
            </div>

            {/* Geolocation Button */}
            <button
              onClick={handleNearMeToggle}
              className={`px-5 py-3 rounded-2xl border font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                nearMeActive
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                  : 'bg-white/[0.02] text-slate-350 border-white/10 hover:bg-white/10'
              }`}
            >
              <Navigation size={14} className={nearMeActive ? 'fill-white' : ''} />
              <span>Near Me</span>
            </button>
          </div>

          {/* Location Range Slider */}
          {nearMeActive && userCoords && (
            <div className="bg-teal-950/20 border border-teal-900/40 px-4 py-3 rounded-2xl flex flex-col gap-1 w-full md:w-72 shrink-0">
              <div className="flex justify-between items-center text-[10px] font-extrabold text-teal-400 uppercase">
                <span>Search Range:</span>
                <span>{radius} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-1 bg-teal-900 rounded-lg appearance-none cursor-pointer accent-teal-400"
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
                    ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-lg shadow-teal-500/10'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20'
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
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-xs text-slate-400 font-bold">Querying gatherings...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-12 text-center max-w-md mx-auto shadow-xs">
            <span className="text-4xl">💤</span>
            <h3 className="font-extrabold text-white text-base mt-4">No events found</h3>
            <p className="text-xs text-slate-400 mt-2 mb-6 leading-relaxed">
              No gatherings found for "{activeCategory}" matching your keywords. Create a new one to invite others!
            </p>
            <button
              onClick={() => navigate('/create')}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Start Event Group
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Trending sliders */}
            {!search && activeCategory === 'All' && trendingEvents.length > 0 && (
              <div>
                <h3 className="text-xs font-black text-teal-400 uppercase tracking-widest flex items-center gap-1.5 mb-4 font-sans">
                  <Sparkles size={14} className="text-teal-400 fill-teal-400/10" /> Trending Meetups
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {trendingEvents.slice(0, 4).map((event) => (
                    <EventCard key={event._id} event={event} isDark={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Main grid catalog */}
            <div className="mb-16">
              <h3 className="text-xs font-black text-teal-400 uppercase tracking-widest flex items-center gap-1.5 mb-4 font-sans">
                <Calendar size={14} className="text-teal-400" /> 
                {search || activeCategory !== 'All' || nearMeActive ? 'All Search Results' : 'Recommended Meetups'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {events.map((event) => (
                  <EventCard key={event._id} event={event} isDark={true} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* How it Works Section (Glassmorphism layout) */}
      <section className="bg-white/[0.01] border-t border-b border-white/5 py-16 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">How Get-To-Gather Works</h2>
            <p className="text-sm text-slate-400 leading-relaxed mt-3">
              We align guest incentives with host privileges, cultivating active, trust-centered local chapters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white/[0.02] border border-white/10 p-6 rounded-3xl relative text-center hover:border-teal-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-teal-950/40 text-teal-300 rounded-full flex items-center justify-center font-black text-sm mx-auto mb-4 border border-teal-900/50 shadow-sm">
                1
              </div>
              <h3 className="font-extrabold text-sm text-white">Browse Map</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Open the interactive coordinates map to locate active sports, gaming, and tech gatherings near you.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/10 p-6 rounded-3xl relative text-center hover:border-teal-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-teal-950/40 text-teal-300 rounded-full flex items-center justify-center font-black text-sm mx-auto mb-4 border border-teal-900/50 shadow-sm">
                2
              </div>
              <h3 className="font-extrabold text-sm text-white">Request Entry</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Submit an RSVP. Hosts evaluate check-in records and verified profiles to select community members.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/10 p-6 rounded-3xl relative text-center hover:border-teal-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-teal-950/40 text-teal-300 rounded-full flex items-center justify-center font-black text-sm mx-auto mb-4 border border-teal-900/50 shadow-sm">
                3
              </div>
              <h3 className="font-extrabold text-sm text-white">Attend Offline</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Go to the resolved coordinates. Meet neighbors and check in to boost your local reputation score.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/10 p-6 rounded-3xl relative text-center hover:border-teal-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-teal-950/40 text-teal-300 rounded-full flex items-center justify-center font-black text-sm mx-auto mb-4 border border-teal-900/50 shadow-sm">
                4
              </div>
              <h3 className="font-extrabold text-sm text-white">Earn Free Tokens</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
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
            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-snug">
              Creating Safe, Accountable, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">Spam-Free Local Nodes</span>
            </h2>
            <p className="text-sm text-slate-450 mt-4 leading-relaxed">
              Meeting strangers in offline spaces carries safety and accountability hurdles. 
              Our platform mechanics solve this using automated verification, anti-spam tokens, 
              and community reputations.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/30 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-900/30">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Verify Identity with Government ID</h4>
                  <p className="text-xs text-slate-450 mt-1">
                    Hosts link their official identification through secure portals, earning a visible Verified Host badge.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-teal-950/30 text-teal-400 flex items-center justify-center shrink-0 border border-teal-900/30">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Token Cost Restricts Coordinator Spam</h4>
                  <p className="text-xs text-slate-455 mt-1">
                    Every gathering requires consuming exactly 1 Host Credit, ensuring coordinate slots remain clean and authentic.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-amber-950/30 text-amber-400 flex items-center justify-center shrink-0 border border-amber-900/30">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Reputation Boosts for Present Attendees</h4>
                  <p className="text-xs text-slate-455 mt-1">
                    Hosts verify presence offline via digital check-in sheets. Successful attendance builds community reputation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Redesigned reasoning quote card (Removed Vikram Malhotra's name and profile, kept quote text) */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden shadow-xl">
            <div className="absolute top-4 right-4 text-teal-500/10 pointer-events-none">
              <Quote size={80} strokeWidth={4} />
            </div>
            
            <h3 className="font-extrabold text-white text-lg mb-4 flex items-center gap-2 z-10">
              <Sparkles size={16} className="text-teal-400" /> Why We Built Get-To-Gather
            </h3>
            <blockquote className="border-l-4 border-teal-500 pl-4 text-sm text-slate-300 italic leading-relaxed z-10">
              "We live in the most digitally connected era in human history, yet study after study shows record-high loneliness rates. 
              Online networks feed endless feeds but fail to facilitate actual, face-to-face meetups. Get-To-Gather is here to change that 
              by matching people by passion, allowing them to do what they actually like, rather than just what they can."
            </blockquote>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white/[0.01] border-t border-white/5 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-teal-300 text-xs font-bold uppercase tracking-wider bg-teal-950/40 border border-teal-900/50 px-3 py-1 rounded-full">
              FAQs
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-3">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-400 mt-1">Got questions? We've got answers.</p>
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
                className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-6 py-4.5 font-bold text-xs text-slate-200 flex justify-between items-center focus:outline-none hover:bg-white/5"
                >
                  <span>{faq.q}</span>
                  <HelpCircle size={16} className={`text-slate-400 transition-transform ${openFaq === index ? 'rotate-180 text-teal-400' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 border-t border-white/5 pt-3 text-xs text-slate-450 leading-relaxed bg-white/[0.01]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <span className="text-xl font-black text-white tracking-tight flex items-center gap-1.5 mb-4 select-none">
              Get-To-Gather<span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Rebuilding physical community networks in urban centers. Meet, collaborate, and share passions in neighborhood clusters.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => navigate('/')} className="hover:text-white transition-colors cursor-pointer text-left">Discover Meetups</button></li>
              <li><button onClick={() => navigate('/map')} className="hover:text-white transition-colors cursor-pointer text-left">Interactive Map</button></li>
              <li><button onClick={() => navigate('/create')} className="hover:text-white transition-colors cursor-pointer text-left">Host a Circle</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Dashboard</h4>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors cursor-pointer text-left">Organizer Console</button></li>
              <li><button onClick={() => navigate('/profile')} className="hover:text-white transition-colors cursor-pointer text-left">Member Profile</button></li>
              <li><button onClick={() => navigate('/login')} className="hover:text-white transition-colors cursor-pointer text-left">Quick Sign In</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Environment</h4>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                <span>Port 5173 (Vite + React)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                <span>Port 5000 (Express Node)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                <span>In-Memory MongoDB Active</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-550">
          <p>© 2026 Get-To-Gather. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Made with ❤️ for local community builders.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
