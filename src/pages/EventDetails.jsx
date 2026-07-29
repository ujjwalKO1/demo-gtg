import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LeafletMap from '../components/LeafletMap';
import { 
  ArrowLeft, Calendar, MapPin, Users, ShieldCheck, 
  Share2, MessageSquare, Star, Sparkles, Check, CheckCircle2 
} from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [requestStatus, setRequestStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Reviews state
  const [organizerReviews, setOrganizerReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`/api/events/${id}`, { 
        credentials: 'include' 
      });
      const data = await response.json();
      
      if (data.success) {
        setEvent(data.event);
        setAttendees(data.attendees);
        setRequestStatus(data.userRequestStatus);

        const reviewRes = await fetch(`/api/reviews/organizer/${data.event.organizer._id}`);
        const reviewData = await reviewRes.json();
        if (reviewData.success) {
          setOrganizerReviews(reviewData.reviews);
          setAvgRating(reviewData.averageRating);
        }
      } else {
        alert('Event not found');
        navigate('/');
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id, isAuthenticated]);

  const handleJoinRequest = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ eventId: event._id })
      });
      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchEventDetails();
      } else {
        alert(data.message || 'Failed to submit request.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    
    setSubmittingReview(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ eventId: event._id, rating, comment })
      });
      const data = await response.json();

      if (data.success) {
        setReviewSubmitted(true);
        setComment('');
        fetchEventDetails();
      } else {
        alert(data.message || 'Could not submit review.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center bg-slate-50 p-8">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-gray-400">Loading meetup details...</p>
      </div>
    );
  }

  if (!event) return null;

  const isOrganizer = isAuthenticated && user && event.organizer._id === user._id;
  const isApproved = requestStatus === 'approved';
  const isPending = requestStatus === 'pending';
  const isRejected = requestStatus === 'rejected';
  const userHasReviewed = organizerReviews.some(r => r.reviewer?._id === user?._id && r.event === event._id);

  return (
    <div className="flex-grow bg-slate-50 py-8 overflow-y-auto">
      <div className="content-container">
        
        {/* Back navigation button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-all cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Events
        </button>

        {/* Hero title grid layout */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <span className="bg-purple-50 text-primary border border-purple-100 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              {event.category}
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 mt-3 leading-snug">{event.title}</h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer relative"
            >
              {shareCopied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              <span>Share Event</span>
              {shareCopied && (
                <span className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2.5 py-1 rounded-md whitespace-nowrap animate-fade-in">
                  Link copied!
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT SIDE: Widescreen Cover, Description, Attendees, Reviews (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Widescreen event image */}
            <div className="h-80 md:h-[400px] w-full bg-gray-100 rounded-3xl overflow-hidden shadow-xs relative shrink-0">
              <img
                src={event.coverImage}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Organizer profile block card */}
            <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={event.organizer.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={event.organizer.name}
                  className="w-12 h-12 rounded-2xl object-cover shrink-0 bg-gray-100 border border-gray-100"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="font-extrabold text-gray-950 text-sm">{event.organizer.name}</h3>
                    {event.organizer.isVerified && (
                      <ShieldCheck size={16} className="text-primary fill-purple-100" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{event.organizer.bio || 'Verified organizer on GTG'}</p>
                </div>
              </div>

              {/* Organizer Ratings metrics */}
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-xs text-amber-500 font-extrabold justify-end">
                  <Star size={14} className="fill-amber-500 text-amber-500" />
                  <span>{avgRating > 0 ? avgRating : '5.0'}</span>
                  <span className="text-[10px] text-gray-400 font-normal">({organizerReviews.length} reviews)</span>
                </div>
                <span className="text-[9px] font-black text-gray-400 uppercase font-mono block mt-0.5 tracking-wider">
                  Reputation: {event.organizer.communityScore}
                </span>
              </div>
            </div>

            {/* Long Event Description */}
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col gap-3">
              <h3 className="font-black text-xs text-gray-950 uppercase tracking-widest">About this meetup</h3>
              <p className="text-xs text-gray-650 leading-relaxed whitespace-pre-line font-sans">{event.description}</p>
            </div>

            {/* Approved Attendees */}
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
              <h3 className="font-black text-xs text-gray-950 uppercase tracking-widest">
                Approved Guests ({attendees.length} / {event.participantLimit})
              </h3>
              {attendees.length === 0 ? (
                <p className="text-xs text-gray-400">No guests have joined this event yet.</p>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {attendees.map((attendee) => (
                    <div key={attendee._id} className="flex items-center gap-2 bg-gray-50 border border-gray-150 rounded-2xl p-2 shrink-0">
                      <div className="relative">
                        <img
                          src={attendee.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                          alt={attendee.name}
                          className="w-8 h-8 rounded-xl object-cover"
                        />
                        {attendee.isVerified && (
                          <div className="absolute bottom-0 right-0 bg-white rounded-full p-[0.5px]">
                            <ShieldCheck size={10} className="text-primary fill-purple-50" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-gray-800 pr-1">
                        {attendee.name.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Host Review sections */}
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col gap-5">
              <h3 className="font-black text-xs text-gray-950 uppercase tracking-widest flex items-center gap-1.5">
                <MessageSquare size={16} className="text-primary" /> Host Reviews ({organizerReviews.length})
              </h3>

              {/* Review submit forms */}
              {isAuthenticated && isApproved && !isOrganizer && !userHasReviewed && (
                <div className="bg-gray-50 border border-gray-150 p-4.5 rounded-2xl animate-fade-in">
                  <h4 className="font-bold text-xs text-gray-850 mb-2">Rate your hosting experience:</h4>
                  {reviewSubmitted ? (
                    <p className="text-emerald-700 text-xs font-semibold">✓ Review submitted! Thank you.</p>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-gray-600 mr-2">Rating:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="text-amber-400 p-0.5 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              size={18}
                              className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-350'}
                            />
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write a public review about the organizer's hosting, coordination, resources..."
                        className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                        maxLength={500}
                      />
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="self-end bg-primary hover:bg-primary-dark text-white text-xs font-semibold px-4.5 py-2 rounded-xl transition-colors"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Reviews listing loop */}
              {organizerReviews.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">No host feedback submitted yet.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {organizerReviews.map((rev) => (
                    <div key={rev._id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.reviewer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                            alt="reviewer avatar"
                            className="w-7 h-7 rounded-lg object-cover"
                          />
                          <div>
                            <span className="font-bold text-xs text-gray-800 leading-none block">{rev.reviewer?.name}</span>
                            <span className="text-[9px] text-gray-400 font-mono">
                              {new Date(rev.createdAt).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center text-amber-500 gap-0.5">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={10} className="fill-amber-500 text-amber-500" />
                          ))}
                        </div>
                      </div>
                      {rev.comment && <p className="text-xs text-gray-650 pl-9 leading-relaxed">{rev.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT SIDE: Sticky Booking Widget Sidebar (1/3 width) */}
          <div className="flex flex-col gap-6 sticky top-22">
            
            {/* Registration/Booking Card */}
            <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Join Status</span>
                <span className="text-xs text-gray-500 font-semibold">
                  {event.spotsLeft > 0 ? (
                    <span>
                      <strong className="text-primary font-extrabold text-sm">{event.spotsLeft}</strong> spots left
                    </span>
                  ) : (
                    <span className="text-rose-500 font-bold">Registration Full</span>
                  )}
                </span>
              </div>

              {/* RSVP Actions based on status */}
              <div>
                {isOrganizer ? (
                  <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-2xl flex flex-col gap-2 text-center">
                    <p className="text-xs font-semibold text-primary">You are hosting this getogather!</p>
                    <Link
                      to="/dashboard"
                      className="bg-primary hover:bg-primary-dark text-white font-bold text-xs py-2.5 rounded-xl transition-colors shadow-sm"
                    >
                      Go to Dashboard
                    </Link>
                  </div>
                ) : (
                  <div>
                    {isApproved ? (
                      <div className="bg-emerald-50 border border-emerald-100 p-4.5 rounded-2xl flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                          <CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                          <span>RSVP Confirmed</span>
                        </div>
                        <p className="text-[11px] text-emerald-700 leading-relaxed">
                          Your request is approved! Tap below to open the WhatsApp community link to coordinate meeting points.
                        </p>
                        <a
                          href={event.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-[#25D366] hover:bg-[#20ba56] text-white font-extrabold text-xs py-3 rounded-xl text-center shadow-md shadow-emerald-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Join WhatsApp Group Chat</span>
                        </a>
                      </div>
                    ) : isPending ? (
                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center flex flex-col gap-1">
                        <p className="text-xs font-bold text-amber-800">Request Status: Pending</p>
                        <p className="text-[10px] text-amber-700 mt-0.5">
                          The host must approve your RSVP before you can unlock the WhatsApp invite link.
                        </p>
                      </div>
                    ) : isRejected ? (
                      <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-center">
                        <p className="text-xs font-bold text-rose-800">Request Declined</p>
                        <p className="text-[10px] text-rose-700 mt-0.5">
                          Your request to join this group was rejected by the organizer.
                        </p>
                      </div>
                    ) : event.spotsLeft <= 0 ? (
                      <button
                        disabled
                        className="w-full bg-gray-100 text-gray-400 font-bold py-3.5 rounded-xl text-xs cursor-not-allowed border border-gray-200"
                      >
                        Event Full
                      </button>
                    ) : (
                      <button
                        onClick={handleJoinRequest}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-extrabold py-3.5 rounded-xl text-xs transition-colors shadow-md shadow-purple-100 cursor-pointer"
                      >
                        {isAuthenticated ? 'Request to Join Group' : 'Login to Join Group'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Date & Location sidebar panels */}
            <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
              <h4 className="font-black text-xs text-gray-950 uppercase tracking-wider">Meetup Schedule</h4>
              
              <div className="flex gap-3">
                <Calendar className="text-primary mt-0.5 shrink-0" size={16} />
                <div>
                  <h5 className="font-bold text-xs text-gray-800">Date & Time</h5>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                    {new Date(event.dateTime).toLocaleString('en-IN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 border-t border-gray-100 pt-3.5">
                <MapPin className="text-primary mt-0.5 shrink-0" size={16} />
                <div>
                  <h5 className="font-bold text-xs text-gray-800">Meeting Point</h5>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{event.location.address}</p>
                </div>
              </div>
            </div>

            {/* Small map embedded panel */}
            <div className="h-48 rounded-3xl overflow-hidden border border-gray-150 bg-gray-50 shadow-xs relative shrink-0">
              <LeafletMap
                center={[event.location.latitude, event.location.longitude]}
                zoom={14}
                events={[event]}
              />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default EventDetails;
