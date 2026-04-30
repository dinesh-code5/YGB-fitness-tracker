import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiPlusSquare, FiTrendingUp, FiUsers, FiUser } from 'react-icons/fi';

const MOBILE_NAV = [
  { to: '/dashboard', icon: FiHome, label: 'Home' },
  { to: '/workout/log', icon: FiPlusSquare, label: 'Log' },
  { to: '/progress', icon: FiTrendingUp, label: 'Progress' },
  { to: '/social', icon: FiUsers, label: 'Community' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
];

export default function MobileNav() {
  const { activeWorkout } = useAuth();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#16161E] border-t border-[#2A2A3A] z-50 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {MOBILE_NAV.map(({ to, icon: Icon, label }) => {
          const isWorkout = to === '/workout/log';
          const hasActive = isWorkout && activeWorkout;

          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 relative ${
                  isActive ? 'text-brand' : hasActive ? 'text-brand/70' : 'text-muted'
                }`
              }
            >
              <div className="relative">
                <Icon className="text-xl" />
                {hasActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand rounded-full border border-[#16161E] animate-pulse"/>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
