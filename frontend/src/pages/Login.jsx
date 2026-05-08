import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GiMuscleUp } from 'react-icons/gi';
import { FiMail, FiLock, FiEye, FiEyeOff, FiZap, FiTrendingUp, FiAward } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const MOTIVATIONS = [
  { icon: FiZap,       text: 'Track every rep and set' },
  { icon: FiTrendingUp, text: 'Watch your strength climb' },
  { icon: FiAward,     text: 'Hit new PRs every week' },
];

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0A0A0F]">
      {/* ── Left motivational panel ── */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand/8 via-transparent to-purple-500/5" />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1] 
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 left-1/4 w-80 h-80 bg-brand/10 rounded-full blur-[100px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.08, 0.12, 0.08] 
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-purple-500/8 rounded-full blur-[80px]" 
          />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        {/* Logo */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative flex items-center gap-4"
        >
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center shadow-glow-sm"
          >
            <GiMuscleUp className="text-brand text-3xl" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-display text-5xl tracking-widest text-gradient leading-none mb-1">YGB</span>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-gradient opacity-80">Your Gym Buddy</span>
          </div>
        </motion.div>

        {/* Main copy */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          <motion.h2 variants={itemVariants} className="font-display text-6xl tracking-wider leading-[0.9] mb-6 text-[#F0F0F5]">
            EVERY<br />
            <motion.span 
              animate={{ color: ['#F59E0B', '#FCD34D', '#F59E0B'] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-gradient"
            >
              REP
            </motion.span><br />
            COUNTS.
          </motion.h2>
          <motion.p variants={itemVariants} className="text-[var(--text-secondary)] leading-relaxed mb-10 max-w-xs">
            Your journey to a stronger body starts with consistency. Log in and keep the momentum going.
          </motion.p>

          {/* Feature list */}
          <div className="space-y-4">
            {MOTIVATIONS.map(({ icon: Icon, text }, idx) => (
              <motion.div 
                key={text} 
                variants={itemVariants}
                custom={idx}
                className="flex items-center gap-3"
              >
                <motion.div 
                  whileHover={{ scale: 1.2, rotate: -10 }}
                  className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0"
                >
                  <Icon className="text-brand text-lg" />
                </motion.div>
                <span className="text-lg text-[var(--text-primary)] font-medium">{text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom stat */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="relative flex items-center gap-4"
        >
          <div className="flex -space-x-2">
            {['A','R','P','K'].map((l, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -5, scale: 1.1 }}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-brand/30 to-brand/10 border-2 border-[#0A0A0F] flex items-center justify-center text-brand font-black text-xs cursor-default"
              >
                {l}
              </motion.div>
            ))}
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--text-primary)]">Join the community</p>
            <p className="text-[10px] text-[var(--text-secondary)]">Hundreds of gym buddies tracking together</p>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Right: Form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Background Grid & Gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand/5 via-transparent to-purple-500/5" />
          <div className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand/5 rounded-full blur-[120px]" />
        </div>

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[400px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                <GiMuscleUp className="text-brand text-2xl" />
              </div>
              <div className="text-left">
                <span className="font-display text-4xl tracking-widest text-gradient block leading-none">YGB</span>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gradient opacity-80">Your Gym Buddy</span>
              </div>
            </Link>
          </div>

          {/* Form header */}
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-black text-[var(--text-primary)] mb-1">Welcome back 👋</h1>
            <p className="text-lg text-[var(--text-secondary)]">Sign in to continue your fitness journey</p>
          </motion.div>

          {/* Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="card p-7 border-[#222232] hover:border-brand/20 transition-all duration-300 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.6)]"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
                <label className="label">Email or Username</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-lg" />
                  <input
                    type="text"
                    className="input-field pl-10 focus:ring-brand/20 transition-all"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
                <label className="label">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-lg" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input-field pl-10 pr-11 focus:ring-brand/20 transition-all"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    {showPw ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </motion.div>

              <motion.button
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-2 shimmer"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-[#0A0A0F] border-t-transparent rounded-full animate-spin" />
                ) : <FiZap className="text-lg" />}
                {loading ? 'Signing in...' : 'Sign In'}
              </motion.button>
            </form>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="relative my-6"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#222232]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[var(--surface-card)] px-3 text-xs text-[var(--text-secondary)]">or</span>
              </div>
            </motion.div>

            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center text-lg text-[var(--text-secondary)]"
            >
              New here?{' '}
              <Link to="/register" className="text-brand hover:underline font-bold transition-all">Create account</Link>
            </motion.p>
          </motion.div>

          {/* Demo creds */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="card-elevated mt-4 p-4 text-center rounded-xl border-dashed border-[#222232]"
          >
            <p className="text-xs text-[var(--text-secondary)]">
              🔑 Demo:{' '}
              <span className="text-brand font-mono">demo@ygb.com</span>
              {' '}/ {' '}
              <span className="text-brand font-mono">demo123</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
