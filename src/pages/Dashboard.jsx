import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, UserCheck, ShieldCheck, BarChart3, 
  Check, X, Award, CheckCircle2, ChevronRight 
} from 'lucide-react';

const Dashboard = () => {
  const { user, token } = useAuth();
  
  const [hostedEvents, setHostedEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [requests, setRequests] = useState([]);
  const [attendance, setAttendance] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchHostedEvents = async () => {
      if (!token) return;
      try {
        const response = await fetch('/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.eventsHosted) {
          setHostedEvents(data.eventsHosted);
          if (data.eventsHosted.length > 0) {
            setSelectedEventId(data.eventsHosted[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHostedEvents();
  }, [token]);

  const fetchEventData = async () => {
    if (!selectedEventId || !token) return;
    try {
      const ev = hostedEvents.find(e => e._id === selectedEventId);
      setSelectedEvent(ev);

      const reqResponse = await fetch(`/api/requests/event/${selectedEventId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const reqData = await reqResponse.json();
      if (reqData.success) {
        setRequests(reqData.requests);
      }

      const attResponse = await fetch(`/api/attendance/event/${selectedEventId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const attData = await attResponse.json();
      if (attData.success) {
        setAttendance(attData.attendance);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [selectedEventId, hostedEvents, token]);

  const handleRequestAction = async (requestId, status) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();

      if (data.success) {
        fetchEventData();
        const updatedEvents = hostedEvents.map(ev => {
          if (ev._id === selectedEventId) {
            return {
              ...ev,
              spotsLeft: status === 'approved' ? ev.spotsLeft - 1 : ev.spotsLeft + 1
            };
          }
          return ev;
        });
        setHostedEvents(updatedEvents);
      } else {
        alert(data.message || 'Action failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAttendanceCheckbox = (userId) => {
    const updated = attendance.map(att => {
      if (att.user?._id === userId) {
        return { ...att, isPresent: !att.isPresent };
      }
      return att;
    });
    setAttendance(updated);
  };

  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    setSuccessMsg('');
    const attendeesList = attendance.map(att => ({
      userId: att.user?._id,
      isPresent: att.isPresent
    }));

    try {
      const response = await fetch(`/api/attendance/event/${selectedEventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ attendeesList })
      });
      const data = await response.json();

      if (data.success) {
        setSuccessMsg('Attendance marked successfully! Credit rewards allocated.');
        setAttendance(data.attendance);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        alert(data.message || 'Failed to save attendance.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAttendance(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center bg-[#FAF7F2] p-8">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-[#5D4037]">Loading organizer metrics...</p>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="flex-grow bg-[#FAF7F2] py-8 overflow-y-auto">
      <div className="content-container">
        
        {/* Title Header */}
        <div className="bg-white border border-[#E6DFD3] rounded-3xl p-5 mb-8 shadow-xs">
          <h1 className="text-xl font-black text-[#3E2723] uppercase tracking-widest">Organizer Dashboard</h1>
          <p className="text-xs text-[#5D4037]/80 mt-1">Manage RSVP registration applications and mark verified check-ins.</p>
        </div>

        {hostedEvents.length === 0 ? (
          <div className="bg-white border border-[#E6DFD3] rounded-3xl p-12 text-center max-w-md mx-auto shadow-xs">
            <span className="text-4xl">📈</span>
            <h3 className="font-extrabold text-[#3E2723] text-base mt-4 font-sans">No events hosted yet</h3>
            <p className="text-xs text-[#5D4037]/80 mt-2 mb-6 leading-relaxed">
              You must host an event first before you can manage participants and check-ins.
            </p>
            <Link
              to="/create"
              className="bg-primary hover:bg-primary-dark text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md inline-block"
            >
              Host Event
            </Link>
          </div>
        ) : (
          /* Desktop Split Layout Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* LEFT COLUMN: Event switcher and analytics (40%) */}
            <div className="flex flex-col gap-6">
              
              {/* Event selector dropdown */}
              <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-xs">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                  Select Hosted Meetup
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-xs font-bold text-gray-800 focus:outline-none"
                >
                  {hostedEvents.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      {ev.title} ({new Date(ev.dateTime).toLocaleDateString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Stats Analytics */}
              {selectedEvent && (
                <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-xs flex flex-col gap-4">
                  <h3 className="font-black text-xs text-gray-950 uppercase tracking-widest border-b border-gray-100 pb-2">
                    Event Performance
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-purple-50/50 border border-purple-100/50 p-3.5 rounded-2xl text-center">
                      <BarChart3 size={16} className="text-primary mx-auto mb-1" />
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Limit</span>
                      <p className="text-sm font-extrabold text-gray-800 mt-0.5">{selectedEvent.participantLimit}</p>
                    </div>

                    <div className="bg-emerald-50/50 border border-emerald-100/50 p-3.5 rounded-2xl text-center">
                      <UserCheck size={16} className="text-emerald-600 mx-auto mb-1" />
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">RSVPs</span>
                      <p className="text-sm font-extrabold text-emerald-800 mt-0.5 text-emerald-700">
                        {selectedEvent.participantLimit - selectedEvent.spotsLeft}
                      </p>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-100/50 p-3.5 rounded-2xl text-center">
                      <Users size={16} className="text-amber-500 mx-auto mb-1" />
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Queue</span>
                      <p className="text-sm font-extrabold text-amber-800 mt-0.5 text-amber-700">
                        {pendingRequests.length}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: Pending queues and Check-in sheets (60%) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* RSVP requests queue */}
              <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs">
                <h3 className="font-black text-xs text-gray-950 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <ChevronRight size={14} className="text-primary shrink-0" /> Pending Join Requests ({pendingRequests.length})
                </h3>

                {pendingRequests.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-6 text-center">No pending guest request approvals.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {pendingRequests.map((req) => (
                      <div
                        key={req._id}
                        className="bg-gray-50/60 border border-gray-150 rounded-2xl p-4 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={req.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                            alt="avatar"
                            className="w-10 h-10 rounded-xl object-cover shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1">
                              <h4 className="font-extrabold text-xs text-gray-800 leading-none">{req.user?.name}</h4>
                              {req.user?.isVerified && (
                                <ShieldCheck size={14} className="text-primary fill-purple-100" />
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              Email: {req.user?.email} • Reputation: {req.user?.communityScore} pts
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRequestAction(req._id, 'approved')}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 text-[10px] font-bold px-3 py-2"
                          >
                            <Check size={12} strokeWidth={3} /> Approve
                          </button>
                          <button
                            onClick={() => handleRequestAction(req._id, 'rejected')}
                            className="bg-rose-500 hover:bg-rose-600 text-white p-2 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 text-[10px] font-bold px-3 py-2"
                          >
                            <X size={12} strokeWidth={3} /> Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Attendance checked sheet */}
              <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs">
                <h3 className="font-black text-xs text-gray-950 uppercase tracking-widest mb-1 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <ChevronRight size={14} className="text-primary shrink-0" /> Checked-In Attendance Sheet ({attendance.length})
                </h3>
                <p className="text-[10px] text-gray-400 mb-4">
                  Check boxes next to approved guests who attended physically, then save to distribute host credit progress rewards.
                </p>

                {successMsg && (
                  <div className="mb-4 bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-3 rounded-2xl text-xs flex items-center gap-2 animate-fade-in font-bold">
                    <CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {attendance.length === 0 ? (
                  <p className="text-xs text-gray-450 italic py-6 text-center">No approved attendees appear yet.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 flex flex-col gap-3">
                      {attendance.map((att) => (
                        <div
                          key={att._id}
                          className="flex items-center justify-between pb-3 border-b border-gray-200/50 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={att.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                              alt="avatar"
                              className="w-8 h-8 rounded-lg object-cover bg-gray-100"
                            />
                            <div>
                              <h5 className="font-extrabold text-xs text-gray-800 leading-none">{att.user?.name}</h5>
                              <span className="text-[9px] text-gray-400 font-mono block mt-1">
                                Mobile: {att.user?.phone || 'No phone linked'}
                              </span>
                            </div>
                          </div>

                          <label className="flex items-center cursor-pointer select-none bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-3xs">
                            <input
                              type="checkbox"
                              checked={att.isPresent}
                              onChange={() => handleAttendanceCheckbox(att.user?._id)}
                              className="w-4 h-4 text-primary bg-gray-100 border-gray-250 rounded-xs focus:ring-primary"
                            />
                            <span className="text-xs font-bold text-gray-700 ml-2">Present</span>
                          </label>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleSaveAttendance}
                      disabled={savingAttendance}
                      className="w-full bg-gray-900 hover:bg-black text-white font-extrabold text-xs py-4 rounded-2xl transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <Award size={14} />
                      {savingAttendance ? 'Saving check-in results...' : 'Save Checked-In Attendance'}
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
