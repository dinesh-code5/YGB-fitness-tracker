import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiPlusSquare, FiClock, FiTrendingUp,
  FiCalendar, FiShoppingBag, FiUser, FiLogOut, FiUsers, FiCoffee, FiMenu, FiZap
} from 'react-icons/fi';
import { GiMuscleUp } from 'react-icons/gi';

const NAV_ITEMS = [
  { to: '/dashboard',      icon: FiHome,       label: 'Dashboard' },
  { to: '/workout/log',    icon: FiPlusSquare,  label: 'Log Workout' },
  { to: '/workout/history',icon: FiClock,       label: 'History' },
  { to: '/progress',       icon: FiTrendingUp,  label: 'Progress' },
  { to: '/plan',           icon: FiCalendar,    label: 'My Plan' },
  { to: '/diet',           icon: FiShoppingBag, label: 'Diet' },
  { to: '/food-library',   icon: FiCoffee,      label: 'Food Library' },
  { to: '/social',         icon: FiUsers,       label: 'Community' },
];

export default function Navbar({ onMenuClick }) {
  const { user, logout, activeWorkout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 h-24 px-6 transition-all duration-300
      ${scrolled
        ? 'bg-[#0A0A0F]/95 backdrop-blur-2xl border-b border-[#222232]'
        : 'bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-[#222232]/60'
      }`}
      style={scrolled ? { boxShadow: '0 6px 32px -4px color-mix(in srgb, var(--theme-color), transparent 86%)' } : {}}
    >
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand/70 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-[8px] bg-gradient-to-b from-brand/10 to-transparent" />

      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">

        {/* Mobile Menu Toggle */}
        <button
          onClick={onMenuClick}
          className="p-2 md:hidden text-[var(--text-secondary)] hover:text-brand transition-colors"
        >
          <FiMenu className="text-2xl" />
        </button>

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 group flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-brand/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <div className="relative w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center group-hover:border-brand/40 transition-all duration-300">
              <GiMuscleUp className="text-brand text-2xl" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-3xl leading-none tracking-widest text-gradient group-hover:brightness-110 transition-all duration-300">YGB</span>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gradient opacity-80 leading-none mt-1">Your Gym Buddy</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const isLogWorkout = to === '/workout/log';
            const hasActive = isLogWorkout && activeWorkout;

            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl
                   transition-all duration-200 group min-w-[84px] text-center
                   ${isActive
                     ? 'bg-brand/15 text-brand'
                     : hasActive
                       ? 'text-brand hover:bg-brand/8'
                       : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]'
                   }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`relative transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                      <Icon className="text-xl" />
                      {hasActive && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full active-ping" />
                      )}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.12em] leading-none">{label}</span>
                    {isActive && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-brand rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Right: user info + logout */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Active workout badge */}
          {activeWorkout && (
            <div className="hidden lg:flex items-center gap-2 bg-green-500/10 border border-green-500/25 rounded-lg px-3 py-2">
              <FiZap className="text-green-400 text-lg" />
              <span className="text-[11px] font-black uppercase tracking-widest text-green-400">Live</span>
            </div>
          )}

          {/* User info */}
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-lg font-bold text-[var(--text-primary)] leading-tight">{user?.name}</span>
            <span className="text-[11px] text-[var(--text-secondary)] font-bold uppercase tracking-widest leading-tight">{user?.goal}</span>
          </div>

          {/* Avatar */}
          <Link to="/profile" className="relative group">
            <div className="absolute inset-0 bg-brand/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-brand/30 to-brand/10 border border-brand/40 flex items-center justify-center text-brand font-black text-base group-hover:border-brand/70 transition-all duration-300">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="hidden md:flex p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
            title="Logout"
          >
            <FiLogOut className="text-xl" />
          </button>
        </div>
      </div>
    </nav>
  );
}
