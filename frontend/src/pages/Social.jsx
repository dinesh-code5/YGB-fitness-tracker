import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, workoutAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiUser, FiLock, FiUnlock, FiChevronRight, FiTrendingUp } from 'react-icons/fi';
import { GiMuscleUp } from 'react-icons/gi';
import toast from 'react-hot-toast';

const GOAL_EMOJI = { cut: '🔥', bulk: '💪', maintain: '⚖️' };

const UserCard = ({ user, onClick }) => (
  <button onClick={onClick}
    className="w-full card p-5 hover:border-brand/30 hover:bg-brand/3 transition-all text-left group flex items-center gap-4">
    <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0 text-xl font-light text-brand">
      {user.name?.charAt(0)?.toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="font-semibold text-[var(--text-primary)] text-base group-hover:text-brand transition-colors truncate">
          {user.name}
        </p>
        {user.isCoach && <span className="badge-brand text-[9px]">Coach</span>}
      </div>
      <p className="text-sm text-muted">@{user.username || 'no-username'}</p>
      {(user.goal || user.currentStreak > 0) && (
        <div className="flex items-center gap-3 mt-2">
          {user.goal && <span className="text-xs text-muted capitalize font-medium">{GOAL_EMOJI[user.goal]} {user.goal}</span>}
          {user.currentStreak > 0 && <span className="text-xs text-orange-400 font-bold">🔥 {user.currentStreak}d streak</span>}
        </div>
      )}
    </div>
    <FiChevronRight className="text-muted group-hover:text-brand transition-colors flex-shrink-0 text-xl" />
  </button>
);

export default function Social() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        const { data } = await userAPI.search(query);
        setResults(data.users || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchInput = (val) => {
    setQuery(val);
  };

  return (
    <div className="page-container max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl tracking-widest text-brand">COMMUNITY</h1>
        <div className="flex items-center gap-2 text-xs text-muted bg-[var(--surface-elevated)] px-3 py-1.5 rounded-lg border border-[var(--surface-border)]">
          <span>ID:</span>
          <span className="font-mono text-brand font-bold">@{user?.username || 'not set'}</span>
        </div>
      </div>

      {!user?.username && (
        <div className="card border-yellow-500/20 bg-yellow-500/5 p-5 mb-6 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top-4">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-bold text-yellow-400 uppercase tracking-wide">Set your username</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">Others can't find you or see your progress without a unique username.</p>
            <button onClick={() => navigate('/profile')} className="btn-secondary text-xs py-2 px-4 mt-3">
              Go to Profile →
            </button>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="relative mb-8">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-lg" />
        <input
          className="input-field pl-12 py-4 text-base"
          placeholder="Search for athletes..."
          value={query}
          onChange={e => handleSearchInput(e.target.value)}
        />
        {searching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Search results */}
      {query.length >= 2 ? (
        <div className="space-y-4">
          <p className="text-xs font-bold text-muted uppercase tracking-widest px-1">
            {results.length} athlete{results.length !== 1 ? 's' : ''} found
          </p>
          {results.length === 0 && !searching ? (
            <div className="card p-12 text-center border-dashed border-2">
              <FiUser className="text-muted/20 text-5xl mx-auto mb-4" />
              <p className="text-[var(--text-primary)] font-bold">No results found</p>
              <p className="text-xs text-muted mt-1">Try a different username or name</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map(u => (
                <UserCard
                  key={u.id}
                  user={u}
                  onClick={() => navigate(`/u/${u.username}`)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Default state */
        <div className="space-y-6">
          <div className="card p-12 text-center bg-gradient-to-br from-[var(--surface-card)] to-[var(--surface-elevated)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <GiMuscleUp className="text-brand/20 text-6xl mx-auto mb-4 relative z-10" />
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 relative z-10">Expand Your Circle</h3>
            <p className="text-muted text-sm max-w-xs mx-auto relative z-10 leading-relaxed">Search for your gym partners and stay motivated by tracking their consistency.</p>
            <div className="mt-8 bg-black/20 rounded-xl p-4 border border-white/5 relative z-10">
              <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-2">Pro Tip</p>
              <p className="text-xs text-muted">Share your ID <span className="text-brand font-mono font-bold">@{user?.username}</span> to get discovered faster.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
