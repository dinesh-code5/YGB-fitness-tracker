import React from 'react';
import { Link } from 'react-router-dom';
import { GiMuscleUp, GiWeightScale  } from 'react-icons/gi';
import { FiArrowRight, FiCheck, FiTrendingUp, FiBook, FiShoppingBag } from 'react-icons/fi';
import Footer from '../components/layout/Footer';
const FEATURES = [
  { icon: FiTrendingUp, title: 'Track Every Lift', desc: 'Log sets, reps and weight. Watch your strength grow week over week.' },
  { icon: FiBook, title: 'Form Guidance', desc: 'Proper cues and common mistakes for every exercise. Lift smart, not just heavy.' },
  { icon: FiShoppingBag, title: 'Indian Diet Plans', desc: 'Calorie and macro targets with realistic Indian food options — roti, dal, eggs and more.' },
];

const GOALS = ['Fat Loss', 'Muscle Gain', 'Body Recomp'];

export default function Landing() {
  return (
    <div className="min-h-screen text-[#F0F0F5]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A3A]">
        <div className="flex items-center gap-2">
          <GiMuscleUp className="text-brand text-2xl" />
          <span className="font-display text-2xl tracking-wider text-brand">YGB</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
          <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-24 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 badge-brand mb-6">
            <span className="text-lg">💪</span>
            <span>Built for Indian beginners</span>
          </div>

          <h1 className="font-display text-6xl md:text-8xl tracking-wider text-[#F0F0F5] leading-none mb-4">
            YOUR <span className="text-brand">GYM</span><br />BUDDY
          </h1>

          <p className="text-lg text-muted max-w-xl mx-auto mb-8 leading-relaxed">
            Track your workouts, follow a personalized plan, and fuel your gains with the right Indian diet — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link to="/register" className="btn-primary flex items-center justify-center gap-2 text-base py-3 px-8">
              Start Free <FiArrowRight />
            </Link>
            <Link to="/login" className="btn-secondary flex items-center justify-center gap-2 text-base py-3 px-8">
              I have an account
            </Link>
          </div>

          {/* Goal pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {GOALS.map(g => (
              <span key={g} className="flex items-center gap-1.5 text-sm text-muted bg-[#1E1E2A] border border-[#2A2A3A] rounded-full px-3 py-1">
                <FiCheck className="text-brand text-xs" />{g}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <div className="glow-line mb-12" />
        <h2 className="font-display text-4xl tracking-wider text-center mb-10">
          EVERYTHING YOU <span className="text-brand">NEED</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 hover:border-brand/30 transition-all duration-300 group">
              <div className="w-11 h-11 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-4 group-hover:bg-brand/20 transition-colors">
                <Icon className="text-brand text-xl" />
              </div>
              <h3 className="font-semibold text-[#F0F0F5] mb-2">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-t border-[#2A2A3A] px-6 py-10">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[['PPL Split', 'Auto-generated'], ['Indian Meals', 'Diet database'], ['Free Forever', 'No credit card']].map(([num, label]) => (
            <div key={num}>
              <p className="font-display text-3xl text-brand tracking-wide">{num}</p>
              <p className="text-xs text-muted mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <div className="max-w-lg mx-auto card p-8">
          <h2 className="font-display text-3xl tracking-wider mb-3">READY TO <span className="text-brand">GRIND?</span></h2>
          <p className="text-muted mb-6 text-sm">Set up your profile in 2 minutes and get your personalized workout plan.</p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2">
            Create Free Account <FiArrowRight />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
