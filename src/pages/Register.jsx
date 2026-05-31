import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const result = await register(name, email, password);
      if (result.success) {
        navigate('/');
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
    <div className="flex-grow bg-slate-50 py-12 px-4 flex items-center justify-center min-h-[calc(100vh-69px)]">
      <div className="bg-white border border-gray-150 rounded-3xl max-w-md w-full p-8 shadow-md flex flex-col gap-6 animate-slide-up">
        {/* Header Header */}
        <div className="text-center sm:text-left">
          <div className="w-12 h-12 bg-purple-50 text-primary flex items-center justify-center rounded-2xl mb-4 font-mono font-bold text-xl mx-auto sm:mx-0">
            ⚡
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Create Account</h1>
          <p className="text-xs text-gray-500 mt-1">Get 1 free host credit immediately upon registration.</p>
        </div>

        {/* Error alert banner */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-2xl text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-450 uppercase mb-1.5">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <User size={16} />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aravind Sharma"
                className="w-full bg-gray-50 border border-gray-250 rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-450 uppercase mb-1.5">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-gray-50 border border-gray-250 rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-450 uppercase mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-gray-50 border border-gray-250 rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-extrabold py-3.5 rounded-2xl text-xs transition-colors mt-2 shadow-md shadow-purple-100 flex items-center justify-center gap-1.5 disabled:opacity-75 cursor-pointer animate-fade-in"
          >
            {loading ? 'Creating Account...' : 'Get Started'}
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        {/* Footer info link */}
        <div className="text-center border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
