import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    setError(null);
    setLoading(true);
    try {
      const result = await login(demoEmail, 'password123');
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow bg-[#FAF7F2] py-12 px-4 flex items-center justify-center min-h-[calc(100vh-69px)]">
      <div className="bg-white border border-[#E6DFD3] rounded-3xl max-w-md w-full p-8 shadow-md flex flex-col gap-6 animate-slide-up">
        {/* Banner Headers */}
        <div className="text-center sm:text-left">
          <div className="w-12 h-12 bg-amber-50 text-primary flex items-center justify-center rounded-2xl mb-4 font-mono font-bold text-xl mx-auto sm:mx-0">
            ⚡
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#3E2723]">Sign In to Get-To-Gather</h1>
          <p className="text-xs text-[#5D4037]/80 mt-1">Discover local events and connect with your community groups.</p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-2xl text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Login Panel */}
        <div className="bg-[#EFECE3]/50 border border-[#E6DFD3] rounded-2xl p-4 flex flex-col gap-2.5">
          <span className="block text-[10px] font-black text-primary uppercase tracking-wider text-center">
            🚀 Quick Demo Login (Pre-Seeded Accounts)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('vikram@gmail.com')}
              className="bg-white hover:bg-[#FAF7F2] text-[#3E2723] font-extrabold text-[10px] py-2.5 px-1 rounded-xl border border-[#E6DFD3] shadow-3xs cursor-pointer text-center leading-tight transition-all active:scale-95"
            >
              Vikram <span className="block text-[8px] font-medium text-slate-400">Organizer</span>
            </button>
            <button
              onClick={() => handleQuickLogin('aravind@gmail.com')}
              className="bg-white hover:bg-[#FAF7F2] text-[#3E2723] font-extrabold text-[10px] py-2.5 px-1 rounded-xl border border-[#E6DFD3] shadow-3xs cursor-pointer text-center leading-tight transition-all active:scale-95"
            >
              Aravind <span className="block text-[8px] font-medium text-slate-400">Social Host</span>
            </button>
            <button
              onClick={() => handleQuickLogin('pooja@gmail.com')}
              className="bg-white hover:bg-[#FAF7F2] text-[#3E2723] font-extrabold text-[10px] py-2.5 px-1 rounded-xl border border-[#E6DFD3] shadow-3xs cursor-pointer text-center leading-tight transition-all active:scale-95"
            >
              Pooja <span className="block text-[8px] font-medium text-slate-400">Attendee</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-bold text-[#5D4037]/90 uppercase mb-1.5">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#FAF7F2] border border-[#E6DFD3] rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium text-[#3E2723]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#5D4037]/90 uppercase mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FAF7F2] border border-[#E6DFD3] rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium text-[#3E2723]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-[#92400E] text-white font-extrabold py-3.5 rounded-2xl text-xs transition-colors mt-2 shadow-md shadow-amber-900/5 flex items-center justify-center gap-1.5 disabled:opacity-75 cursor-pointer animate-fade-in"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-[#E6DFD3]"></div>
          <span className="flex-shrink mx-4 text-[#5D4037]/50 text-[10px] uppercase font-bold tracking-wider">or continue with</span>
          <div className="flex-grow border-t border-[#E6DFD3]"></div>
        </div>

        {/* Google sign-in ready mockup */}
        <button
          onClick={() => alert('Google Authentication is ready to be configured! Set up OAuth credentials in backend settings.')}
          className="w-full border border-[#E6DFD3] hover:bg-[#FAF7F2] text-[#3E2723] font-bold py-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>

        {/* Form Footer */}
        <div className="text-center border-t border-[#E6DFD3] pt-4">
          <p className="text-xs text-[#5D4037]/80">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
