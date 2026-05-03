import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GiMuscleUp } from 'react-icons/gi';
import { 
  FiMail, FiLock, FiEye, FiEyeOff, FiZap, FiUser, FiHeart,
  FiArrowRight, FiArrowLeft, FiActivity, FiTarget, FiTrendingUp, FiAward 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { ARCHETYPES } from '../utils/archetypes';
import toast from 'react-hot-toast';

const MOTIVATIONS = [
  { icon: FiZap,       text: 'Choose your archetype' },
  { icon: FiTrendingUp, text: 'Custom goals (Bulk/Cut/Maintain)' },
  { icon: FiAward,     text: 'Join the YGB elite community' },
];

const EXPERIENCE = [
  { value: 'beginner', label: 'Beginner', desc: '< 1 year' },
  { value: 'intermediate', label: 'Intermediate', desc: '1–3 years' },
  { value: 'advanced', label: 'Advanced', desc: '3+ years' },
];

const ACTIVITY = [
  { value: 'light', label: 'Light', desc: '1-2 days/wk' },
  { value: 'moderate', label: 'Moderate', desc: '3-4 days/wk' },
  { value: 'active', label: 'Active', desc: '5+ days/wk' },
];

const FloatingGymIcons = () => {
  const icons = [
    { Icon: GiMuscleUp, size: 120, color: 'text-brand', top: '15%', left: '10%', delay: 0, duration: 6 },
    { Icon: FiZap, size: 100, color: 'text-purple-500', bottom: '20%', right: '12%', delay: 1, duration: 8 },
    { Icon: FiHeart, size: 80, color: 'text-brand', top: '60%', left: '85%', delay: 0.5, duration: 7 },
    { Icon: FiActivity, size: 140, color: 'text-white', top: '25%', right: '15%', delay: 1.5, duration: 9 },
    { Icon: FiAward, size: 90, color: 'text-brand', bottom: '10%', left: '15%', delay: 2, duration: 7.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <div className="energy-beam opacity-5" style={{ animationDelay: '1s' }} />
      <div className="energy-beam opacity-5" style={{ animationDelay: '3s' }} />
      {icons.map((item, i) => (
        <motion.div
          key={i}
          className={`absolute opacity-[0.07] ${item.color}`}
          initial={{ y: 0, opacity: 0 }}
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: "easeInOut"
          }}
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            bottom: item.bottom,
            fontSize: item.size
          }}
        >
          <item.Icon />
        </motion.div>
      ))}
    </div>
  );
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    username: '', referralCode: '',
    age: '', weight: '', height: '', gender: 'male',
    archetype: 'fit', goal: 'maintain',
    experience: 'beginner', activityLevel: 'moderate'
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const nextStep = () => {
    if (step === 1) {
      if (!form.name || !form.email || !form.password || !form.username) return toast.error('Fill in all fields');
      if (form.password.length < 6) return toast.error('Password must be 6+ characters');
    }
    if (step === 2) {
      if (!form.age || !form.weight || !form.height) return toast.error('Please enter your stats');
    }
    setDirection(1);
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep(s => s - 1);
  };

  const handleArchetypeSelect = (archId) => {
    let goal = 'maintain';
    if (archId === 'lean') goal = 'lose_fat';
    if (archId === 'bulk') goal = 'build_muscle';
    setForm(p => ({ ...p, archetype: archId, goal }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        ...form,
        age: Number(form.age),
        weight: Number(form.weight),
        height: Number(form.height),
      });
      toast.success('Account created! Welcome to the Forge 💪');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen flex bg-[#0A0A0F]">
      {/* ── Left motivational panel ── */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden border-r border-white/5"
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand/8 via-transparent to-purple-500/5" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 left-1/4 w-80 h-80 bg-brand/10 rounded-full blur-[100px]" 
          />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative"
        >
          <span className="font-display text-5xl tracking-widest text-gradient block leading-none mb-1">YGB</span>
          <span className="text-xs font-black uppercase tracking-[0.3em] text-gradient opacity-80">Your Gym Buddy</span>
        </motion.div>

        <div className="relative">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="font-display text-6xl tracking-wider leading-[0.9] mb-6 text-[#F0F0F5]"
          >
            JOIN THE<br />
            <motion.span 
              animate={{ color: ['#F59E0B', '#FCD34D', '#F59E0B'] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-gradient"
            >
              FORGE
            </motion.span><br />
            TODAY.
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-[var(--text-secondary)] leading-relaxed mb-10 max-w-xs text-lg"
          >
            Create your account and start building the body you've always wanted with our advanced tracking tools.
          </motion.p>

          <div className="space-y-4">
            {MOTIVATIONS.map(({ icon: Icon, text }, idx) => (
              <motion.div 
                key={text} 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 + (idx * 0.1) }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="text-brand text-lg" />
                </div>
                <span className="text-lg text-[var(--text-primary)] font-medium">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="relative flex items-center gap-4"
        >
          <div className="flex -space-x-2">
            {['A','R','P','K'].map((l, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -5, scale: 1.1 }}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-brand/30 to-brand/10 border-2 border-[#0A0A0F] flex items-center justify-center text-brand font-black text-xs"
              >
                {l}
              </motion.div>
            ))}
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--text-primary)]">Be part of the 1%</p>
            <p className="text-[10px] text-[var(--text-secondary)]">Personalized archetypes for every goal</p>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Right: Multi-step Form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-y-auto overflow-x-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand/4 rounded-full blur-[100px] pointer-events-none" />

        <FloatingGymIcons />

        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[400px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <Link to="/" className="inline-block">
              <span className="font-display text-5xl tracking-widest text-gradient block leading-none mb-1">YGB</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gradient opacity-80">Your Gym Buddy</span>
            </Link>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-black text-[var(--text-primary)]">Join the Forge</h1>
              <span className="text-lg font-bold text-brand uppercase tracking-widest">Step {step}/4</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-brand"
                initial={{ width: 0 }}
                animate={{ width: `${(step/4)*100}%` }}
                transition={{ duration: 0.5, ease: "circOut" }}
              />
            </div>
          </div>

          <div className="card p-7 border-[#222232] hover:border-brand/20 transition-all duration-300 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.6)]">
            <div className="min-h-[420px] flex flex-col">
              <div className="flex-1 relative overflow-hidden">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={step}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    className="w-full"
                  >
                    {step === 1 && (
                      <div className="space-y-5">
                        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                          <label className="label text-lg">Full Name</label>
                          <div className="relative">
                            <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-lg" />
                            <input className="input-field pl-10" placeholder="Arjun Sharma" value={form.name} onChange={e => set('name', e.target.value)} />
                          </div>
                        </motion.div>
                        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                          <label className="label text-lg">Username</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-lg font-bold">@</span>
                            <input className="input-field pl-10" placeholder="arjun_lifts" value={form.username} onChange={e => set('username', e.target.value.toLowerCase())} />
                          </div>
                        </motion.div>
                        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
                          <label className="label text-lg">Email Address</label>
                          <div className="relative">
                            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-lg" />
                            <input className="input-field pl-10" placeholder="arjun@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                          </div>
                        </motion.div>
                        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                          <label className="label text-lg">Password</label>
                          <div className="relative">
                            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-lg" />
                            <input type={showPw ? 'text' : 'password'} className="input-field pl-10 pr-11" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />
                            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                              {showPw ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                            <label className="label text-lg">Age</label>
                            <input type="number" className="input-field" placeholder="24" value={form.age} onChange={e => set('age', e.target.value)} />
                          </motion.div>
                          <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                            <label className="label text-lg">Gender</label>
                            <select className="input-field" value={form.gender} onChange={e => set('gender', e.target.value)}>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </motion.div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
                            <label className="label text-lg">Weight (kg)</label>
                            <input type="number" className="input-field" placeholder="75" value={form.weight} onChange={e => set('weight', e.target.value)} />
                          </motion.div>
                          <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                            <label className="label text-lg">Height (cm)</label>
                            <input type="number" className="input-field" placeholder="175" value={form.height} onChange={e => set('height', e.target.value)} />
                          </motion.div>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-3">
                        <label className="label text-lg">Choose Your Archetype</label>
                        <div className="grid grid-cols-1 gap-3">
                          {ARCHETYPES.map((arch, idx) => (
                            <motion.button
                              key={arch.id}
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              transition={{ delay: idx * 0.1 }}
                              whileHover={{ scale: 1.02, x: 5 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleArchetypeSelect(arch.id)}
                              className={`p-3.5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
                                form.archetype === arch.id ? 'border-brand bg-brand/5 shadow-glow-sm' : 'border-[#222232] hover:border-white/10'
                              }`}
                            >
                              <div className="relative z-10 flex items-center justify-between">
                                <div>
                                  <p className={`font-black uppercase tracking-widest text-lg ${form.archetype === arch.id ? 'text-brand' : 'text-white'}`}>
                                    {arch.label}
                                  </p>
                                  <p className="text-xs font-bold text-white/40 uppercase">
                                    {arch.id === 'lean' ? 'Cut (Fat Loss)' : arch.id === 'bulk' ? 'Bulk (Gain Mass)' : 'Maintain'}
                                  </p>
                                </div>
                                <span className="text-3xl opacity-40 group-hover:opacity-100 transition-opacity">{arch.glyph}</span>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {step === 4 && (
                      <div className="space-y-8">
                        <div>
                          <label className="label text-lg mb-3">Experience</label>
                          <div className="grid grid-cols-1 gap-2.5">
                            {EXPERIENCE.map((exp, idx) => (
                              <motion.button 
                                key={exp.value} 
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ scale: 1.02, x: 5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => set('experience', exp.value)}
                                className={`px-4 py-3 rounded-xl border text-left flex items-center justify-between transition-all ${form.experience === exp.value ? 'border-brand bg-brand/10 text-brand' : 'border-[#222232] text-white/40 hover:border-white/10'}`}>
                                <span className="text-lg font-black uppercase tracking-wider">{exp.label}</span>
                                <span className="text-[10px] font-bold opacity-40">{exp.desc}</span>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                          <label className="label text-lg mb-3">Activity</label>
                          <div className="grid grid-cols-3 gap-2">
                            {ACTIVITY.map(act => (
                              <motion.button 
                                key={act.value} 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => set('activityLevel', act.value)}
                                className={`p-2.5 rounded-xl border text-center transition-all ${form.activityLevel === act.value ? 'border-brand bg-brand/10 text-brand' : 'border-[#222232] text-white/40 hover:border-white/10'}`}>
                                <p className="text-lg font-black uppercase">{act.label}</p>
                                <p className="text-[9px] font-bold opacity-30">{act.desc}</p>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} className="pt-2">
                          <label className="label text-lg">Referral Code (Optional)</label>
                          <input className="input-field uppercase font-mono tracking-widest" placeholder="YGB-XXXX" value={form.referralCode} onChange={e => set('referralCode', e.target.value.toUpperCase())} />
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex gap-3 mt-auto pt-10">
                {step > 1 && (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={prevStep} 
                    className="btn-secondary flex-1 py-3.5 flex items-center justify-center gap-2"
                  >
                    <FiArrowLeft /> Back
                  </motion.button>
                )}
                {step < 4 ? (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={nextStep} 
                    className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2"
                  >
                    Next <FiArrowRight />
                  </motion.button>
                ) : (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit} 
                    disabled={loading} 
                    className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2 shimmer"
                  >
                    {loading ? <span className="w-4 h-4 border-2 border-[#0A0A0F] border-t-transparent rounded-full animate-spin" /> : <FiZap />}
                    {loading ? 'Creating...' : 'Forge Account'}
                  </motion.button>
                )}
              </div>
            </div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-lg text-[var(--text-secondary)] mt-6"
            >
              Already a member?{' '}
              <Link to="/login" className="text-brand hover:underline font-bold">Sign In</Link>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
