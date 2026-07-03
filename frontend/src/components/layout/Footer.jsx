import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiGithub, FiHeart, FiExternalLink, FiZap } from 'react-icons/fi';
import { GiMuscleUp } from 'react-icons/gi';

// const QUICK_LINKS = [
//   { to: '/dashboard',       label: 'Dashboard' },
//   { to: '/workout/log',     label: 'Log Workout' },
//   { to: '/workout/plan',    label: 'My Plan' },
//   { to: '/diet',     label: 'Diet Master' },
//   { to: '/progress',        label: 'Progress' },
//   { to: '/social',          label: 'Community' },
// ];

/* ... inside the Footer component ... */
export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [quoteIndex, setQuoteIndex] = React.useState(0);

  const QUOTES = [
    { text: "The secret to getting ahead is getting started.", author: "Mark Twain" },
    { text: "Pain is temporary. Pride is forever.", author: "Arnold Schwarzenegger" },
    { text: "Discipline is doing what needs to be done, even if you don't want to do it.", author: "Ronnie Coleman" },
    { text: "Don't stop when you're tired. Stop when you're done.", author: "David Goggins" },
    { text: "Your body can stand almost anything. It’s your mind that you have to convince.", author: "Jim Rohn" },
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 10000); // Slower rotation: 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="relative border-t border-[var(--surface-border)] pt-16 pb-8 px-4 mt-auto overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand/30 to-transparent" />

      <div className="max-w-7xl mx-auto relative">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-14">
          {/* Brand & Quote col */}
          <div className="space-y-8">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/25 flex items-center justify-center">
                <GiMuscleUp className="text-brand text-2xl" />
              </div>
              <div>
                <span className="font-display text-3xl tracking-wider text-brand block leading-none">YGB</span>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Your Gym Buddy</span>
              </div>
            </div>
            
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-sm">
              The ultimate toolkit for the modern lifter. Track progress, optimize nutrition, and crush your goals.
            </p>

            {/* Quote container - Moved below branding, clearly separated */}
            <div className="p-4 rounded-xl bg-brand/5 border border-brand/10">
                <div key={quoteIndex} className="flex items-start gap-3 animate-fade-in">
                  <FiZap className="text-brand mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-[var(--text-secondary)] italic leading-relaxed">
                    "{QUOTES[quoteIndex].text}"
                    <span className="text-[var(--text-secondary)]/60 block mt-1 not-italic text-xs">— {QUOTES[quoteIndex].author}</span>
                  </p>
                </div>
            </div>
          </div>

          {/* Contact & Misc col */}
          <div className="flex flex-col md:items-end">
            <h4 className="font-black text-xs tracking-widest text-[var(--text-primary)] mb-5 uppercase">Connect</h4>

            <div className="flex gap-3 mb-8">
              <a href="https://github.com/dinesh-code5" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] flex items-center justify-center text-muted hover:text-brand hover:border-brand/40 transition-all">
                <FiGithub className="text-lg" />
              </a>
              <a href="mailto:nawanidinesh08@gmail.com"
                className="w-10 h-10 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] flex items-center justify-center text-muted hover:text-brand hover:border-brand/40 transition-all">
                <FiMail className="text-lg" />
              </a>
            </div>

            {/* Mobile app badge */}
            <div className="p-4 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] max-w-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 rounded-full bg-brand animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest text-brand">Mobile App</span>
                <span className="text-xs font-bold text-muted ml-auto">Coming Soon</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">Native iOS & Android app in development.</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--surface-border)] pt-6 text-center">
          <p className="text-[10px] text-muted font-bold uppercase tracking-widest">
            © {currentYear} Dinesh Nawani. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
