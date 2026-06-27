import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import { 
  Search, MapPin, Sparkles, Navigation, Calendar, Plus, Compass, 
  ShieldCheck, HelpCircle, Users, CheckCircle, ArrowRight, Quote, X
} from 'lucide-react';

const CATEGORIES = [
  { name: 'All' },
  { name: 'Social' },
  { name: 'Tech' },
  { name: 'Sports' },
  { name: 'Music' },
  { name: 'Food' },
  { name: 'Art' },
  { name: 'Study' },
  { name: 'Gaming' }
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

  // How it Works popup modal states
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [modalTab, setModalTab] = useState('join');

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
    <div className="flex-grow bg-[#FAF7F2] text-[#3E2723] pb-0 overflow-y-auto relative min-h-screen">
      {/* Full-Screen Widescreen Hero Banner (Warm Earthy Tones & Centered Layout) */}
      <section className="min-h-[calc(100vh-70px)] bg-gradient-to-b from-[#FAF7F2] to-[#EFECE3] flex flex-col justify-center items-center px-6 relative text-center overflow-hidden">
        {/* Subtle decorative pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none">
          <div className="w-full h-full bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>

        {/* Ambient earthy glows with floating animation */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none select-none animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#B45309]/5 rounded-full blur-[100px] pointer-events-none select-none animate-float [animation-delay:2s]"></div>

        <div className="max-w-4xl mx-auto flex flex-col justify-center items-center gap-6 z-10">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-none text-[#3E2723] max-w-5xl opacity-0 animate-hero-title [animation-fill-mode:forwards]">
            Discover Real-World <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#B45309] block mt-3 text-3xl sm:text-4xl md:text-6xl whitespace-nowrap opacity-0 animate-hero-text-glow [animation-fill-mode:forwards]">
              Turn plans into memories.
            </span>
          </h1>
          <p className="text-base md:text-lg text-[#5D4037] leading-relaxed max-w-2xl mt-4 opacity-0 animate-slide-up [animation-delay:500ms] [animation-fill-mode:forwards]">
            Your one-stop destination for offline socializing. We support local communities to connect, share passions, and host gatherings seamlessly.
          </p>
          
          {/* Embedded Search Input directly on the Hero Opening Page */}
          <div className="w-full max-w-lg mt-2 z-10 relative opacity-0 animate-slide-up [animation-delay:650ms] [animation-fill-mode:forwards]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#5D4037]/65">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chess, code jams, football, music..."
              className="w-full bg-[#FAF7F2]/90 border border-[#E6DFD3] rounded-2xl pl-11 pr-4 py-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all font-medium text-[#3E2723] placeholder-[#5D4037]/50 shadow-md"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4 justify-center opacity-0 animate-slide-up [animation-delay:800ms] [animation-fill-mode:forwards]">
            <button
              onClick={() => navigate('/create')}
              className="bg-primary hover:bg-[#92400E] text-white font-bold text-sm px-9 py-4 rounded-xl transition-all shadow-lg shadow-amber-900/10 flex items-center gap-2 cursor-pointer active:scale-97"
            >
              <Plus size={18} strokeWidth={2.5} /> Host Gathering
            </button>
            <button
              onClick={() => navigate('/map')}
              className="bg-transparent hover:bg-primary/5 text-primary border border-primary/30 font-bold text-sm px-9 py-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer active:scale-97"
            >
              <Compass size={18} /> Join Gatherings
            </button>
          </div>
        </div>

        {/* Floating Downward Arrow Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 select-none z-10 opacity-0 animate-fade-in [animation-delay:1000ms] [animation-fill-mode:forwards]">
          <span className="text-[10px] font-black text-[#5D4037] uppercase tracking-widest opacity-60">Scroll Down</span>
          <button
            onClick={() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-10 h-10 bg-white border border-[#E6DFD3] hover:bg-[#F4F0E8] rounded-full flex items-center justify-center text-primary shadow-xs hover:shadow-md transition-all cursor-pointer animate-float"
          >
            <ArrowRight size={18} className="rotate-90" />
          </button>
        </div>
      </section>

      {/* Main Discover Layout (Events, Search & Filters) */}
      <div id="discover" className="content-container py-16 scroll-mt-12">
        {/* Prominent Search Bar (Above the Box) */}
        <div className="mb-8 max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-[#3E2723] tracking-tight">Search Neighborhood Events</h2>
          <p className="text-xs text-[#5D4037] mt-1 mb-4">Find active sports, games, jams, and circles in your neighborhood</p>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#5D4037]/65">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chess, code jams, football, music..."
              className="w-full bg-[#F4F0E8] border border-[#E6DFD3] rounded-2xl pl-11 pr-4 py-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all font-medium text-[#3E2723] placeholder-[#5D4037]/50 shadow-sm"
            />
          </div>
        </div>

        {/* The Controls Box (Sits below the search, styled in distinct warm sand colors) */}
        <div className="bg-[#EFECE3] border border-[#E6DFD3] rounded-3xl p-5 mb-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-2xl mx-auto">
          {/* Geolocation Button */}
          <button
            onClick={handleNearMeToggle}
            className={`px-5 py-3 rounded-2xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
              nearMeActive
                ? 'bg-primary text-white border-primary shadow-md shadow-amber-900/10'
                : 'bg-[#F4F0E8] text-[#5D4037] border-[#E6DFD3] hover:bg-[#FAF7F2]'
            }`}
          >
            <Navigation size={14} className={nearMeActive ? 'fill-white' : ''} />
            <span>Search Near Me</span>
          </button>

          {/* Location Range Slider */}
          {nearMeActive && userCoords && (
            <div className="bg-[#FAF7F2] border border-[#E6DFD3] px-4 py-3 rounded-2xl flex flex-col gap-1 flex-grow">
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
                className="w-full h-1 bg-[#EAE5D9] rounded-lg appearance-none cursor-pointer accent-primary"
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
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all border cursor-pointer ${
                  activeCategory === cat.name
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white text-[#5D4037] border-[#E6DFD3] hover:bg-[#FAF7F2]'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Render Lists */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-xs text-[#5D4037] font-bold">Querying gatherings...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white border border-[#E6DFD3] rounded-3xl p-12 text-center max-w-md mx-auto shadow-xs">
            <span className="text-4xl">💤</span>
            <h3 className="font-extrabold text-[#3E2723] text-base mt-4">No events found</h3>
            <p className="text-xs text-[#5D4037] mt-2 mb-6 leading-relaxed">
              No gatherings found for "{activeCategory}" matching your keywords. Create a new one to invite others!
            </p>
            <button
              onClick={() => navigate('/create')}
              className="bg-primary hover:bg-[#92400E] text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Start Event Group
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Trending sliders */}
            {!search && activeCategory === 'All' && trendingEvents.length > 0 && (
              <div>
                <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1.5 mb-4 font-sans">
                  <Sparkles size={14} className="text-primary fill-primary/10" /> Trending Meetups
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {trendingEvents.slice(0, 4).map((event) => (
                    <EventCard key={event._id} event={event} isDark={false} />
                  ))}
                </div>
              </div>
            )}

            {/* Main grid catalog */}
            <div className="mb-16">
              <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1.5 mb-4 font-sans">
                <Calendar size={14} className="text-primary" /> 
                {search || activeCategory !== 'All' || nearMeActive ? 'All Search Results' : 'Recommended Meetups'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {events.map((event) => (
                  <EventCard key={event._id} event={event} isDark={false} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* How it Works Section */}
      <section className="bg-white border-t border-b border-[#E6DFD3] py-16 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-[#3E2723] tracking-tight">How Get-To-Gather Works</h2>
            <p className="text-sm text-[#5D4037] leading-relaxed mt-3">
              We align guest incentives with host privileges, cultivating active, trust-centered local chapters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-[#FAF7F2] border border-[#E6DFD3] p-6 rounded-3xl relative text-center hover:border-primary/30 transition-all duration-300 shadow-3xs">
              <div className="w-12 h-12 bg-amber-50 text-primary rounded-full flex items-center justify-center font-black text-sm mx-auto mb-4 border border-amber-100 shadow-sm">
                1
              </div>
              <h3 className="font-extrabold text-sm text-[#3E2723]">Browse Map</h3>
              <p className="text-xs text-[#5D4037] leading-relaxed mt-2">
                Open the interactive coordinates map to locate active sports, gaming, and tech gatherings near you.
              </p>
            </div>

            <div className="bg-[#FAF7F2] border border-[#E6DFD3] p-6 rounded-3xl relative text-center hover:border-primary/30 transition-all duration-300 shadow-3xs">
              <div className="w-12 h-12 bg-amber-50 text-primary rounded-full flex items-center justify-center font-black text-sm mx-auto mb-4 border border-amber-100 shadow-sm">
                2
              </div>
              <h3 className="font-extrabold text-sm text-[#3E2723]">Request Entry</h3>
              <p className="text-xs text-[#5D4037] leading-relaxed mt-2">
                Submit an RSVP. Hosts evaluate check-in records and verified profiles to select community members.
              </p>
            </div>

            <div className="bg-[#FAF7F2] border border-[#E6DFD3] p-6 rounded-3xl relative text-center hover:border-primary/30 transition-all duration-300 shadow-3xs">
              <div className="w-12 h-12 bg-amber-50 text-primary rounded-full flex items-center justify-center font-black text-sm mx-auto mb-4 border border-amber-100 shadow-sm">
                3
              </div>
              <h3 className="font-extrabold text-sm text-[#3E2723]">Attend Offline</h3>
              <p className="text-xs text-[#5D4037] leading-relaxed mt-2">
                Go to the resolved coordinates. Meet neighbors and check in to boost your local reputation score.
              </p>
            </div>

            <div className="bg-[#FAF7F2] border border-[#E6DFD3] p-6 rounded-3xl relative text-center hover:border-primary/30 transition-all duration-300 shadow-3xs">
              <div className="w-12 h-12 bg-amber-50 text-primary rounded-full flex items-center justify-center font-black text-sm mx-auto mb-4 border border-amber-100 shadow-sm">
                4
              </div>
              <h3 className="font-extrabold text-sm text-[#3E2723]">Earn Free Tokens</h3>
              <p className="text-xs text-[#5D4037] leading-relaxed mt-2">
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
            <h2 className="text-3xl font-extrabold text-[#3E2723] tracking-tight leading-snug">
              Creating Safe, Accountable, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#B45309]">Spam-Free Local Nodes</span>
            </h2>
            <p className="text-sm text-[#5D4037] mt-4 leading-relaxed">
              Meeting strangers in offline spaces carries safety and accountability hurdles. 
              Our platform mechanics solve this using automated verification, anti-spam tokens, 
              and community reputations.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#3E2723]">Verify Identity with Government ID</h4>
                  <p className="text-xs text-[#5D4037] mt-1">
                    Hosts link their official identification through secure portals, earning a visible Verified Host badge.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-primary flex items-center justify-center shrink-0 border border-amber-100">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#3E2723]">Token Cost Restricts Coordinator Spam</h4>
                  <p className="text-xs text-[#5D4037] mt-1">
                    Every gathering requires consuming exactly 1 Host Credit, ensuring coordinate slots remain clean and authentic.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-primary flex items-center justify-center shrink-0 border border-amber-100">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#3E2723]">Reputation Boosts for Present Attendees</h4>
                  <p className="text-xs text-[#5D4037] mt-1">
                    Hosts verify presence offline via digital check-in sheets. Successful attendance builds community reputation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Redesigned reasoning quote card (Removed Vikram's details, kept quote text) */}
          <div className="bg-white border border-[#E6DFD3] rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden shadow-sm">
            <div className="absolute top-4 right-4 text-[#78350F]/5 pointer-events-none">
              <Quote size={80} strokeWidth={4} />
            </div>
            
            <h3 className="font-extrabold text-[#3E2723] text-lg mb-4 flex items-center gap-2 z-10">
              <Sparkles size={16} className="text-primary" /> Why We Built Get-To-Gather
            </h3>
            <blockquote className="border-l-4 border-primary pl-4 text-sm text-[#5D4037] italic leading-relaxed z-10">
              "We live in the most digitally connected era in human history, yet study after study shows record-high loneliness rates. 
              Online networks feed endless feeds but fail to facilitate actual, face-to-face meetups. Get-To-Gather is here to change that 
              by matching people by passion, allowing them to do what they actually like, rather than just what they can."
            </blockquote>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#FAF7F2] border-t border-[#E6DFD3] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-primary text-xs font-bold uppercase tracking-wider bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
              FAQs
            </span>
            <h2 className="text-3xl font-extrabold text-[#3E2723] tracking-tight mt-3">Frequently Asked Questions</h2>
            <p className="text-xs text-[#5D4037] mt-1">Got questions? We've got answers.</p>
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
                className="bg-white border border-[#E6DFD3] rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-6 py-4.5 font-bold text-xs text-[#3E2723] flex justify-between items-center focus:outline-none hover:bg-slate-50/50"
                >
                  <span>{faq.q}</span>
                  <HelpCircle size={16} className={`text-slate-400 transition-transform ${openFaq === index ? 'rotate-180 text-primary' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 border-t border-white/5 pt-3 text-xs text-[#5D4037] leading-relaxed bg-slate-50/25">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Footer (Matching Earthy Theme Colors) */}
      <footer className="bg-[#EFECE3] text-[#5D4037] border-t border-[#E6DFD3] py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <span className="text-xl font-black text-[#3E2723] tracking-tight flex items-center gap-1.5 mb-4 select-none">
              Get-To-Gather<span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
            </span>
            <p className="text-[11px] text-[#5D4037] leading-relaxed">
              Rebuilding physical community networks in urban centers. Meet, collaborate, and share passions in neighborhood clusters.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-[#3E2723] uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => navigate('/')} className="hover:text-[#3E2723] transition-colors cursor-pointer text-left">Discover Meetups</button></li>
              <li><button onClick={() => navigate('/map')} className="hover:text-[#3E2723] transition-colors cursor-pointer text-left">Interactive Map</button></li>
              <li><button onClick={() => navigate('/create')} className="hover:text-[#3E2723] transition-colors cursor-pointer text-left">Host a Circle</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#3E2723] uppercase tracking-wider mb-4">Dashboard</h4>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => navigate('/dashboard')} className="hover:text-[#3E2723] transition-colors cursor-pointer text-left">Organizer Console</button></li>
              <li><button onClick={() => navigate('/profile')} className="hover:text-[#3E2723] transition-colors cursor-pointer text-left">Member Profile</button></li>
              <li><button onClick={() => navigate('/login')} className="hover:text-[#3E2723] transition-colors cursor-pointer text-left">Quick Sign In</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#3E2723] uppercase tracking-wider mb-4">Environment</h4>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                <span>Port 5173 (Vite + React)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                <span>Port 5000 (Express Node)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                <span>In-Memory MongoDB Active</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-[#E6DFD3] pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500">
          <p>© 2026 Get-To-Gather. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Made with ❤️ for local community builders.</p>
        </div>
      </footer>

      {/* Floating Help Button (Bottom-Right) */}
      <button
        onClick={() => {
          setModalTab('join');
          setIsHowItWorksOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 bg-primary hover:bg-[#92400E] text-white shadow-xl shadow-amber-900/10 px-5 py-3.5 rounded-full flex items-center gap-2 font-bold text-xs cursor-pointer active:scale-95 transition-all animate-fade-in hover:shadow-2xl"
      >
        <HelpCircle size={16} />
        <span>How it Works</span>
      </button>

      {/* How it Works Modal Popup */}
      {isHowItWorksOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-slide-up flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-[#E6DFD3] flex justify-between items-center bg-[#F4F0E8]/40 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-primary border border-amber-100">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#3E2723]">How Get-To-Gather Works</h3>
                  <p className="text-[10px] text-[#5D4037]/70">Everything you need to know to get started</p>
                </div>
              </div>
              <button
                onClick={() => setIsHowItWorksOpen(false)}
                className="w-8 h-8 bg-white border border-[#E6DFD3] hover:bg-[#FAF7F2] text-[#3E2723] rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-[#E6DFD3] bg-white shrink-0 text-xs select-none">
              <button
                onClick={() => setModalTab('join')}
                className={`flex-1 py-3.5 text-center font-bold transition-all border-b-2 cursor-pointer ${
                  modalTab === 'join'
                    ? 'border-primary text-primary font-black bg-[#FAF7F2]/40'
                    : 'border-transparent text-[#5D4037] hover:text-primary hover:bg-[#FAF7F2]/20'
                }`}
              >
                👥 Joining
              </button>
              <button
                onClick={() => setModalTab('host')}
                className={`flex-1 py-3.5 text-center font-bold transition-all border-b-2 cursor-pointer ${
                  modalTab === 'host'
                    ? 'border-primary text-primary font-black bg-[#FAF7F2]/40'
                    : 'border-transparent text-[#5D4037] hover:text-primary hover:bg-[#FAF7F2]/20'
                }`}
              >
                ✨ Organizing
              </button>
              <button
                onClick={() => setModalTab('credits')}
                className={`flex-1 py-3.5 text-center font-bold transition-all border-b-2 cursor-pointer ${
                  modalTab === 'credits'
                    ? 'border-primary text-primary font-black bg-[#FAF7F2]/40'
                    : 'border-transparent text-[#5D4037] hover:text-primary hover:bg-[#FAF7F2]/20'
                }`}
              >
                🪙 Credit Economy
              </button>
            </div>

            {/* Modal Body / Tab Content */}
            <div className="p-6 overflow-y-auto flex-1 text-xs text-[#5D4037] leading-relaxed space-y-4">
              {modalTab === 'join' && (
                <>
                  <div className="bg-white border border-[#E6DFD3] rounded-2xl p-4">
                    <h4 className="font-extrabold text-[#3E2723] text-xs mb-1.5 flex items-center gap-1.5">
                      <Compass size={14} className="text-primary" /> 1. Discover Active Gatherings
                    </h4>
                    <p>
                      Browse local coordinates on the interactive Map page or search by keyword and category directly on the landing page. Filter meetups happening near you within a custom range.
                    </p>
                  </div>

                  <div className="bg-white border border-[#E6DFD3] rounded-2xl p-4">
                    <h4 className="font-extrabold text-[#3E2723] text-xs mb-1.5 flex items-center gap-1.5">
                      <Users size={14} className="text-primary" /> 2. Request Entry (RSVP)
                    </h4>
                    <p>
                      Click on an event card to read the details, rules, and host info. Submit your join request. If the host approves you, you'll immediately unlock the location's precise coordinates and the WhatsApp coordination group link!
                    </p>
                  </div>

                  <div className="bg-white border border-[#E6DFD3] rounded-2xl p-4">
                    <h4 className="font-extrabold text-[#3E2723] text-xs mb-1.5 flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-primary" /> 3. Attend Offline & Earn Score
                    </h4>
                    <p>
                      Go to the offline location, meet the community, and let the host verify your presence via their dashboard. Check-ins boost your Reputation Score, which unlocks free Host Credits!
                    </p>
                  </div>
                </>
              )}

              {modalTab === 'host' && (
                <>
                  <div className="bg-white border border-[#E6DFD3] rounded-2xl p-4">
                    <h4 className="font-extrabold text-[#3E2723] text-xs mb-1.5 flex items-center gap-1.5">
                      <Plus size={14} className="text-primary" /> 1. Consume 1 Host Credit
                    </h4>
                    <p>
                      Hosting a meetup requires consuming exactly 1 Host Credit. This model ensures that listings remain authentic, preventing spam, coordinates abuse, or dead events.
                    </p>
                  </div>

                  <div className="bg-white border border-[#E6DFD3] rounded-2xl p-4">
                    <h4 className="font-extrabold text-[#3E2723] text-xs mb-1.5 flex items-center gap-1.5">
                      <Search size={14} className="text-primary" /> 2. Define Parameters & Pin Coordinates
                    </h4>
                    <p>
                      Fill in the host form: set the title, details, and participant limits. Use our map locator with predictive address suggestions to plot your gathering's coordinate pin.
                    </p>
                  </div>

                  <div className="bg-white border border-[#E6DFD3] rounded-2xl p-4">
                    <h4 className="font-extrabold text-[#3E2723] text-xs mb-1.5 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-primary" /> 3. Select Guests & Mark Attendance
                    </h4>
                    <p>
                      Manage entries inside your Organizer Console. You review applicants, approve guests, and mark attendance check-ins offline to trigger reputation points and keep coordinates secure.
                    </p>
                  </div>
                </>
              )}

              {modalTab === 'credits' && (
                <>
                  <div className="bg-white border border-[#E6DFD3] rounded-2xl p-4">
                    <h4 className="font-extrabold text-[#3E2723] text-xs mb-1.5 flex items-center gap-1.5">
                      🪙 Why a Credit System?
                    </h4>
                    <p>
                      Traditional platforms suffer from automated organizer bots spamming coordinate listings. By requiring a token credit to launch any meetup, we protect local nodes and align host incentives.
                    </p>
                  </div>

                  <div className="bg-white border border-[#E6DFD3] rounded-2xl p-4">
                    <h4 className="font-extrabold text-[#3E2723] text-xs mb-1.5 flex items-center gap-1.5">
                      📈 Earn Free Credits Through Presence
                    </h4>
                    <p>
                      You don't need to purchase credits! Attending offline gatherings boosts your Reputation Score. Reaching milestones automatically converts your points into **free Host Credits**, allowing active attendees to seamlessly become meetup hosts.
                    </p>
                  </div>

                  <div className="bg-[#EFECE3]/40 border border-[#E6DFD3] rounded-2xl p-4">
                    <h4 className="font-extrabold text-[#3E2723] text-xs mb-1.5 flex items-center gap-1.5">
                      🛡️ Verified Host Badges
                    </h4>
                    <p>
                      Submit your official government ID through the dashboard to earn a Verified badge, boosting check-in rates and community credibility.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E6DFD3] bg-[#F4F0E8]/40 shrink-0 text-center">
              <button
                onClick={() => setIsHowItWorksOpen(false)}
                className="bg-primary hover:bg-[#92400E] text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all cursor-pointer"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
