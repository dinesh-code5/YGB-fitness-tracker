import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiPlusSquare, FiClock, FiTrendingUp,
  FiCalendar, FiShoppingBag, FiUser, FiLogOut, FiUsers, FiCoffee, FiMenu
} from 'react-icons/fi';
import { GiMuscleUp } from 'react-icons/gi';

const NAV_ITEMS = [
  { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/workout/log', icon: FiPlusSquare, label: 'Log Workout' },
  { to: '/workout/history', icon: FiClock, label: 'History' },
  { to: '/progress', icon: FiTrendingUp, label: 'Progress' },
  { to: '/plan', icon: FiCalendar, label: 'My Plan' },
  { to: '/diet', icon: FiShoppingBag, label: 'Diet' },
  { to: '/food-library', icon: FiCoffee, label: 'Food Library' },
  { to: '/social', icon: FiUsers, label: 'Community' },
];

export default function Navbar({ onMenuClick }) {
  const { user, logout, activeWorkout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#0F0F14]/90 backdrop-blur-xl border-b border-[var(--surface-border)] z-50 h-20 px-4 transition-all">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuClick}
          className="p-2 md:hidden text-muted hover:text-brand transition-colors"
        >
          <FiMenu className="text-2xl" />
        </button>

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <GiMuscleUp className="text-brand text-3xl" />
          <span className="font-display text-3xl tracking-wider text-brand">YGB</span>
        </Link>

        {/* Desktop Nav items */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const isWorkout = to === '/workout/log';
            const hasActive = isWorkout && activeWorkout;
            
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 group min-w-[80px] ${
                    isActive
                      ? 'bg-brand text-[#0F0F14] font-black shadow-glow-sm scale-105'
                      : hasActive
                        ? 'text-brand hover:bg-brand/5'
                        : 'text-muted hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]'
                  }`
                }
              >
                <Icon className="text-xl" />
                <span className="text-[9px] font-black uppercase tracking-[0.15em]">{label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User & Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end mr-2">
            <span className="text-xs font-black text-[var(--text-primary)]">{user?.name}</span>
            <span className="text-[9px] text-muted font-bold uppercase tracking-widest">{user?.goal}</span>
          </div>

          <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center text-brand font-black text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="hidden md:flex p-2.5 rounded-xl text-muted hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
            title="Logout"
          >
            <FiLogOut className="text-xl" />
          </button>
        </div>
      </div>
    </nav>
  );
}
