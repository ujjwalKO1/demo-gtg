import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import {
  Search, MapPin, Sparkles, Navigation, Calendar, Plus, Compass,
  ShieldCheck, HelpCircle, Users, CheckCircle, ArrowRight, Quote, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';

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

// Temporary mock data so the redesigned UI renders beautifully even when the
// backend isn't running. Real API data (fetchEvents below) always takes
// priority — this is only a fallback for empty/failed responses.
const MOCK_EVENTS = [
  {
    _id: 'mock-1',
    title: 'Sunrise 5-a-side Football',
    category: 'Sports',
    coverImage: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80',
    dateTime: new Date(Date.now() + 86400000).toISOString(),
    organizer: { name: 'Aarav K.', isVerified: true },
    location: { address: 'Cubbon Park Turf, Bengaluru' },
    distance: 2.4,
    participantLimit: 10,
    spotsLeft: 2
  },
  {
    _id: 'mock-2',
    title: 'Indie Hackers Build Night',
    category: 'Tech',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    dateTime: new Date(Date.now() + 2 * 86400000).toISOString(),
    organizer: { name: 'Meera S.', isVerified: true },
    location: { address: 'Koramangala Co-work Loft' },
    distance: 1.1,
    participantLimit: 25,
    spotsLeft: 9
  },
  {
    _id: 'mock-3',
    title: 'Vinyl & Vinyl: Jazz Listening Circle',
    category: 'Music',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80',
    dateTime: new Date(Date.now() + 3 * 86400000).toISOString(),
    organizer: { name: 'Rohan D.', isVerified: false },
    location: { address: 'Indiranagar Rooftop' },
    distance: 3.8,
    participantLimit: 15,
    spotsLeft: 0
  },
  {
    _id: 'mock-4',
    title: 'Street Food Crawl: Old Bengaluru',
    category: 'Food',
    coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    dateTime: new Date(Date.now() + 4 * 86400000).toISOString(),
    organizer: { name: 'Priya N.', isVerified: true },
    location: { address: 'VV Puram Food Street' },
    distance: 5.2,
    participantLimit: 12,
    spotsLeft: 4
  }
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
      if (data.success && Array.isArray(data.events)) {
        setEvents(data.events);
      } else {
        setEvents(MOCK_EVENTS);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setEvents(MOCK_EVENTS);
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
      toast.error('Geolocation is not supported by your browser.');
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
        toast.error('Could not retrieve your location. Please check your permissions.');
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
    <div className="flex-grow bg-white text-[#1D1D1F] pb-0 overflow-y-auto relative min-h-screen">
      {/* Full-Screen Hero — pure white canvas, huge negative space, aurora signature */}
      <section className="min-h-[calc(100vh-70px)] bg-white flex flex-col justify-center items-center px-6 relative text-center overflow-hidden">
        {/* Signature aurora glow — restrained, sits behind the headline only */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[560px] h-[560px] aurora-glow pointer-events-none select-none animate-float"></div>

        <div className="max-w-4xl mx-auto flex flex-col justify-center items-center gap-8 z-10 py-24">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-semibold tracking-[-0.04em] leading-[0.98] text-[#1D1D1F] max-w-5xl opacity-0 animate-hero-title [animation-fill-mode:forwards]">
            Discover Real-World <br/>
            <span className="aurora-text block mt-4 text-4xl sm:text-5xl md:text-7xl whitespace-nowrap opacity-0 animate-hero-text-glow [animation-fill-mode:forwards]">
              Turn plans into memories.
            </span>
          </h1>
          <p className="text-base md:text-xl text-[#6E6E73] leading-relaxed max-w-2xl mt-2 font-normal opacity-0 animate-slide-up [animation-delay:500ms] [animation-fill-mode:forwards]">
            Your one-stop destination for offline socializing. We support local communities to connect, share passions, and host gatherings seamlessly.
          </p>

          {/* Embedded Search Input directly on the Hero Opening Page */}
          <div className="w-full max-w-lg mt-4 z-10 relative opacity-0 animate-slide-up [animation-delay:650ms] [animation-fill-mode:forwards]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-[#AEAEB2]">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chess, code jams, football, music..."
              className="w-full glass-panel rounded-full pl-12 pr-5 py-4.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition-all font-normal text-[#1D1D1F] placeholder-[#AEAEB2] shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6 justify-center opacity-0 animate-slide-up [animation-delay:800ms] [animation-fill-mode:forwards]">
            <button
              onClick={() => navigate('/create')}
              className="bg-[#1D1D1F] hover:bg-black text-white font-medium text-sm px-8 py-4 rounded-full transition-all shadow-[0_10px_30px_-8px_rgba(0,0,0,0.4)] flex items-center gap-2 cursor-pointer active:scale-97"
            >
              <Plus size={17} strokeWidth={2.5} /> Host Gathering
            </button>
            <button
              onClick={() => navigate('/map')}
              className="bg-black/[0.03] hover:bg-black/[0.06] text-[#1D1D1F] border border-black/[0.06] font-medium text-sm px-8 py-4 rounded-full transition-all flex items-center gap-2 cursor-pointer active:scale-97"
            >
              <Compass size={17} /> Join Gatherings
            </button>
          </div>

          {/* Social Proof Avatars */}
          <div className="flex flex-col items-center gap-3 mt-4 opacity-0 animate-slide-up [animation-delay:950ms] [animation-fill-mode:forwards]">
            <div className="flex -space-x-3">
              <img className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="User 1" />
              <img className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" alt="User 2" />
              <img className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="User 3" />
              <img className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="User 4" />
              <div className="w-10 h-10 rounded-full border-2 border-white bg-[#EAE5D9] text-[#78350F] flex items-center justify-center text-xs font-bold shadow-sm z-10">
                +500
              </div>
            </div>
            <p className="text-xs font-medium text-[#86868B]">
              Join 500+ people meeting up this week.
            </p>
          </div>
        </div>

        {/* Floating Downward Arrow Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 select-none z-10 opacity-0 animate-fade-in [animation-delay:1000ms] [animation-fill-mode:forwards]">
          <span className="text-[10px] font-medium text-[#AEAEB2] uppercase tracking-[0.2em]">Scroll Down</span>
          <button
            onClick={() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-10 h-10 glass-panel rounded-full flex items-center justify-center text-[#1D1D1F] shadow-sm hover:shadow-md transition-all cursor-pointer animate-float"
          >
            <ArrowRight size={18} className="rotate-90" />
          </button>
        </div>
      </section>

      {/* Main Discover Layout (Events, Search & Filters) */}
      <div id="discover" className="content-container py-28 scroll-mt-12">
        {/* Prominent Search Bar (Above the Box) */}
        <div className="mb-12 max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Search Neighborhood Events</h2>
          <p className="text-sm text-[#86868B] mt-2 mb-6">Find active sports, games, jams, and circles in your neighborhood</p>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-[#AEAEB2]">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chess, code jams, football, music..."
              className="w-full bg-[#F5F5F7] border border-transparent rounded-full pl-12 pr-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white transition-all font-normal text-[#1D1D1F] placeholder-[#AEAEB2]"
            />
          </div>
        </div>

        {/* The Controls Box */}
        <div className="bg-[#F5F5F7] rounded-xl border-2 border-[#121212] shadow-[4px_4px_0_0_rgba(18,18,18,1)] p-6 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-2xl mx-auto">
          {/* Geolocation Button */}
          <button
            onClick={handleNearMeToggle}
            className={`px-5 py-3 rounded-full font-medium text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
              nearMeActive
                ? 'bg-[#1D1D1F] text-white shadow-md'
                : 'bg-white text-[#48484A] border border-black/[0.06] hover:bg-black/[0.02]'
            }`}
          >
            <Navigation size={14} className={nearMeActive ? 'fill-white' : ''} />
            <span>Search Near Me</span>
          </button>

          {/* Location Range Slider */}
          {nearMeActive && userCoords && (
            <div className="bg-white px-4 py-3 rounded-2xl flex flex-col gap-1 flex-grow">
              <div className="flex justify-between items-center text-[10px] font-semibold text-[#1D1D1F] uppercase tracking-wider">
                <span>Search Range:</span>
                <span>{radius} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-1 bg-black/10 rounded-lg appearance-none cursor-pointer accent-black"
              />
            </div>
          )}
        </div>

        {/* Categories Chip Panel */}
        <div className="mb-12">
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none select-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer ${
                  activeCategory === cat.name
                    ? 'bg-[#1D1D1F] text-white shadow-md'
                    : 'bg-white text-[#48484A] border border-black/[0.06] hover:bg-black/[0.02]'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Render Lists */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState message={`No gatherings found for "${activeCategory}" matching your keywords.`} />
        ) : (
          <div className="flex flex-col gap-14">
            {/* Trending sliders */}
            {!search && activeCategory === 'All' && trendingEvents.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-[#1D1D1F] uppercase tracking-[0.15em] flex items-center gap-1.5 mb-6">
                  <Sparkles size={14} className="text-[#1D1D1F]" /> Trending Meetups
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
              <h3 className="text-xs font-semibold text-[#1D1D1F] uppercase tracking-[0.15em] flex items-center gap-1.5 mb-6">
                <Calendar size={14} className="text-[#1D1D1F]" />
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
      <section className="bg-[#F5F5F7] py-28 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-semibold text-[#1D1D1F] tracking-tight">How Get-To-Gather Works</h2>
            <p className="text-sm text-[#6E6E73] leading-relaxed mt-4">
              We align guest incentives with host privileges, cultivating active, trust-centered local chapters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-7 rounded-xl border-2 border-[#121212] shadow-[4px_4px_0_0_rgba(18,18,18,1)] relative text-center hover:-translate-y-1 transition-transform duration-500 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="w-11 h-11 bg-[#F5F5F7] text-[#1D1D1F] rounded-full flex items-center justify-center font-semibold text-sm mx-auto mb-5">
                1
              </div>
              <h3 className="font-semibold text-sm text-[#1D1D1F]">Browse Map</h3>
              <p className="text-xs text-[#86868B] leading-relaxed mt-2.5">
                Open the interactive coordinates map to locate active sports, gaming, and tech gatherings near you.
              </p>
            </div>

            <div className="bg-white p-7 rounded-xl border-2 border-[#121212] shadow-[4px_4px_0_0_rgba(18,18,18,1)] relative text-center hover:-translate-y-1 transition-transform duration-500 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="w-11 h-11 bg-[#F5F5F7] text-[#1D1D1F] rounded-full flex items-center justify-center font-semibold text-sm mx-auto mb-5">
                2
              </div>
              <h3 className="font-semibold text-sm text-[#1D1D1F]">Request Entry</h3>
              <p className="text-xs text-[#86868B] leading-relaxed mt-2.5">
                Submit an RSVP. Hosts evaluate check-in records and verified profiles to select community members.
              </p>
            </div>

            <div className="bg-white p-7 rounded-xl border-2 border-[#121212] shadow-[4px_4px_0_0_rgba(18,18,18,1)] relative text-center hover:-translate-y-1 transition-transform duration-500 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="w-11 h-11 bg-[#F5F5F7] text-[#1D1D1F] rounded-full flex items-center justify-center font-semibold text-sm mx-auto mb-5">
                3
              </div>
              <h3 className="font-semibold text-sm text-[#1D1D1F]">Attend Offline</h3>
              <p className="text-xs text-[#86868B] leading-relaxed mt-2.5">
                Go to the resolved coordinates. Meet neighbors and check in to boost your local reputation score.
              </p>
            </div>

            <div className="bg-white p-7 rounded-xl border-2 border-[#121212] shadow-[4px_4px_0_0_rgba(18,18,18,1)] relative text-center hover:-translate-y-1 transition-transform duration-500 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="w-11 h-11 bg-[#F5F5F7] text-[#1D1D1F] rounded-full flex items-center justify-center font-semibold text-sm mx-auto mb-5">
                4
              </div>
              <h3 className="font-semibold text-sm text-[#1D1D1F]">Earn Free Tokens</h3>
              <p className="text-xs text-[#86868B] leading-relaxed mt-2.5">
                Redeem your score milestones for free Host Credits, transforming from attendee into meetup creator.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Economy Highlights */}
      <section className="py-28 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-semibold text-[#1D1D1F] tracking-tight leading-tight">
              Creating Safe, Accountable, <br />
              <span className="aurora-text">Spam-Free Local Nodes</span>
            </h2>
            <p className="text-sm text-[#6E6E73] mt-5 leading-relaxed">
              Meeting strangers in offline spaces carries safety and accountability hurdles.
              Our platform mechanics solve this using automated verification, anti-spam tokens,
              and community reputations.
            </p>

            <div className="mt-10 space-y-6">
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center shrink-0">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#1D1D1F]">Verify Identity with Government ID</h4>
                  <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
                    Hosts link their official identification through secure portals, earning a visible Verified Host badge.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center shrink-0">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#1D1D1F]">Token Cost Restricts Coordinator Spam</h4>
                  <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
                    Every gathering requires consuming exactly 1 Host Credit, ensuring coordinate slots remain clean and authentic.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center shrink-0">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#1D1D1F]">Reputation Boosts for Present Attendees</h4>
                  <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
                    Hosts verify presence offline via digital check-in sheets. Successful attendance builds community reputation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quote card — glass panel */}
          <div className="glass-panel rounded-xl border-2 border-[#121212] shadow-[4px_4px_0_0_rgba(18,18,18,1)] p-10 flex flex-col justify-center relative overflow-hidden shadow-[0_20px_60px_-20px_rgba(0,0,0,0.12)]">
            <div className="absolute top-4 right-4 text-black/[0.04] pointer-events-none">
              <Quote size={80} strokeWidth={4} />
            </div>

            <h3 className="font-semibold text-[#1D1D1F] text-lg mb-5 flex items-center gap-2 z-10">
              <Sparkles size={16} /> Why We Built Get-To-Gather
            </h3>
            <blockquote className="border-l-2 border-black/10 pl-5 text-sm text-[#48484A] italic leading-relaxed z-10">
              "We live in the most digitally connected era in human history, yet study after study shows record-high loneliness rates.
              Online networks feed endless feeds but fail to facilitate actual, face-to-face meetups. Get-To-Gather is here to change that
              by matching people by passion, allowing them to do what they actually like, rather than just what they can."
            </blockquote>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#F5F5F7] py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[#1D1D1F] text-xs font-medium uppercase tracking-wider bg-white px-3 py-1.5 rounded-full">
              FAQs
            </span>
            <h2 className="text-4xl font-semibold text-[#1D1D1F] tracking-tight mt-4">Frequently Asked Questions</h2>
            <p className="text-xs text-[#86868B] mt-2">Got questions? We've got answers.</p>
          </div>

          <div className="space-y-3">
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
                className="bg-white rounded-[22px] overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-7 py-5 font-medium text-sm text-[#1D1D1F] flex justify-between items-center focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <HelpCircle size={16} className={`text-[#AEAEB2] transition-transform ${openFaq === index ? 'rotate-180 text-[#1D1D1F]' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-7 pb-6 pt-1 text-xs text-[#6E6E73] leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Floating Help Button (Bottom-Right) */}
      <button
        onClick={() => {
          setModalTab('join');
          setIsHowItWorksOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 bg-[#1D1D1F] hover:bg-black text-white shadow-[0_10px_30px_-6px_rgba(0,0,0,0.4)] px-5 py-3.5 rounded-full flex items-center gap-2 font-medium text-xs cursor-pointer active:scale-95 transition-all animate-fade-in"
      >
        <HelpCircle size={16} />
        <span>How it Works</span>
      </button>

      {/* How it Works Modal Popup */}
      {isHowItWorksOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-panel rounded-[32px] max-w-lg w-full overflow-hidden shadow-2xl relative animate-slide-up flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-7 pb-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#F5F5F7] rounded-full flex items-center justify-center text-[#1D1D1F]">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-[#1D1D1F]">How Get-To-Gather Works</h3>
                  <p className="text-[10px] text-[#86868B]">Everything you need to know to get started</p>
                </div>
              </div>
              <button
                onClick={() => setIsHowItWorksOpen(false)}
                className="w-8 h-8 bg-black/[0.04] hover:bg-black/[0.08] text-[#1D1D1F] rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-black/[0.06] bg-white/40 shrink-0 text-xs select-none">
              <button
                onClick={() => setModalTab('join')}
                className={`flex-1 py-3.5 text-center font-medium transition-all border-b-2 cursor-pointer ${
                  modalTab === 'join'
                    ? 'border-[#1D1D1F] text-[#1D1D1F] font-semibold'
                    : 'border-transparent text-[#86868B] hover:text-[#1D1D1F]'
                }`}
              >
                👥 Joining
              </button>
              <button
                onClick={() => setModalTab('host')}
                className={`flex-1 py-3.5 text-center font-medium transition-all border-b-2 cursor-pointer ${
                  modalTab === 'host'
                    ? 'border-[#1D1D1F] text-[#1D1D1F] font-semibold'
                    : 'border-transparent text-[#86868B] hover:text-[#1D1D1F]'
                }`}
              >
                ✨ Organizing
              </button>
              <button
                onClick={() => setModalTab('credits')}
                className={`flex-1 py-3.5 text-center font-medium transition-all border-b-2 cursor-pointer ${
                  modalTab === 'credits'
                    ? 'border-[#1D1D1F] text-[#1D1D1F] font-semibold'
                    : 'border-transparent text-[#86868B] hover:text-[#1D1D1F]'
                }`}
              >
                🪙 Credit Economy
              </button>
            </div>

            {/* Modal Body / Tab Content */}
            <div className="p-7 overflow-y-auto flex-1 text-xs text-[#48484A] leading-relaxed space-y-4">
              {modalTab === 'join' && (
                <>
                  <div className="bg-white rounded-2xl p-5">
                    <h4 className="font-semibold text-[#1D1D1F] text-xs mb-2 flex items-center gap-1.5">
                      <Compass size={14} /> 1. Discover Active Gatherings
                    </h4>
                    <p>
                      Browse local coordinates on the interactive Map page or search by keyword and category directly on the landing page. Filter meetups happening near you within a custom range.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-5">
                    <h4 className="font-semibold text-[#1D1D1F] text-xs mb-2 flex items-center gap-1.5">
                      <Users size={14} /> 2. Request Entry (RSVP)
                    </h4>
                    <p>
                      Click on an event card to read the details, rules, and host info. Submit your join request. If the host approves you, you'll immediately unlock the location's precise coordinates and the WhatsApp coordination group link!
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-5">
                    <h4 className="font-semibold text-[#1D1D1F] text-xs mb-2 flex items-center gap-1.5">
                      <CheckCircle size={14} /> 3. Attend Offline & Earn Score
                    </h4>
                    <p>
                      Go to the offline location, meet the community, and let the host verify your presence via their dashboard. Check-ins boost your Reputation Score, which unlocks free Host Credits!
                    </p>
                  </div>
                </>
              )}

              {modalTab === 'host' && (
                <>
                  <div className="bg-white rounded-2xl p-5">
                    <h4 className="font-semibold text-[#1D1D1F] text-xs mb-2 flex items-center gap-1.5">
                      <Plus size={14} /> 1. Consume 1 Host Credit
                    </h4>
                    <p>
                      Hosting a meetup requires consuming exactly 1 Host Credit. This model ensures that listings remain authentic, preventing spam, coordinates abuse, or dead events.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-5">
                    <h4 className="font-semibold text-[#1D1D1F] text-xs mb-2 flex items-center gap-1.5">
                      <Search size={14} /> 2. Define Parameters & Pin Coordinates
                    </h4>
                    <p>
                      Fill in the host form: set the title, details, and participant limits. Use our map locator with predictive address suggestions to plot your gathering's coordinate pin.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-5">
                    <h4 className="font-semibold text-[#1D1D1F] text-xs mb-2 flex items-center gap-1.5">
                      <ShieldCheck size={14} /> 3. Select Guests & Mark Attendance
                    </h4>
                    <p>
                      Manage entries inside your Organizer Console. You review applicants, approve guests, and mark attendance check-ins offline to trigger reputation points and keep coordinates secure.
                    </p>
                  </div>
                </>
              )}

              {modalTab === 'credits' && (
                <>
                  <div className="bg-white rounded-2xl p-5">
                    <h4 className="font-semibold text-[#1D1D1F] text-xs mb-2 flex items-center gap-1.5">
                      🪙 Why a Credit System?
                    </h4>
                    <p>
                      Traditional platforms suffer from automated organizer bots spamming coordinate listings. By requiring a token credit to launch any meetup, we protect local nodes and align host incentives.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-5">
                    <h4 className="font-semibold text-[#1D1D1F] text-xs mb-2 flex items-center gap-1.5">
                      📈 Earn Free Credits Through Presence
                    </h4>
                    <p>
                      You don't need to purchase credits! Attending offline gatherings boosts your Reputation Score. Reaching milestones automatically converts your points into free Host Credits, allowing active attendees to seamlessly become meetup hosts.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-5">
                    <h4 className="font-semibold text-[#1D1D1F] text-xs mb-2 flex items-center gap-1.5">
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
            <div className="p-5 border-t border-black/[0.06] shrink-0 text-center">
              <button
                onClick={() => setIsHowItWorksOpen(false)}
                className="bg-[#1D1D1F] hover:bg-black text-white font-medium text-xs py-2.5 px-6 rounded-full transition-all cursor-pointer"
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
