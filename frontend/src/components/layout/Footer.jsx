import React from 'react';
import { FiMail, FiGithub, FiHeart, FiExternalLink } from 'react-icons/fi';
import { GiMuscleUp } from 'react-icons/gi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A0A0F] border-t border-[var(--surface-border)] pt-16 pb-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <GiMuscleUp className="text-brand text-3xl" />
              <span className="font-display text-3xl tracking-wider text-brand">YGB</span>
            </div>
            <p className="text-muted text-sm leading-relaxed mb-6">
              The ultimate toolkit for the modern athlete. Track your progress, optimize your nutrition, and join the elite community.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://github.com/dinesh-code5" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] flex items-center justify-center text-muted hover:text-brand hover:border-brand transition-all"
              >
                <FiGithub />
              </a>
              <a 
                href="mailto:nawanidinesh08@gmail.com"
                className="w-10 h-10 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] flex items-center justify-center text-muted hover:text-brand hover:border-brand transition-all"
              >
                <FiMail />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm tracking-widest text-[var(--text-primary)] mb-6 uppercase">Contact & Help</h4>
            <ul className="space-y-4">
              <li className="flex flex-col">
                <span className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1">Email Inquiry</span>
                <a href="mailto:nawanidinesh08@gmail.com" className="text-[var(--text-primary)] hover:text-brand text-sm transition-colors flex items-center gap-2">
                  nawanidinesh08@gmail.com
                  <FiExternalLink className="text-xs" />
                </a>
              </li>
              <li className="flex flex-col">
                <span className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1">Github</span>
                <a href="https://github.com/dinesh-code5" target="_blank" rel="noopener noreferrer" className="text-[var(--text-primary)] hover:text-brand text-sm transition-colors flex items-center gap-2">
                  @dinesh-code5
                  <FiExternalLink className="text-xs" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm tracking-widest text-[var(--text-primary)] mb-6 uppercase">Mobile App</h4>
            <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand">Coming Soon</span>
              </div>
              <p className="text-muted text-xs leading-relaxed">
                We're currently developing a native mobile experience for iOS and Android. Stay tuned for the release!
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--surface-border)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <p className="text-[10px] text-muted font-bold uppercase tracking-widest">
            © {currentYear} DINESH NAWANI. ALL RIGHTS RESERVED.
          </p>
          <p className="text-[10px] text-muted font-bold uppercase tracking-widest flex items-center gap-1">
            BUILT BY DINESH NAWANI WITH <FiHeart className="text-red-500 mx-1" />
          </p>
        </div>
      </div>
    </footer>
  );
}
