import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ShieldCheck, X, FileText, Lock } from 'lucide-react';

const VerificationPlaceholder = ({ isOpen, onClose }) => {
  const { verifyIdentity } = useAuth();
  const [step, setStep] = useState(1); // 1: Info, 2: Simulating Fetch, 3: Success
  const [loading, setLoading] = useState(false);
  const [aadhaarNum, setAadhaarNum] = useState('');

  if (!isOpen) return null;

  const handleStartVerification = async (e) => {
    e.preventDefault();
    if (aadhaarNum.length !== 12) return;
    
    setLoading(true);
    setStep(2);

    // Simulate DigiLocker / Aadhaar verification latency (2.5 seconds)
    setTimeout(async () => {
      try {
        const result = await verifyIdentity();
        if (result.success) {
          setStep(3);
        } else {
          alert('Verification failed: ' + result.message);
          setStep(1);
        }
      } catch (err) {
        alert('Verification request error.');
        setStep(1);
      } finally {
        setLoading(false);
      }
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 relative shadow-2xl animate-slide-up">
        {step !== 2 && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        )}

        {step === 1 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-purple-50 text-primary flex items-center justify-center rounded-xl">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base leading-tight">DigiLocker Verification</h3>
                <p className="text-[10px] text-gray-400 font-mono">SECURE IDENTITY SYSTEM</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              GTG verifies organizer identities through Government DigiLocker to keep the community safe. Verifying your ID unlocks the **Verified Badge** on your events.
            </p>

            <form onSubmit={handleStartVerification}>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Enter 12-Digit Aadhaar Number</label>
                <input
                  type="text"
                  maxLength={12}
                  value={aadhaarNum}
                  onChange={(e) => setAadhaarNum(e.target.value.replace(/\D/g, ''))}
                  placeholder="0000 0000 0000"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-center text-sm font-semibold tracking-widest focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-4 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <Lock size={12} className="shrink-0" />
                <span>Your data is encrypted. We only check name matches and do not store raw numbers.</span>
              </div>

              <button
                type="submit"
                disabled={aadhaarNum.length !== 12}
                className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-purple-100"
              >
                Pull Aadhaar via DigiLocker
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Connecting to DigiLocker...</h4>
            <p className="text-xs text-gray-500 max-w-[240px]">
              Verifying credentials, requesting consent authorization, and retrieving verified name...
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle2 size={36} strokeWidth={2.5} className="animate-bounce" />
            </div>
            <h3 className="font-extrabold text-gray-900 text-lg mb-1.5">Verification Successful!</h3>
            <p className="text-xs text-gray-500 px-4 leading-relaxed mb-6">
              Your name matches your government profile. You have received the **Verified Organizer** badge!
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3 rounded-xl text-xs transition-colors"
            >
              Back to Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPlaceholder;
