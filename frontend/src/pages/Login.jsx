import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GiMuscleUp } from 'react-icons/gi';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Fill in all fields');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 💪');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0F0F14] bg-gradient-to-br from-[#0F0F14] via-[#16161E] to-[#0F0F14] relative overflow-hidden">
      {/* Animated Glowing Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 justify-center">
            <GiMuscleUp className="text-brand text-3xl" />
            <span className="font-display text-3xl tracking-wider text-brand">YGB</span>
          </Link>
          <p className="text-muted text-sm mt-2">Welcome back, legend</p>
        </div>

        <div className="card p-8 shadow-card">
          <h1 className="text-xl font-semibold mb-6">Sign In</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email or Username</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-muted" />
                <input
                  type="text"
                  className="input-field pl-9"
                  placeholder="email or username"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-muted" />
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field pl-9 pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-3 text-muted hover:text-[#F0F0F5]">
                  {showPw ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-[#0F0F14] border-t-transparent rounded-full animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            New here?{' '}
            <Link to="/register" className="text-brand hover:underline font-medium">Create account</Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="card-elevated mt-4 p-4 text-center rounded-xl">
          <p className="text-xs text-muted">Demo: <span className="text-brand font-mono">demo@ygb.com</span> / <span className="text-brand font-mono">demo123</span></p>
        </div>
      </div>
    </div>
  );
}
