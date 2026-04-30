import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GiMuscleUp } from 'react-icons/gi';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const GOALS = [
  { value: 'cut', label: 'Cut', emoji: '🔥', desc: 'Lose fat, stay lean' },
  { value: 'bulk', label: 'Bulk', emoji: '💪', desc: 'Build muscle & strength' },
  { value: 'maintain', label: 'Maintain', emoji: '⚖️', desc: 'Body recomposition' },
];
const EXPERIENCE = [
  { value: 'beginner', label: 'Beginner', desc: '< 1 year training' },
  { value: 'intermediate', label: 'Intermediate', desc: '1–3 years' },
  { value: 'advanced', label: 'Advanced', desc: '3+ years' },
];
const ACTIVITY = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Desk job, no exercise' },
  { value: 'light', label: 'Light', desc: '1-3 days/week' },
  { value: 'moderate', label: 'Moderate', desc: '3-5 days/week' },
  { value: 'active', label: 'Active', desc: '6-7 days/week' },
  { value: 'very_active', label: 'Very Active', desc: 'Athlete / physical job' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    username: '', referralCode: '',
    age: '', weight: '', height: '', gender: 'male',
    goal: 'maintain', experience: 'beginner', activityLevel: 'moderate'
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const nextStep = () => {
    if (step === 1) {
      if (!form.name || !form.email || !form.password) return toast.error('Fill in all fields');
      if (!form.username) return toast.error('Username is required');
      if (!/^[a-z0-9_.]{3,20}$/.test(form.username.toLowerCase())) return toast.error('Username: 3-20 chars, letters/numbers/._');
      if (form.password.length < 6) return toast.error('Password must be 6+ characters');
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await register({
        ...form,
        age: Number(form.age),
        weight: Number(form.weight),
        height: Number(form.height),
      });
      toast.success('Account created! Let get to work 💪');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0F0F14] bg-gradient-to-br from-[#0F0F14] via-[#16161E] to-[#0F0F14] py-10 relative overflow-hidden">
      {/* Animated Glowing Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 justify-center">
            <GiMuscleUp className="text-brand text-3xl" />
            <span className="font-display text-3xl tracking-wider text-brand">YGB</span>
          </Link>
          <p className="text-muted text-sm mt-1">Step {step} of 3</p>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-[#2A2A3A] rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-brand rounded-full transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        <div className="card p-8 shadow-card animate-slide-up">
          {/* Step 1: Account */}
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold mb-6">Create Account</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3 text-muted" />
                    <input className="input-field pl-9" placeholder="Arjun Sharma" value={form.name} onChange={e => set('name', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">Username <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted text-sm">@</span>
                    <input className="input-field pl-7" placeholder="arjun_lifts" value={form.username}
                      onChange={e => set('username', e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))} />
                  </div>
                  <p className="text-xs text-muted mt-1">Others can find you by this username. 3-20 chars.</p>
                </div>
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-3 text-muted" />
                    <input type="email" className="input-field pl-9" placeholder="arjun@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-3 text-muted" />
                    <input type={showPw ? 'text' : 'password'} className="input-field pl-9 pr-10" placeholder="6+ characters" value={form.password} onChange={e => set('password', e.target.value)} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-muted">
                      {showPw ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Referral Code <span className="text-muted text-xs">(optional)</span></label>
                  <input className="input-field text-sm" placeholder="Enter referral code if you have one"
                    value={form.referralCode} onChange={e => set('referralCode', e.target.value.toUpperCase())} />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Physical stats */}
          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold mb-6">Your Stats</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Age</label>
                    <input type="number" className="input-field" placeholder="Enter age" value={form.age} onChange={e => set('age', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Gender</label>
                    <select className="input-field" value={form.gender} onChange={e => set('gender', e.target.value)}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Weight (kg)</label>
                    <input type="number" className="input-field" placeholder="Weight in kg" value={form.weight} onChange={e => set('weight', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Height (cm)</label>
                    <input type="number" className="input-field" placeholder="Height in cm" value={form.height} onChange={e => set('height', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="label">Activity Level</label>
                  <div className="space-y-2">
                    {ACTIVITY.map(a => (
                      <button key={a.value} type="button" onClick={() => set('activityLevel', a.value)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${form.activityLevel === a.value ? 'border-brand bg-brand/10 text-brand' : 'border-[#2A2A3A] text-muted hover:border-[#3A3A4A]'}`}>
                        <span className="text-sm font-medium">{a.label}</span>
                        <span className="text-xs">{a.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <>
              <h2 className="text-xl font-semibold mb-6">Your Goal</h2>
              <div className="space-y-5">
                <div className="space-y-2">
                  {GOALS.map(g => (
                    <button key={g.value} type="button" onClick={() => set('goal', g.value)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${form.goal === g.value ? 'border-brand bg-brand/10' : 'border-[#2A2A3A] hover:border-[#3A3A4A]'}`}>
                      <span className="text-2xl">{g.emoji}</span>
                      <div className="text-left">
                        <p className={`font-semibold text-sm ${form.goal === g.value ? 'text-brand' : 'text-[#F0F0F5]'}`}>{g.label}</p>
                        <p className="text-xs text-muted">{g.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="label">Experience Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {EXPERIENCE.map(e => (
                      <button key={e.value} type="button" onClick={() => set('experience', e.value)}
                        className={`p-3 rounded-xl border text-center transition-all ${form.experience === e.value ? 'border-brand bg-brand/10 text-brand' : 'border-[#2A2A3A] text-muted hover:border-[#3A3A4A]'}`}>
                        <p className="text-sm font-semibold">{e.label}</p>
                        <p className="text-xs mt-0.5 opacity-75">{e.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex items-center gap-2">
                <FiArrowLeft /> Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={nextStep} className="btn-primary flex-1 flex items-center justify-center gap-2">
                Continue <FiArrowRight />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? <span className="w-4 h-4 border-2 border-[#0F0F14] border-t-transparent rounded-full animate-spin" /> : null}
                {loading ? 'Creating...' : 'Create Account 💪'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-muted mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
