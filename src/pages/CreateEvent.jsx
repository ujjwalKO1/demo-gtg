import React, { useState, useEffect } from 'react';
import * as nsfwjs from 'nsfwjs';
import * as tf from '@tensorflow/tfjs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LeafletMap from '../components/LeafletMap';
import confetti from 'canvas-confetti';
import { 
  Plus, MapPin, Calendar, Users, Link as LinkIcon, 
  Sparkles, Eye, Edit3, ShieldCheck, HeartHandshake,
  Maximize2, Minimize2, Search, Camera, X, UploadCloud, Navigation
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_COVERS = {
  Sports: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
  Tech: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
  Social: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
  Food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  Music: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80',
  Art: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80',
  Study: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
  Gaming: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?auto=format&fit=crop&w=800&q=80',
  Other: 'https://images.unsplash.com/photo-1484807352052-23338990c6c6?auto=format&fit=crop&w=800&q=80'
};

const CreateEvent = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('edit');
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  // NSFW AI State
  const [nsfwModel, setNsfwModel] = useState(null);
  const [isCheckingImage, setIsCheckingImage] = useState(false);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    // Load the ML model when component mounts
    const loadModel = async () => {
      try {
        const model = await nsfwjs.load();
        setNsfwModel(model);
      } catch (err) {
        console.error('Error loading NSFW model:', err);
      }
    };
    loadModel();
  }, []);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Social');
  const [coverImage, setCoverImage] = useState(CATEGORY_COVERS.Social);
  const [isCustomImage, setIsCustomImage] = useState(false);
  const [dateTime, setDateTime] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(12.9716); // default Bangalore
  const [longitude, setLongitude] = useState(77.5946);
  const [participantLimit, setParticipantLimit] = useState(10);
  const [whatsappLink, setWhatsappLink] = useState('');
  const [requireApproval, setRequireApproval] = useState(true);

  // Map settings and search
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Autocomplete Suggestions Search Debounce
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=in`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'GTG-Getogather-Web-App'
          }
        });
        const data = await response.json();
        if (data) {
          setSuggestions(data);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Auto-locate host on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.log('User denied or GPS unavailable for Host page', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 25000,
          maximumAge: 30000
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!isCustomImage) {
      setCoverImage(CATEGORY_COVERS[category] || CATEGORY_COVERS.Other);
    }
  }, [category, isCustomImage]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setImageError('');
    setIsCheckingImage(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = async () => {
        // --- AI Moderation Check ---
        if (nsfwModel) {
          try {
            // Run inference
            const predictions = await nsfwModel.classify(img);
            console.log('NSFW Predictions:', predictions);
            
            // Check if any explicit category is > 60% probability
            const explicitCategories = ['Porn', 'Hentai', 'Sexy'];
            const isExplicit = predictions.some(p => 
              explicitCategories.includes(p.className) && p.probability > 0.60
            );

            if (isExplicit) {
              setImageError('AI Moderation: Image flagged for inappropriate content. Please select a different image.');
              setIsCheckingImage(false);
              return; // Stop processing and block upload
            }
          } catch (err) {
            console.error('Error checking image safety:', err);
          }
        }
        // --- End Moderation ---

        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 800;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to 60% quality JPEG
        const base64String = canvas.toDataURL('image/jpeg', 0.6);
        setCoverImage(base64String);
        setIsCustomImage(true);
        setIsCheckingImage(false);
      };
    };
  };

  const removeCustomImage = () => {
    setIsCustomImage(false);
    setCoverImage(CATEGORY_COVERS[category] || CATEGORY_COVERS.Other);
    // Reset file input if needed
    const fileInput = document.getElementById('event-cover-upload');
    if (fileInput) fileInput.value = '';
  };


  const handleSearchLocation = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'GTG-Getogather-Web-App'
        }
      });
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        setLatitude(newLat);
        setLongitude(newLng);
        const parts = display_name.split(',');
        const simplifiedAddress = parts.slice(0, 4).join(',').trim();
        setAddress(simplifiedAddress);
      } else {
        toast.error('Location not found. Try searching for a specific neighborhood, street, or landmark (e.g. "Indiranagar, Bangalore").');
      }
    } catch (err) {
      console.error('Error searching location:', err);
      toast.error('Search API request failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleLocationSelect = async (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
    setGeocoding(true);

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'GTG-Getogather-Web-App'
        }
      });
      const data = await response.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(',');
        const simplifiedAddress = parts.slice(0, 4).join(',').trim();
        setAddress(simplifiedAddress);
      }
    } catch (err) {
      console.error('Error reverse geocoding:', err);
    } finally {
      setGeocoding(false);
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error("GPS Error:", error);
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
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  const handlePurchaseCredit = async () => {
    try {
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Successfully added 1 Credit!');
        refreshUser();
      } else {
        toast.error('Failed to purchase credit');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error connecting to server');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user.hostCredits < 1) {
      toast.error('You have 0 host credits! Please purchase a credit or attend verified events first.');
      return;
    }

    const waRegex = /^(https?:\/\/)?(chat\.whatsapp\.com\/[a-zA-Z0-9]+)$/;
    if (!waRegex.test(whatsappLink)) {
      toast.error('Please enter a valid WhatsApp invite link (chat.whatsapp.com/...)');
      return;
    }

    setLoading(true);

    const payload = {
      title,
      description,
      category,
      coverImage,
      dateTime,
      location: {
        address,
        latitude,
        longitude
      },
      participantLimit: parseInt(participantLimit),
      whatsappLink,
      requireApproval
    };

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });

        toast.success('Congratulations! Your event is now published live.');
        refreshUser();
        navigate('/');
      } else {
        toast.error('Error creating event: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow bg-[#FAF7F2] py-8 overflow-y-auto">
      <div className="content-container">
        
        {/* Top Header Panel */}
        <div className="bg-white border border-[#E6DFD3] rounded-3xl p-5 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-[#3E2723] uppercase tracking-widest">Host a New Meetup</h1>
            <p className="text-xs text-[#5D4037]/80 mt-1">Publish an event to connect local community members.</p>
          </div>
          
          <div className="flex gap-1 bg-[#EFECE3] p-0.5 rounded-full text-xs shrink-0 select-none">
            <button
              onClick={() => setMode('edit')}
              className={`flex items-center gap-1 px-4 py-2 rounded-full font-bold transition-all cursor-pointer ${
                mode === 'edit' ? 'bg-white text-[#3E2723] shadow-xs' : 'text-[#5D4037] hover:text-[#3E2723]'
              }`}
            >
              <Edit3 size={14} /> Edit Form
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`flex items-center gap-1 px-4 py-2 rounded-full font-bold transition-all cursor-pointer ${
                mode === 'preview' ? 'bg-white text-[#3E2723] shadow-xs' : 'text-[#5D4037] hover:text-[#3E2723]'
              }`}
            >
              <Eye size={14} /> Live Preview
            </button>
          </div>
        </div>

        {/* Credit warning banner */}
        {user && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between shadow-3xs mb-6">
            <div className="flex items-center gap-3">
              <span className="text-amber-500 text-lg">⚡</span>
              <div>
                <p className="text-xs font-bold text-amber-900">Host Credit Cost Warning</p>
                <p className="text-[11px] text-amber-700">
                  Publishing consumes **1 credit**. Balance: **{user.hostCredits} credits**.
                </p>
              </div>
            </div>
            {user.hostCredits === 0 ? (
              <button
                type="button"
                onClick={handlePurchaseCredit}
                className="bg-amber-600 hover:bg-amber-750 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-xs shrink-0"
              >
                Buy 1 Credit (₹99)
              </button>
            ) : (
              <span className="text-[10px] font-black text-amber-800 bg-amber-100/60 border border-amber-250 px-2.5 py-1 rounded-md uppercase">
                Ready to Publish
              </span>
            )}
          </div>
        )}

        {mode === 'edit' ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* LEFT COLUMN: Main Form Parameters */}
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
              <h3 className="font-black text-xs text-gray-950 uppercase tracking-widest border-b border-gray-100 pb-2 mb-2">
                1. Meetup Details
              </h3>

              {/* Image Upload Area */}
              <div className="mb-2">
                <label className="block text-xs font-bold text-gray-600 mb-2">Event Cover Photo (Optional)</label>
                <div className="relative w-full h-32 bg-gray-50 border-2 border-dashed border-gray-250 rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors">
                  {isCustomImage ? (
                    <>
                      <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={removeCustomImage}
                        className="absolute top-2 right-2 bg-white/90 text-gray-800 p-1.5 rounded-xl shadow-md hover:bg-rose-50 hover:text-rose-600 transition-colors backdrop-blur-sm"
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                    </>
                  ) : (
                      <label htmlFor="event-cover-upload" className={`w-full h-full flex flex-col items-center justify-center transition-opacity ${isCheckingImage ? 'opacity-100 cursor-not-allowed' : 'opacity-70 group-hover:opacity-100 cursor-pointer'}`}>
                        {isCheckingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                            <span className="text-[10px] font-bold text-gray-800">AI scanning image...</span>
                          </>
                        ) : (
                          <>
                            <div className="bg-white p-2 rounded-xl shadow-3xs mb-2 text-gray-400 group-hover:text-primary transition-colors">
                              <Camera size={18} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500">Upload your own photo</span>
                            <span className="text-[9px] text-gray-400 mt-0.5">JPG, PNG (Max scaled to 800px)</span>
                          </>
                        )}
                        <input 
                          id="event-cover-upload"
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageUpload}
                          disabled={isCheckingImage}
                        />
                      </label>
                    )}
                  </div>
                  {imageError && (
                    <div className="mt-2 bg-rose-50 border-2 border-rose-600 rounded-lg p-2.5 flex gap-2 items-center shadow-[2px_2px_0_0_#e11d48]">
                      <span className="text-rose-600">🚨</span>
                      <span className="text-xs font-bold text-rose-800">{imageError}</span>
                    </div>
                  )}
                  {!isCustomImage && !imageError && (
                    <p className="text-[9px] text-gray-400 mt-1.5 flex justify-between">
                      <span>If no photo is uploaded, we will use a premium default based on the category.</span>
                      <span className="text-primary font-bold cursor-pointer hover:underline" onClick={() => setMode('preview')}>Preview Default</span>
                    </p>
                  )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Meetup Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 7v7 Football Match, Board Game Night..."
                  className="w-full bg-gray-50 border border-gray-250 rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the meetup details, agenda, rules, parking guides..."
                  className="w-full bg-gray-50 border border-gray-250 rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-bold text-gray-700 cursor-pointer"
                  >
                    {Object.keys(CATEGORY_COVERS).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-250 rounded-xl px-3 py-2.5 text-xs focus:outline-none font-bold text-gray-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Spots Limit</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Users size={14} />
                    </span>
                    <input
                      type="number"
                      min="2"
                      max="1000"
                      value={participantLimit}
                      onChange={(e) => setParticipantLimit(parseInt(e.target.value) || '')}
                      className="w-full bg-gray-50 border border-gray-250 rounded-xl pl-9 pr-4 py-3 text-xs font-bold text-gray-800"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Registration Mode</label>
                  <div className="flex gap-1.5 mt-0.5">
                    <button
                      type="button"
                      onClick={() => setRequireApproval(true)}
                      className={`flex-1 text-[10px] font-black py-2 rounded-xl transition-all border cursor-pointer ${
                        requireApproval
                          ? 'bg-purple-50 text-primary border-purple-200 shadow-3xs'
                          : 'bg-gray-55 text-gray-500 border-gray-200'
                      }`}
                    >
                      Requires Host Approval
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequireApproval(false)}
                      className={`flex-1 text-[10px] font-black py-2 rounded-xl transition-all border cursor-pointer ${
                        !requireApproval
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-250 shadow-3xs'
                          : 'bg-gray-55 text-gray-500 border-gray-200'
                      }`}
                    >
                      Instant Auto-Join
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">WhatsApp Group Invite Link</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <LinkIcon size={14} />
                  </span>
                  <input
                    type="text"
                    value={whatsappLink}
                    onChange={(e) => setWhatsappLink(e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                    className="w-full bg-gray-50 border border-gray-250 rounded-xl pl-9 pr-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono text-gray-800"
                    required
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Geolocation Map Selection Widget */}
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col gap-4 lg:sticky lg:top-24">
              <h3 className="font-black text-xs text-gray-950 uppercase tracking-widest border-b border-gray-100 pb-2 mb-1">
                2. Select Meeting Coordinates
              </h3>

              {/* Search Location Bar */}
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchLocation();
                      }
                    }}
                    placeholder="Search specific area (e.g. Indiranagar, Bangalore)"
                    className="w-full bg-gray-50 border border-gray-250 rounded-xl pl-9 pr-3 py-3 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
                  />

                  {/* Dynamic Suggestions List */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-[2000] overflow-hidden max-h-60 overflow-y-auto animate-fade-in">
                      {suggestions.map((sug) => {
                        const parts = sug.display_name.split(',');
                        const title = parts[0];
                        const subtitle = parts.slice(1, 4).join(',').trim();
                        
                        return (
                          <div
                            key={sug.place_id}
                            onClick={() => {
                              const lat = parseFloat(sug.lat);
                              const lng = parseFloat(sug.lon);
                              setLatitude(lat);
                              setLongitude(lng);
                              const simplifiedAddress = parts.slice(0, 4).join(',').trim();
                              setAddress(simplifiedAddress);
                              setSearchQuery(simplifiedAddress);
                              setSuggestions([]);
                              setShowSuggestions(false);
                            }}
                            className="px-4 py-3 hover:bg-purple-50/50 cursor-pointer border-b border-gray-100 last:border-0 flex flex-col transition-colors text-left"
                          >
                            <span className="text-xs font-extrabold text-gray-850">{title}</span>
                            <span className="text-[10px] text-gray-400 truncate mt-0.5">{subtitle}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSearchLocation}
                  disabled={searching}
                  className="bg-gray-950 hover:bg-black text-white text-xs font-extrabold px-4 py-3 rounded-xl transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Toggleable height map wrapper */}
              <div className={`${isMapExpanded ? 'h-[500px]' : 'h-72'} rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shadow-3xs relative shrink-0 transition-all duration-300`}>
                <LeafletMap
                  interactive={true}
                  onLocationSelect={handleLocationSelect}
                  selectedLocation={{ lat: latitude, lng: longitude }}
                  resizeTrigger={isMapExpanded}
                />

                {/* Locate Me Button Overlay */}
                <button
                  type="button"
                  onClick={handleLocateMe}
                  className="absolute top-3 left-3 z-[1000] bg-white hover:bg-gray-50 text-gray-800 p-2.5 rounded-xl border border-gray-200 shadow-md font-extrabold text-[10px] flex items-center gap-1.5 transition-all select-none active:scale-95 cursor-pointer"
                  title="Locate Me"
                >
                  <Navigation size={12} strokeWidth={2.5} className="text-primary" />
                  <span className="hidden sm:inline">Locate Me</span>
                </button>

                {/* Expand / Minimize Button Overlay */}
                <button
                  type="button"
                  onClick={() => setIsMapExpanded(!isMapExpanded)}
                  className="absolute top-3 right-3 z-[1000] bg-white hover:bg-gray-50 text-gray-800 p-2.5 rounded-xl border border-gray-200 shadow-md font-extrabold text-[10px] flex items-center gap-1.5 transition-all select-none active:scale-95 cursor-pointer"
                >
                  {isMapExpanded ? (
                    <>
                      <Minimize2 size={12} strokeWidth={2.5} />
                      <span>Minimize Map</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 size={12} strokeWidth={2.5} />
                      <span>Expand Map</span>
                    </>
                  )}
                </button>
              </div>

              {/* Resolved Address Input */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Meeting Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <MapPin size={16} />
                  </span>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={geocoding ? 'Reverse geocoding coordinates on OpenStreetMap...' : 'Click map to drop coordinates pin'}
                    className="w-full bg-gray-50 border border-gray-250 rounded-xl pl-10 pr-4 py-3 text-xs font-semibold text-gray-800"
                    required
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  You can edit the resolved text address if you need to add building names, room numbers, etc.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !user || user.hostCredits < 1}
                className="w-full bg-primary hover:bg-primary-dark text-white font-extrabold py-4 rounded-2xl text-xs transition-colors shadow-md shadow-purple-100 mt-4 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Plus size={16} strokeWidth={2.5} />
                {loading ? 'Publishing meetup...' : 'Publish Meetup Live'}
              </button>
            </div>

          </form>
        ) : (
          /* Live preview view */
          <div className="bg-white border border-gray-150 rounded-3xl p-8 max-w-xl mx-auto shadow-md animate-fade-in flex flex-col gap-5">
            <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
              <div className="h-56 w-full relative">
                <img
                  src={coverImage}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-primary text-white border border-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {category}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-extrabold text-gray-900 text-lg leading-tight">{title || 'Untitled Getogather'}</h3>
                
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
                  <span>by {user?.name}</span>
                  {user?.isVerified && (
                    <ShieldCheck size={14} className="text-primary fill-purple-50" />
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600 mt-5">
                  <Calendar size={14} className="text-gray-400" />
                  <span>{dateTime ? new Date(dateTime).toLocaleString('en-IN') : 'No schedule set'}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600 mt-2.5">
                  <MapPin size={14} className="text-gray-400" />
                  <span className="line-clamp-1">{address || 'No location resolved'}</span>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400 font-medium">
                  <span>Spots Limit: {participantLimit}</span>
                  <span className="text-primary font-bold">{requireApproval ? 'Host approves RSVPs' : 'Auto join enabled'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CreateEvent;
