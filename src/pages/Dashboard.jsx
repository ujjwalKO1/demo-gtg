import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users, UserCheck, ShieldCheck, BarChart3,
  Check, X, Award, CheckCircle2, ChevronRight
} from 'lucide-react';

// Temporary mock data so the redesigned dashboard renders beautifully even
// without a running backend / hosted events yet.
const MOCK_HOSTED_EVENTS = [
  {
    _id: 'mock-dash-1',
    title: 'Sunrise 5-a-side Football',
    dateTime: new Date(Date.now() + 86400000).toISOString(),
    participantLimit: 10,
    spotsLeft: 3
  }
];

const MOCK_REQUESTS = [
  {
    _id: 'req-1',
    status: 'pending',
    user: { name: 'Kavya R.', email: 'kavya@example.com', communityScore: 120, isVerified: true, avatar: '' }
  },
  {
    _id: 'req-2',
    status: 'pending',
    user: { name: 'Dev A.', email: 'dev@example.com', communityScore: 45, isVerified: false, avatar: '' }
  }
];

const MOCK_ATTENDANCE = [
  { _id: 'att-1', isPresent: true, user: { _id: 'u1', name: 'Sanjay M.', phone: '+91 98xxxxxx01', avatar: '' } },
  { _id: 'att-2', isPresent: false, user: { _id: 'u2', name: 'Ishita P.', phone: '+91 98xxxxxx02', avatar: '' } }
];

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
      if (!token) {
        // No auth/backend session yet — show mock data for the design preview
        setHostedEvents(MOCK_HOSTED_EVENTS);
        setSelectedEventId(MOCK_HOSTED_EVENTS[0]._id);
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.eventsHosted && data.eventsHosted.length > 0) {
          setHostedEvents(data.eventsHosted);
          setSelectedEventId(data.eventsHosted[0]._id);
        } else {
          setHostedEvents(MOCK_HOSTED_EVENTS);
          setSelectedEventId(MOCK_HOSTED_EVENTS[0]._id);
        }
      } catch (err) {
        console.error('Error fetching dashboard events:', err);
        setHostedEvents(MOCK_HOSTED_EVENTS);
        setSelectedEventId(MOCK_HOSTED_EVENTS[0]._id);
      } finally {
        setLoading(false);
      }
    };
    fetchHostedEvents();
  }, [token]);

  const fetchEventData = async () => {
    if (!selectedEventId) return;

    // Mock event branch — keeps the design fully populated without a backend
    if (selectedEventId.startsWith('mock-')) {
      setSelectedEvent(MOCK_HOSTED_EVENTS.find(e => e._id === selectedEventId));
      setRequests(MOCK_REQUESTS);
      setAttendance(MOCK_ATTENDANCE);
      return;
    }

    if (!token) return;
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
    // Mock branch — update local state only, no network call
    if (requestId.startsWith('req-')) {
      setRequests(requests.map(r => r._id === requestId ? { ...r, status } : r));
      return;
    }

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

    // Mock branch — simulate a save without a backend
    if (selectedEventId?.startsWith('mock-')) {
      setTimeout(() => {
        setSuccessMsg('Attendance marked successfully! Credit rewards allocated.');
        setSavingAttendance(false);
        setTimeout(() => setSuccessMsg(''), 4000);
      }, 500);
      return;
    }

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
      <div className="flex-grow flex flex-col items-center justify-center bg-white p-8">
        <div className="w-9 h-9 border-[3px] border-[#1D1D1F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-medium text-[#86868B]">Loading organizer metrics...</p>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="flex-grow bg-white py-16 overflow-y-auto">
      <div className="content-container">

        {/* Title Header */}
        <div className="bg-[#F5F5F7] rounded-xl border-2 border-[#121212] shadow-[4px_4px_0_0_rgba(18,18,18,1)] p-8 mb-10">
          <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">Organizer Dashboard</h1>
          <p className="text-sm text-[#6E6E73] mt-1.5">Manage RSVP registration applications and mark verified check-ins.</p>
        </div>

        {hostedEvents.length === 0 ? (
          <div className="bg-[#F5F5F7] rounded-xl border-2 border-[#121212] shadow-[4px_4px_0_0_rgba(18,18,18,1)] p-16 text-center max-w-md mx-auto">
            <span className="text-4xl">📈</span>
            <h3 className="font-semibold text-[#1D1D1F] text-base mt-4">No events hosted yet</h3>
            <p className="text-xs text-[#86868B] mt-2 mb-6 leading-relaxed">
              You must host an event first before you can manage participants and check-ins.
            </p>
            <Link
              to="/create"
              className="bg-[#1D1D1F] hover:bg-black text-white font-medium text-xs px-6 py-3 rounded-full transition-all inline-block"
            >
              Host Event
            </Link>
          </div>
        ) : (
          /* Desktop Split Layout Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

            {/* LEFT COLUMN: Event switcher and analytics (40%) */}
            <div className="flex flex-col gap-6">

              {/* Event selector dropdown */}
              <div className="bg-white border border-black/[0.06] rounded-xl border-2 border-[#121212] shadow-[4px_4px_0_0_rgba(18,18,18,1)] p-6">
                <label className="block text-[10px] font-semibold text-[#86868B] uppercase tracking-wider mb-3">
                  Select Hosted Meetup
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full bg-[#F5F5F7] border-none rounded-2xl px-4 py-3.5 text-xs font-medium text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-black/10"
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
                <div className="bg-white border border-black/[0.06] rounded-xl border-2 border-[#121212] shadow-[4px_4px_0_0_rgba(18,18,18,1)] p-6 flex flex-col gap-5">
                  <h3 className="font-semibold text-xs text-[#1D1D1F] uppercase tracking-wider border-b border-black/[0.06] pb-3">
                    Event Performance
                  </h3>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#F5F5F7] p-4 rounded-2xl text-center">
                      <BarChart3 size={16} className="text-[#1D1D1F] mx-auto mb-1.5" />
                      <span className="text-[8px] font-semibold text-[#AEAEB2] uppercase tracking-wider block">Limit</span>
                      <p className="text-sm font-semibold text-[#1D1D1F] mt-0.5">{selectedEvent.participantLimit}</p>
                    </div>

                    <div className="bg-[#F5F5F7] p-4 rounded-2xl text-center">
                      <UserCheck size={16} className="text-[#1D7A46] mx-auto mb-1.5" />
                      <span className="text-[8px] font-semibold text-[#AEAEB2] uppercase tracking-wider block">RSVPs</span>
                      <p className="text-sm font-semibold text-[#1D1D1F] mt-0.5">
                        {selectedEvent.participantLimit - selectedEvent.spotsLeft}
                      </p>
                    </div>

                    <div className="bg-[#F5F5F7] p-4 rounded-2xl text-center">
                      <Users size={16} className="text-[#B8860B] mx-auto mb-1.5" />
                      <span className="text-[8px] font-semibold text-[#AEAEB2] uppercase tracking-wider block">Queue</span>
                      <p className="text-sm font-semibold text-[#1D1D1F] mt-0.5">
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
              <div className="bg-white border border-black/[0.06] rounded-xl border-2 border-[#121212] shadow-[4px_4px_0_0_rgba(18,18,18,1)] p-7">
                <h3 className="font-semibold text-xs text-[#1D1D1F] uppercase tracking-wider mb-5 flex items-center gap-1.5 border-b border-black/[0.06] pb-3">
                  <ChevronRight size={14} className="shrink-0" /> Pending Join Requests ({pendingRequests.length})
                </h3>

                {pendingRequests.length === 0 ? (
                  <p className="text-xs text-[#AEAEB2] italic py-6 text-center">No pending guest request approvals.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {pendingRequests.map((req) => (
                      <div
                        key={req._id}
                        className="bg-[#F5F5F7] rounded-2xl p-4 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={req.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                            alt="avatar"
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1">
                              <h4 className="font-semibold text-xs text-[#1D1D1F] leading-none">{req.user?.name}</h4>
                              {req.user?.isVerified && (
                                <ShieldCheck size={14} className="text-[#0A6CD9]" />
                              )}
                            </div>
                            <span className="text-[10px] text-[#86868B] mt-1.5 block">
                              Email: {req.user?.email} • Reputation: {req.user?.communityScore} pts
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRequestAction(req._id, 'approved')}
                            className="bg-[#1D1D1F] hover:bg-black text-white rounded-full transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold px-3.5 py-2"
                          >
                            <Check size={12} strokeWidth={3} /> Approve
                          </button>
                          <button
                            onClick={() => handleRequestAction(req._id, 'rejected')}
                            className="bg-white border border-black/[0.1] hover:bg-black/[0.03] text-[#1D1D1F] rounded-full transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold px-3.5 py-2"
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
              <div className="bg-white border border-black/[0.06] rounded-xl border-2 border-[#121212] shadow-[4px_4px_0_0_rgba(18,18,18,1)] p-7">
                <h3 className="font-semibold text-xs text-[#1D1D1F] uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-black/[0.06] pb-3">
                  <ChevronRight size={14} className="shrink-0" /> Checked-In Attendance Sheet ({attendance.length})
                </h3>
                <p className="text-[10px] text-[#86868B] mb-5">
                  Check boxes next to approved guests who attended physically, then save to distribute host credit progress rewards.
                </p>

                {successMsg && (
                  <div className="mb-4 bg-[#F0FAF3] text-[#1D7A46] px-4 py-3 rounded-2xl text-xs flex items-center gap-2 animate-fade-in font-semibold">
                    <CheckCircle2 size={16} />
                    <span>{successMsg}</span>
                  </div>
                )}

                {attendance.length === 0 ? (
                  <p className="text-xs text-[#AEAEB2] italic py-6 text-center">No approved attendees appear yet.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="bg-[#F5F5F7] rounded-2xl p-4 flex flex-col gap-3">
                      {attendance.map((att) => (
                        <div
                          key={att._id}
                          className="flex items-center justify-between pb-3 border-b border-black/[0.05] last:border-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={att.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                              alt="avatar"
                              className="w-8 h-8 rounded-full object-cover bg-white"
                            />
                            <div>
                              <h5 className="font-semibold text-xs text-[#1D1D1F] leading-none">{att.user?.name}</h5>
                              <span className="text-[9px] text-[#AEAEB2] font-mono block mt-1.5">
                                Mobile: {att.user?.phone || 'No phone linked'}
                              </span>
                            </div>
                          </div>

                          <label className="flex items-center cursor-pointer select-none bg-white rounded-full px-3.5 py-1.5">
                            <input
                              type="checkbox"
                              checked={att.isPresent}
                              onChange={() => handleAttendanceCheckbox(att.user?._id)}
                              className="w-4 h-4 text-[#1D1D1F] bg-white border-black/20 rounded-xs focus:ring-black/20"
                            />
                            <span className="text-xs font-medium text-[#48484A] ml-2">Present</span>
                          </label>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleSaveAttendance}
                      disabled={savingAttendance}
                      className="w-full bg-[#1D1D1F] hover:bg-black text-white font-semibold text-xs py-4 rounded-full transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
