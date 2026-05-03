import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiGithub, FiHeart, FiExternalLink, FiZap } from 'react-icons/fi';
import { GiMuscleUp } from 'react-icons/gi';

const QUICK_LINKS = [
  { to: '/dashboard',       label: 'Dashboard' },
  { to: '/workout/log',     label: 'Log Workout' },
  { to: '/plan',            label: 'My Plan' },
  { to: '/diet',            label: 'Diet Calculator' },
  { to: '/progress',        label: 'Progress' },
  { to: '/social',          label: 'Community' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[var(--surface-border)] pt-16 pb-8 px-4 mt-auto overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand/3 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand/30 to-transparent" />

      <div className="max-w-7xl mx-auto relative">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-14">
          {/* Brand col */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/25 flex items-center justify-center">
                <GiMuscleUp className="text-brand text-2xl" />
              </div>
              <div>
                <span className="font-display text-3xl tracking-wider text-brand block leading-none">YGB</span>
                <span className="text-m font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Your Gym Buddy</span>
              </div>
            </div>
            <p className="text-[var(--text-secondary)] text-m leading-relaxed mb-6 max-w-xs">
              The ultimate toolkit for the modern Indian lifter. Track progress, optimize nutrition, and crush your goals.
            </p>
            {/* Quote */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-brand/5 border border-brand/15">
              <FiZap className="text-brand mt-0.5 flex-shrink-0" />
              <p className="text-l text-[var(--text-secondary)] italic leading-relaxed">
                "The secret to getting ahead is getting started."
                <span className="text-[var(--text-secondary)]/60 block mt-1 not-italic">— Mark Twain</span>
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-black text-m tracking-widest text-[var(--text-primary)] mb-5 uppercase">Quick Links</h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-l text-[var(--text-secondary)] hover:text-brand transition-colors font-medium flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-brand/40 group-hover:bg-brand transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-black text-l tracking-widest text-[var(--text-primary)] mb-5 uppercase">Contact</h4>
            <ul className="space-y-4">
              <li>
                <span className="text-m text-muted font-bold uppercase tracking-widest block mb-1">Email</span>
                <a href="mailto:nawanidinesh08@gmail.com"
                  className="text-m text-[var(--text-primary)] hover:text-brand transition-colors flex items-center gap-1.5">
                  nawanidinesh08@gmail.com
                  <FiExternalLink className="text-m opacity-60" />
                </a>
              </li>
              <li>
                <span className="text-l text-muted font-bold uppercase tracking-widest block mb-1">GitHub</span>
                <a href="https://github.com/dinesh-code5" target="_blank" rel="noopener noreferrer"
                  className="text-m text-[var(--text-primary)] hover:text-brand transition-colors flex items-center gap-1.5">
                  @dinesh-code5
                  <FiExternalLink className="text-m opacity-60" />
                </a>
              </li>
            </ul>

            <div className="mt-6 flex gap-3">
              <a href="https://github.com/dinesh-code5" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] flex items-center justify-center text-muted hover:text-brand hover:border-brand/40 transition-all">
                <FiGithub className="text-l" />
              </a>
              <a href="mailto:nawanidinesh08@gmail.com"
                className="w-9 h-9 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] flex items-center justify-center text-muted hover:text-brand hover:border-brand/40 transition-all">
                <FiMail className="text-l" />
              </a>
            </div>

            {/* Mobile app badge */}
            <div className="mt-6 p-4 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 rounded-full bg-brand animate-pulse" />
                <span className="text-m font-black uppercase tracking-widest text-brand">Mobile App</span>
                <span className="text-m font-bold text-muted ml-auto">Coming Soon</span>
              </div>
              <p className="text-m text-muted leading-relaxed">Native iOS & Android app in development.</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--surface-border)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-lg text-muted font-bold uppercase tracking-widest">
            © {currentYear} Dinesh Nawani. All rights reserved.
          </p>
          <p className="text-lg text-muted font-bold uppercase tracking-widest flex items-center gap-1.5">
            Built with <FiHeart className="text-red-500 heartbeat" /> by Dinesh Nawani
          </p>
        </div>
      </div>
    </footer>
  );
}
