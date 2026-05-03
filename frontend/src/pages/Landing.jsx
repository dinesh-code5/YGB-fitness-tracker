import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { GiMuscleUp } from 'react-icons/gi';
import {
  FiArrowRight, FiCheck, FiTrendingUp, FiBook,
  FiShoppingBag, FiZap, FiTarget, FiAward, FiUsers
} from 'react-icons/fi';
import Footer from '../components/layout/Footer';

const FEATURES = [
  {
    icon: FiTrendingUp,
    title: 'Track Every Lift',
    desc: 'Log sets, reps and weight. Watch your PRs climb week over week with visual progress charts.',
    color: 'text-brand',
    bg: 'bg-brand/10 border-brand/20',
  },
  {
    icon: FiBook,
    title: 'Form Guidance',
    desc: 'Proper cues and common mistakes for every exercise. Lift smart, not just heavy.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    icon: FiShoppingBag,
    title: 'Indian Diet Plans',
    desc: 'Calorie & macro targets with realistic Indian food options — roti, dal, eggs and more.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
  },
  {
    icon: FiZap,
    title: 'PPL Workout Plan',
    desc: 'Science-backed Push-Pull-Legs split auto-generated for your goal and experience level.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
  },
  {
    icon: FiTarget,
    title: 'Goal Tracking',
    desc: 'Fat loss, muscle gain, or body recomp — your plan adapts to your specific target.',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
  },
  {
    icon: FiUsers,
    title: 'Community',
    desc: 'Share PRs, connect with buddies, and stay accountable with a growing fitness community.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20',
  },
];

const GOALS = ['Fat Loss', 'Muscle Gain', 'Body Recomp'];

const STATS = [
  { value: 'PPL Split', label: 'Auto-generated plan', icon: FiZap },
  { value: '100+', label: 'Indian meals tracked', icon: FiShoppingBag },
  { value: 'Free', label: 'No credit card needed', icon: FiAward },
];

const TESTIMONIALS = [
  { name: 'Arjun M.', goal: 'Muscle Gain', text: 'Lost 6kg and gained strength in 3 months. The PPL split is 🔥', avatar: 'A' },
  { name: 'Priya S.', goal: 'Fat Loss',    text: 'Finally a diet tracker with actual Indian food. Total game changer!', avatar: 'P' },
  { name: 'Rahul K.', goal: 'Recomp',      text: 'The streak system keeps me consistent. 45 days straight 💪', avatar: 'R' },
];

export default function Landing() {
  return (
    <div className="min-h-screen text-[#F0F0F5] relative">
      {/* Background glow orbs */}
      <div className="bg-glow" />
      <div className="bg-glow-extra" />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="relative flex items-center justify-between px-6 py-4 border-b border-[#222232]/80 backdrop-blur-md bg-[#0A0A0F]/60 sticky top-0 z-50">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
            <GiMuscleUp className="text-brand text-2xl" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-3xl leading-none tracking-widest text-gradient group-hover:brightness-110 transition-all duration-300">YGB</span>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gradient opacity-80 leading-none mt-1">Your Gym Buddy</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-lg py-2 px-4">Login</Link>
          <Link to="/register" className="btn-primary text-lg py-2 px-5 flex items-center gap-1.5">
            Get Started <FiArrowRight />
          </Link>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative px-6 pt-24 pb-28 text-center overflow-hidden">
        {/* Center glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-brand/5 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/4 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 badge-brand mb-8 py-2 px-4 text-xs animate-scale-in">
            <span className="text-base">💪</span>
            <span>Built for Indian gym beginners</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-7xl sm:text-8xl md:text-[110px] tracking-wider text-[#F0F0F5] leading-[0.9] mb-6">
            YOUR{' '}
            <span className="relative inline-block">
              <span className="text-gradient">GYM</span>
              <span className="absolute -inset-2 bg-brand/10 rounded-xl blur-xl -z-10" />
            </span>
            <br />
            BUDDY
          </h1>

          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Track your workouts, follow a personalized plan, and fuel your gains
            with the right Indian diet — <span className="text-[var(--text-primary)] font-medium">all in one place.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/register" className="btn-primary flex items-center justify-center gap-2 text-base py-4 px-10 shimmer">
              Start Free <FiArrowRight />
            </Link>
            <Link to="/login" className="btn-secondary flex items-center justify-center gap-2 text-base py-4 px-10">
              I have an account
            </Link>
          </div>

          {/* Goal pills */}
          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            {GOALS.map(g => (
              <span key={g} className="flex items-center gap-1.5 text-lg text-[var(--text-secondary)] bg-[#1A1A26] border border-[#222232] rounded-full px-4 py-1.5 hover:border-brand/30 hover:text-brand transition-all duration-200">
                <FiCheck className="text-brand text-xs" />{g}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────────── */}
      <section className="relative px-6 py-10 border-y border-[#222232]">
        <div className="absolute inset-0 bg-gradient-to-r from-brand/3 via-transparent to-brand/3 pointer-events-none" />
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={value} className="group">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Icon className="text-brand text-lg opacity-70" />
                <p className="font-display text-3xl sm:text-4xl text-brand tracking-wide">{value}</p>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features grid ──────────────────────────────────────────────── */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          
          <h2 className="font-display text-5xl sm:text-6xl tracking-wider mb-4">
            EVERYTHING YOU <span className="text-gradient">NEED</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-base max-w-xl mx-auto">
            One platform to manage your entire fitness journey — from first rep to personal record.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }, i) => (
            <div
              key={title}
              className="card p-6 hover:border-brand/30 hover:-translate-y-1 hover:shadow-[0_8px_30px_-8px_rgba(0,212,255,0.2)] transition-all duration-300 group animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${bg} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`${color} text-xl`} />
              </div>
              <h3 className="font-bold text-[var(--text-primary)] mb-2 text-base">{title}</h3>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────── */}
      <section className="px-6 py-20 border-t border-[#222232]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl sm:text-5xl tracking-wider mb-3">
              REAL <span className="text-gradient">RESULTS</span>
            </h2>
            <p className="text-[var(--text-secondary)] text-lg">From the YGB community</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, goal, text, avatar }) => (
              <div key={name} className="card p-6 hover:border-brand/30 hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand/30 to-brand/10 border border-brand/30 flex items-center justify-center font-black text-brand text-lg">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-[var(--text-primary)]">{name}</p>
                    <span className="badge-brand text-[9px] px-2 py-0.5">{goal}</span>
                  </div>
                </div>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed">"{text}"</p>
                <div className="flex gap-0.5 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xs">★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-brand/5 via-brand/10 to-brand/5 rounded-3xl blur-xl" />
          <div className="relative card p-10 text-center border-brand/20 hover:border-brand/40 transition-all duration-300">
            <div className="flex flex-col mb-8">
              <span className="font-display text-6xl tracking-widest text-gradient leading-none">YGB</span>
              <span className="text-xs font-black uppercase tracking-[0.3em] text-gradient opacity-80 mt-1">Your Gym Buddy</span>
            </div>
            <h2 className="font-display text-4xl tracking-wider mb-3">
              READY TO <span className="text-gradient">GRIND?</span>
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 text-lg max-w-sm mx-auto leading-relaxed">
              Set up your profile in 2 minutes and get your personalized PPL workout plan instantly.
            </p>
            <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base py-4 px-10 shimmer">
              Create Free Account <FiArrowRight />
            </Link>
            <p className="text-xs text-[var(--text-secondary)] mt-4 opacity-60">No credit card. No BS. Just gains.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
