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
    className="w-full card p-4 hover:border-brand/30 hover:bg-brand/3 transition-all text-left group flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center flex-shrink-0">
      <span className="font-display text-lg text-brand">{user.name?.charAt(0)?.toUpperCase()}</span>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="font-semibold text-[#F0F0F5] text-sm group-hover:text-brand transition-colors truncate">
          {user.name}
        </p>
        {user.isCoach && <span className="badge-brand text-[10px]">Coach</span>}
      </div>
      <p className="text-xs text-muted">@{user.username || 'no-username'}</p>
      {(user.goal || user.currentStreak > 0) && (
        <div className="flex items-center gap-2 mt-1">
          {user.goal && <span className="text-xs text-muted capitalize">{GOAL_EMOJI[user.goal]} {user.goal}</span>}
          {user.currentStreak > 0 && <span className="text-xs text-orange-400">🔥 {user.currentStreak}d streak</span>}
        </div>
      )}
    </div>
    <FiChevronRight className="text-muted group-hover:text-brand transition-colors flex-shrink-0" />
  </button>
);

const PublicProfileModal = ({ username, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoomPhoto, setZoomPhoto] = useState(null);

  useEffect(() => {
    userAPI.getPublicProfile(username)
      .then(r => setProfile(r.data.user))
      .catch(() => toast.error('Could not load profile'))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[2.5rem] w-full max-w-lg flex flex-col shadow-2xl animate-in zoom-in-95 my-auto" style={{ maxHeight: '90vh' }}>
          <div className="flex items-center justify-between p-8 border-b border-[var(--surface-border)] flex-shrink-0">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Public Profile</h3>
              <p className="text-[10px] font-medium text-muted uppercase tracking-widest mt-1">Athlete Identity</p>
            </div>
            <button onClick={onClose} className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-[var(--surface-elevated)] transition-colors text-muted hover:text-[var(--text-primary)] text-2xl leading-none">
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {!profile ? (
              <div className="py-12 text-center text-muted font-medium italic">Profile restricted or not found</div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-3xl font-light text-brand">
                    {profile.name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">{profile.name}</h2>
                    <p className="text-sm text-brand font-mono font-medium">@{profile.username}</p>
                    {profile.bio && <p className="text-sm text-muted mt-2 leading-relaxed font-light italic">"{profile.bio}"</p>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Goal', value: profile.goal || '—' },
                    { label: 'Streak', value: `${profile.currentStreak || 0}d` },
                    { label: 'Best', value: `${profile.longestStreak || 0}d` },
                  ].map(s => (
                    <div key={s.label} className="bg-[var(--surface-elevated)]/30 border border-[var(--surface-border)] rounded-2xl p-4 text-center">
                      <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-1">{s.label}</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)] capitalize">{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Workout History */}
                {profile.workoutHistory && profile.workoutHistory.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                      <div className="w-1 h-3 bg-brand rounded-full" />
                      Recent Activity
                    </h4>
                    <div className="space-y-3">
                      {profile.workoutHistory.map(w => (
                        <div key={w.id} className="bg-[var(--surface-elevated)]/20 border border-[var(--surface-border)] p-4 rounded-2xl">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-[var(--text-primary)]">{w.name}</p>
                            <span className="text-[10px] font-medium text-muted">{w.duration}m</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black uppercase text-brand tracking-tighter bg-brand/5 px-2 py-0.5 rounded border border-brand/10">
                              {w.workoutType || 'custom'}
                            </span>
                            <span className="text-[10px] text-muted font-medium">
                              {new Date(w.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress Photos */}
                {profile.progressPhotos && profile.progressPhotos.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                      <div className="w-1 h-3 bg-brand rounded-full" />
                      Evolution
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {profile.progressPhotos.slice(0, 9).reverse().map((photo, idx) => (
                        <div key={idx} 
                          onClick={() => setZoomPhoto(photo)}
                          className="aspect-[3/4] rounded-xl bg-[var(--surface-elevated)] overflow-hidden cursor-pointer hover:opacity-80 transition-all border border-[var(--surface-border)]">
                          {photo?.imageUrl && (
                            <img src={photo.imageUrl} alt="Progress" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-[var(--surface-border)] text-center">
                  <p className="text-[10px] text-muted font-medium uppercase tracking-widest">
                    Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'recently'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {zoomPhoto && (
        <div className="fixed inset-0 bg-black/95 z-[110] flex items-center justify-center p-6 backdrop-blur-xl" onClick={() => setZoomPhoto(null)}>
          <div className="relative max-w-lg w-full bg-[var(--surface-card)] rounded-3xl overflow-hidden border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={zoomPhoto.imageUrl} alt="Zoomed" className="w-full h-auto" />
            <div className="absolute top-6 right-6">
              <button className="w-10 h-10 bg-black/50 hover:bg-black/80 rounded-2xl flex items-center justify-center text-white text-2xl transition-all" onClick={() => setZoomPhoto(null)}>×</button>
            </div>
            {zoomPhoto.weight && (
              <div className="p-6 bg-[var(--surface-card)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xl font-semibold text-brand">{zoomPhoto.weight} KG</p>
                  <p className="text-[10px] font-medium text-muted uppercase tracking-widest">{new Date(zoomPhoto.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                </div>
                {zoomPhoto.note && <p className="text-sm text-[var(--text-primary)] font-light leading-relaxed">"{zoomPhoto.note}"</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default function Social() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState(null);

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl tracking-wider">COMMUNITY</h1>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <span>Your ID:</span>
          <span className="font-mono text-brand font-medium">@{user?.username || 'not set'}</span>
        </div>
      </div>

      {!user?.username && (
        <div className="card border-yellow-500/20 bg-yellow-500/5 p-4 mb-5 rounded-xl flex items-start gap-3">
          <span className="text-xl flex-shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-medium text-yellow-400">Set your username to be discoverable</p>
            <p className="text-xs text-muted mt-0.5">Others can't find you without a username.</p>
            <button onClick={() => navigate('/profile')} className="btn-secondary text-xs py-1.5 mt-2">
              Go to Profile →
            </button>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          className="input-field pl-10 text-sm"
          placeholder="Search by username or name..."
          value={query}
          onChange={e => handleSearchInput(e.target.value)}
        />
        {searching && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Search results */}
      {query.length >= 2 ? (
        <div>
          <p className="text-xs text-muted mb-3">
            {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </p>
          {results.length === 0 && !searching ? (
            <div className="card p-8 text-center">
              <FiUser className="text-muted/30 text-4xl mx-auto mb-2" />
              <p className="text-muted text-sm">No users found</p>
              <p className="text-xs text-muted mt-1">Only public profiles appear in search</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map(u => (
                <UserCard
                  key={u.id}
                  user={u}
                  onClick={() => setSelectedUsername(u.username)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Default state */
        <div>
          <div className="card p-8 text-center">
            <GiMuscleUp className="text-brand/20 text-5xl mx-auto mb-3" />
            <p className="text-[#F0F0F5] font-medium mb-1">Find your gym friends</p>
            <p className="text-muted text-sm">Search by their username or name</p>
            <p className="text-xs text-muted mt-3 bg-[#1E1E2A] rounded-lg p-3">
              💡 Share your username <span className="text-brand font-mono">@{user?.username || 'your-username'}</span> with friends so they can find you
            </p>
          </div>
        </div>
      )}

      {selectedUsername && (
        <PublicProfileModal
          username={selectedUsername}
          onClose={() => setSelectedUsername(null)}
        />
      )}
    </div>
  );
}
