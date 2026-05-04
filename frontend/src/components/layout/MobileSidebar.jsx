import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiPlusSquare, FiClock, FiTrendingUp,
  FiCalendar, FiShoppingBag, FiUser, FiLogOut, FiUsers, FiCoffee, FiX
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
  { to: '/profile', icon: FiUser, label: 'Profile' },
];

export default function MobileSidebar({ isOpen, onClose }) {
  const { user, logout, activeWorkout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-72 bg-[#0F0F14] border-r border-[var(--surface-border)] z-[70] transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[var(--surface-border)]">
            <Link to="/dashboard" onClick={onClose} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                <GiMuscleUp className="text-brand text-2xl" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl tracking-widest text-gradient leading-none">YGB</span>
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gradient opacity-80 mt-1">Your Gym Buddy</span>
              </div>
            </Link>
            <button onClick={onClose} className="text-muted p-1 hover:text-brand transition-colors">
              <FiX className="text-2xl" />
            </button>
          </div>


          {/* User Info */}
          {user && (
            <div className="p-5 border-b border-[var(--surface-border)] bg-brand/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center text-brand font-black">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-black text-[var(--text-primary)]">{user.name}</p>
                  <p className="text-[10px] text-muted uppercase font-bold tracking-widest">{user.goal}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
              const isWorkout = to === '/workout/log';
              const hasActive = isWorkout && activeWorkout;
              
              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-brand text-muted font-black'
                        : hasActive
                          ? 'text-brand bg-brand/5'
                          : 'text-muted hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]'
                    }`
                  }
                >
                  <Icon className="text-lg" />
                  <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer / Logout */}
          <div className="p-3 border-t border-[var(--surface-border)]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <FiLogOut className="text-lg" />
              <span className="text-xs font-bold uppercase tracking-widest">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
