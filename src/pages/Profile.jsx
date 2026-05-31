import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VerificationPlaceholder from '../components/VerificationPlaceholder';
import { 
  ShieldCheck, Phone, LogOut, Award, Zap, 
  MapPin, Calendar, Clock, CreditCard, ChevronRight, Edit3, Mail 
} from 'lucide-react';

const Profile = () => {
  const { 
    user, token, logout, updateProfile, verifyPhone, refreshUser 
  } = useAuth();
  const navigate = useNavigate();

  const [eventsHosted, setEventsHosted] = useState([]);
  const [eventsAttended, setEventsAttended] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('hosted');

  const [isDigiLockerOpen, setIsDigiLockerOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [phoneStep, setPhoneStep] = useState(1);
  const [phoneVerifying, setPhoneVerifying] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [savingBio, setSavingBio] = useState(false);

  const fetchProfileData = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setEventsHosted(data.eventsHosted);
        setEventsAttended(data.eventsAttended);
        setBio(data.user.bio || '');
      }

      const transResponse = await fetch('/api/credits/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const transData = await transResponse.json();
      if (transData.success) {
        setTransactions(transData.transactions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [token]);

  const handleUpdateBio = async (e) => {
    e.preventDefault();
    setSavingBio(true);
    const result = await updateProfile({ bio });
    if (result.success) {
      setIsEditing(false);
    } else {
      alert('Failed to update bio: ' + result.message);
    }
    setSavingBio(false);
  };

  const handleBuyCredit = async () => {
    try {
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        refreshUser();
        fetchProfileData();
      } else {
        alert('Payment failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartPhoneVerify = (e) => {
    e.preventDefault();
    if (phoneNumber.length < 10) return;
    setPhoneStep(2);
  };

  const handleConfirmOtp = async (e) => {
    e.preventDefault();
    if (smsCode !== '123456') {
      alert('Invalid OTP. Use test code: 123456');
      return;
    }
    setPhoneVerifying(true);
    try {
      const result = await verifyPhone(phoneNumber);
      if (result.success) {
        setIsPhoneModalOpen(false);
        setPhoneStep(1);
        setPhoneNumber('');
        setSmsCode('');
        refreshUser();
      } else {
        alert('Verification failed: ' + result.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPhoneVerifying(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="flex-grow bg-slate-50 py-8 overflow-y-auto">
      <div className="content-container">
        
        {/* Header Title and Logout */}
        <div className="bg-white border border-gray-150 rounded-3xl p-5 mb-8 flex justify-between items-center shadow-xs">
          <div>
            <h1 className="text-xl font-black text-gray-950 uppercase tracking-widest">My Profile</h1>
            <p className="text-xs text-gray-500 mt-1">Manage credit balances, achievements, identity details, and hosted histories.</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-rose-600 font-bold text-xs flex items-center gap-1 bg-rose-50 border border-rose-100 px-4 py-2.5 rounded-xl select-none hover:bg-rose-100 transition-all cursor-pointer"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>

        {/* Widescreen PC Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN: User Card & Identity Checks (40%) */}
          <div className="flex flex-col gap-6">
            
            {/* User details Card */}
            <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={user.name}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-gray-100 shadow-3xs"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-extrabold text-gray-900 text-sm leading-none">{user.name}</h2>
                    {user.isVerified && (
                      <ShieldCheck size={16} className="text-primary fill-purple-100" />
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">
                    Reputation Score: {user.communityScore} pts
                  </span>
                  
                  {user.phone ? (
                    <div className="flex items-center gap-1 text-[10px] font-bold font-mono text-gray-500 mt-1.5">
                      <Phone size={10} />
                      <span>{user.phone}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsPhoneModalOpen(true)}
                      className="text-[9px] font-black text-primary flex items-center gap-1 mt-1.5 hover:underline cursor-pointer"
                    >
                      + Link verified phone
                    </button>
                  )}
                </div>
              </div>

              {/* Bio description */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-wider">About Me</h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <form onSubmit={handleUpdateBio} className="flex flex-col gap-2.5">
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell the community about your interests..."
                      className="w-full bg-gray-50 border border-gray-250 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent font-medium"
                      maxLength={200}
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setBio(user.bio || '');
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-650 text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingBio}
                        className="bg-primary hover:bg-primary-dark text-white text-[10px] font-bold px-4 py-1.5 rounded-lg cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {user.bio || "Write something about yourself to build trust!"}
                  </p>
                )}
              </div>
            </div>

            {/* Identity verification panel */}
            {user.verificationStatus !== 'verified' && (
              <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-xs flex flex-col gap-3">
                <h4 className="font-black text-xs text-gray-950 uppercase tracking-widest border-b border-gray-100 pb-2">
                  Identity Verification
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Verify your details via Aadhaar pull in Government DigiLocker to unlock the verified badge shield next to your events.
                </p>
                <button
                  onClick={() => setIsDigiLockerOpen(true)}
                  className="bg-primary hover:bg-primary-dark text-white font-bold text-xs py-3 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Link Aadhaar via DigiLocker
                </button>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Credit management and activity tabs (60%) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Host credit progression bar widget */}
            <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-xs flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Credits Available</span>
                  <p className="text-lg font-black text-amber-600 flex items-center gap-1 mt-0.5">
                    ⚡ {user.hostCredits} Host Credits
                  </p>
                </div>
                <button
                  onClick={handleBuyCredit}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <CreditCard size={12} /> Purchase Credit (₹99)
                </button>
              </div>

              <div>
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold mb-1">
                  <span>Attendance Reward Progression</span>
                  <span>{user.verifiedAttendanceForCredits} / 5 events</span>
                </div>
                {/* CSS progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(user.verifiedAttendanceForCredits / 5) * 100}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5">
                  Checking-in at 5 verified meetups rewards you with **+1 free host credit** automatically.
                </p>
              </div>
            </div>

            {/* Activities Hub Tabs */}
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
              <div className="flex border-b border-gray-150 mb-2 select-none text-xs font-bold uppercase tracking-wider text-gray-400">
                <button
                  onClick={() => setActiveTab('hosted')}
                  className={`flex-1 text-center py-3 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'hosted' ? 'border-primary text-primary font-black' : 'border-transparent text-gray-400 hover:text-gray-650'
                  }`}
                >
                  Hosted ({eventsHosted.length})
                </button>
                <button
                  onClick={() => setActiveTab('attended')}
                  className={`flex-1 text-center py-3 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'attended' ? 'border-primary text-primary font-black' : 'border-transparent text-gray-400 hover:text-gray-650'
                  }`}
                >
                  Attended ({eventsAttended.length})
                </button>
                <button
                  onClick={() => setActiveTab('credits')}
                  className={`flex-1 text-center py-3 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'credits' ? 'border-primary text-primary font-black' : 'border-transparent text-gray-400 hover:text-gray-650'
                  }`}
                >
                  Credit History ({transactions.length})
                </button>
                <button
                  onClick={() => setActiveTab('badges')}
                  className={`flex-1 text-center py-3 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'badges' ? 'border-primary text-primary font-black' : 'border-transparent text-gray-400 hover:text-gray-650'
                  }`}
                >
                  Badges ({user.achievements.length})
                </button>
              </div>

              {/* Tab displays */}
              {activeTab === 'hosted' && (
                <div className="flex flex-col gap-2">
                  {eventsHosted.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-4">No events hosted yet.</p>
                  ) : (
                    eventsHosted.map((ev) => (
                      <div
                        key={ev._id}
                        onClick={() => navigate(`/event/${ev._id}`)}
                        className="border border-gray-150 rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 hover:border-purple-200 transition-all duration-150 bg-white"
                      >
                        <div>
                          <h4 className="font-extrabold text-xs text-gray-800 leading-snug">{ev.title}</h4>
                          <span className="text-[10px] text-gray-400 mt-1 block">
                            Category: {ev.category} • Date: {new Date(ev.dateTime).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <ChevronRight size={14} className="text-gray-400" />
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'attended' && (
                <div className="flex flex-col gap-2">
                  {eventsAttended.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-4">No events attended yet.</p>
                  ) : (
                    eventsAttended.map((ev) => (
                      <div
                        key={ev._id}
                        onClick={() => navigate(`/event/${ev._id}`)}
                        className="border border-gray-150 rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 hover:border-purple-200 transition-all duration-150 bg-white"
                      >
                        <div>
                          <h4 className="font-extrabold text-xs text-gray-800 leading-snug">{ev.title}</h4>
                          <span className="text-[10px] text-gray-400 mt-1 block">
                            Host: {ev.organizer?.name} • Date: {new Date(ev.dateTime).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <ChevronRight size={14} className="text-gray-400" />
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'credits' && (
                <div className="flex flex-col gap-2.5">
                  {transactions.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-4">No transaction logs available.</p>
                  ) : (
                    transactions.map((tr) => (
                      <div
                        key={tr._id}
                        className="border border-gray-150 rounded-2xl p-4 flex justify-between items-center gap-3 text-xs bg-gray-50/50"
                      >
                        <div>
                          <h5 className="font-bold text-gray-800 text-[11px]">
                            {tr.type === 'welcome_gift' && 'Welcome Registration Gift'}
                            {tr.type === 'event_host' && 'Hosted Getogather'}
                            {tr.type === 'attendance_reward' && 'Verified Attendance Bonus'}
                            {tr.type === 'purchase' && 'Credit Purchase'}
                          </h5>
                          <p className="text-[10px] text-gray-400 leading-tight mt-1">{tr.details}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`font-bold font-mono text-xs ${tr.amount > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {tr.amount > 0 ? `+${tr.amount}` : tr.amount}
                          </span>
                          <p className="text-[9px] text-gray-400 mt-1 font-mono">
                            {new Date(tr.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'badges' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {user.achievements.map((ach, i) => (
                    <div
                      key={i}
                      className="bg-purple-50/40 border border-purple-100 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-3xs"
                    >
                      <Award size={20} className="text-primary fill-purple-100 mb-1.5" />
                      <h4 className="font-extrabold text-[10px] text-gray-800 leading-none">{ach}</h4>
                      <p className="text-[8px] text-gray-400 mt-1">Unlocked Badge</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      <VerificationPlaceholder
        isOpen={isDigiLockerOpen}
        onClose={() => {
          setIsDigiLockerOpen(false);
          refreshUser();
          fetchProfileData();
        }}
      />

      {/* Phone input OTP binder */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 relative shadow-2xl animate-slide-up">
            <button
              onClick={() => {
                setIsPhoneModalOpen(false);
                setPhoneStep(1);
                setPhoneNumber('');
                setSmsCode('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-purple-50 text-primary flex items-center justify-center rounded-xl">
                <Phone size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base leading-tight">Firebase SMS Verify</h3>
                <p className="text-[10px] text-gray-400 font-mono">FIREBASE PHONE SECURITY</p>
              </div>
            </div>

            {phoneStep === 1 ? (
              <form onSubmit={handleStartPhoneVerify}>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Enter your mobile number to receive a secure SMS verification code powered by Firebase.
                </p>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none"
                    maxLength={10}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={phoneNumber.length < 10}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl text-xs transition-colors disabled:opacity-50"
                >
                  Send Verification SMS
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmOtp}>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  We sent a 6-digit OTP to **+91 {phoneNumber}**. Enter the code below to complete link. (Use test code: **123456**)
                </p>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000 000"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-center text-sm font-bold tracking-widest focus:outline-none"
                    maxLength={6}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={phoneVerifying || smsCode.length !== 6}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl text-xs transition-colors disabled:opacity-50"
                >
                  {phoneVerifying ? 'Confirming OTP...' : 'Verify & Bind Number'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const X = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default Profile;
