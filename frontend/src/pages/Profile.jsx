import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI, workoutAPI } from '../utils/api';
import { 
  FiEdit3, FiSave, FiX, FiLock, FiEye, FiEyeOff, 
  FiCamera, FiTrash2, FiSettings, 
  FiActivity, FiGlobe, 
  FiLogOut, FiPlusSquare,
  FiSun, FiMoon, FiCheck, FiChevronRight, FiUser
} from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const EXPERIENCE = [{v:'beginner',l:'Beginner'},{v:'intermediate',l:'Intermediate'},{v:'advanced',l:'Advanced'}];

// ── Weekly Momentum ────────────────────────────────────────
const WeeklyBlocks = ({ workouts }) => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff)).setHours(0,0,0,0);
  };
  
  const monday = getMonday(new Date());
  const weekDates = [...Array(7)].map((_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d.toDateString();
  });

  const workoutDates = new Set(workouts.map(w => new Date(w.date).toDateString()));

  return (
    <div className="flex justify-between gap-2">
      {days.map((day, i) => {
        const active = workoutDates.has(weekDates[i]);
        const isToday = weekDates[i] === new Date().toDateString();
        return (
          <div key={i} className="flex flex-col items-center gap-2 flex-1">
            <div className={`w-full aspect-square rounded-lg flex items-center justify-center border transition-all duration-300 ${
              active 
                ? 'bg-brand/20 border-brand/50 text-brand' 
                : isToday ? 'border-brand/40 bg-brand/5' : 'border-[var(--surface-border)] bg-[var(--surface-elevated)]/30'
            }`}>
              {active && <FiCheck className="text-xs" />}
            </div>
            <span className={`text-[10px] font-medium tracking-tight ${active || isToday ? 'text-brand' : 'text-muted'}`}>
              {day}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ── Gym Attendance Bar Chart ──────────────────────────────
const GymBarChart = ({ workouts }) => {
  const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
  };

  const last6Weeks = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - (i * 7));
    last6Weeks.push({
      week: getWeekNumber(d),
      year: d.getFullYear(),
      label: i === 0 ? 'This Week' : `${i}w ago`,
      count: 0
    });
  }

  workouts.forEach(w => {
    const d = new Date(w.date);
    const wn = getWeekNumber(d);
    const yr = d.getFullYear();
    const weekObj = last6Weeks.find(l => l.week === wn && l.year === yr);
    if (weekObj) weekObj.count++;
  });

  const data = {
    labels: last6Weeks.map(l => l.label),
    datasets: [
      {
        label: 'Sessions',
        data: last6Weeks.map(l => l.count),
        backgroundColor: '#00D4FF',
        borderRadius: 8,
        barThickness: 20,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1A1A24',
        titleColor: '#00D4FF',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
        ticks: { color: '#8888AA', stepSize: 1, font: { size: 10 } }
      },
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#8888AA', font: { size: 10 } }
      }
    }
  };

  return (
    <div className="h-48 w-full">
      <Bar data={data} options={options} />
    </div>
  );
};

// ── Progress Journey ────────────────────────────────────────
const ProgressPhotoGrid = ({ photos, onRefresh }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const displayPhotos = photos.slice(-6).reverse(); 

  const handleDelete = async (photo, e) => {
    e.stopPropagation();
    if (!window.confirm('Remove this memory from your journey?')) return;
    try {
      // Use photo.id or index if id missing
      const photoId = photo.id || photos.indexOf(photo);
      await userAPI.deleteProgressPhoto(photoId);
      toast.success('Journey updated');
      onRefresh();
      setSelectedPhoto(null);
    } catch { toast.error('Failed to remove photo'); }
  };

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">PROGRESS JOURNEY</h3>
        <Link to="/progress/photos" className="text-[11px] font-medium text-brand hover:underline flex items-center gap-1">
          View Gallery <FiChevronRight />
        </Link>
      </div>

      {displayPhotos.length === 0 ? (
        <div className="py-12 rounded-2xl border border-dashed border-[var(--surface-border)] flex flex-col items-center justify-center text-center bg-[var(--surface-elevated)]/20">
          <FiCamera className="text-2xl text-muted/20 mb-3" />
          <p className="text-xs text-muted">No snapshots recorded yet</p>
          <Link to="/progress/photos" className="text-brand text-xs font-medium mt-2 hover:underline">Add yours</Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {displayPhotos.map((p, i) => (
            <div key={i} 
              className="aspect-[4/5] relative group cursor-pointer overflow-hidden rounded-xl bg-[var(--surface-elevated)]"
              onClick={() => setSelectedPhoto(p)}
            >
              <img src={p.imageUrl} alt="progress" className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-2 left-2 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {p.weight}kg
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPhoto && (
        <div className="fixed inset-0 bg-[#0F0F14]/90 z-[100] flex items-center justify-center p-6 backdrop-blur-sm" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-sm w-full bg-[var(--surface-card)] rounded-3xl overflow-hidden border border-[var(--surface-border)] shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={selectedPhoto.imageUrl} alt="Full" className="w-full h-auto" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                   <span className="text-lg font-semibold text-[var(--text-primary)]">{selectedPhoto.weight} KG</span>
                   <p className="text-muted text-[10px] mt-0.5">{new Date(selectedPhoto.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                </div>
                <button onClick={(e) => handleDelete(selectedPhoto, e)} className="p-2 text-muted hover:text-red-400 transition-colors"><FiTrash2 /></button>
              </div>
              {selectedPhoto.note && <p className="text-sm text-muted leading-relaxed font-light italic">"{selectedPhoto.note}"</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Profile Page ───────────────────────────────────────
export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allWorkouts, setAllWorkouts] = useState([]);
  const [photos, setPhotos] = useState([]);

  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    age: user?.age || '',
    weight: user?.weight || '',
    height: user?.height || '',
    gender: user?.gender || 'male',
    goal: user?.goal || 'maintain',
    experience: user?.experience || 'beginner',
    activityLevel: user?.activityLevel || 'moderate',
    restTimerDuration: user?.restTimerDuration || 90,
    weightUnit: user?.weightUnit || 'kg',
    heightUnit: user?.heightUnit || 'cm'
  });
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'', confirm:'' });

  const loadData = () => {
    Promise.all([
      workoutAPI.getAll({ limit: 100 }),
      userAPI.getProgressPhotos()
    ]).then(([wRes, pRes]) => {
      setAllWorkouts(wRes.data.workouts?.filter(w => w.isCompleted) || []);
      setPhotos(pRes.data.progressPhotos || []);
    }).catch(err => console.error(err));
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile({
        ...form,
        username: form.username.toLowerCase(),
        age: Number(form.age),
        weight: Number(form.weight),
        height: Number(form.height)
      });
      updateUser(data.user);
      setEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setSaving(false);
  };

  const handlePwChange = async () => {
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Mismatch');
    try {
      await userAPI.updatePassword(pwForm);
      toast.success('Security updated');
      setPwOpen(false);
    } catch (err) { toast.error('Failed'); }
  };

  const handlePrivacyToggle = async () => {
    try {
      const { data } = await userAPI.togglePrivacy();
      updateUser({ isPublic: data.isPublic });
      toast.success(data.isPublic ? 'Public' : 'Private');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="page-container max-w-xl pb-24">
      {/* Professional Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full bg-[var(--surface-elevated)] border flex items-center justify-center text-2xl font-light tracking-tighter text-brand transition-all duration-500 ${
            user?.isPublic ? 'border-green-500 ring-4 ring-green-500/20' : 'border-[var(--surface-border)]'
          }`}>
            {user?.name?.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
               <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] leading-none">{user?.name}</h1>
               {user?.isPublic && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Public Profile" />}
            </div>
            <p className="text-xs text-muted mt-1.5 font-medium tracking-wide uppercase">@{user?.username || 'user'}</p>
          </div>
        </div>
        
        <div className="relative">
          <button onClick={() => setSettingsOpen(!settingsOpen)} className="p-2.5 text-muted hover:text-[var(--text-primary)] transition-colors">
            <FiSettings className="text-xl" />
          </button>
          
          {settingsOpen && (
            <div className="absolute top-full right-0 mt-2 w-52 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
              <button onClick={() => { setEditing(true); setSettingsOpen(false); }} className="w-full px-4 py-2.5 text-xs font-medium text-left hover:bg-[var(--surface-elevated)] flex items-center gap-3">
                <FiEdit3 className="text-brand" /> Edit Profile
              </button>
              <button onClick={() => { setPwOpen(true); setSettingsOpen(false); }} className="w-full px-4 py-2.5 text-xs font-medium text-left hover:bg-[var(--surface-elevated)] flex items-center gap-3">
                <FiLock className="text-brand" /> Security
              </button>
              <button onClick={() => { handlePrivacyToggle(); setSettingsOpen(false); }} className="w-full px-4 py-2.5 text-xs font-medium text-left hover:bg-[var(--surface-elevated)] flex items-center gap-3">
                <FiEye className="text-brand" /> {user?.isPublic ? 'Make Private' : 'Make Public'}
              </button>
              <button onClick={logout} className="w-full px-4 py-2.5 text-xs font-medium text-left text-red-400 hover:bg-red-400/10 flex items-center gap-3 mt-1 border-t border-[var(--surface-border)] pt-3">
                <FiLogOut /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Overview Grid */}
      <div className="grid grid-cols-2 gap-4 mb-12">
        {[
          { label: 'Current Weight', value: `${user?.weight || 0}${user?.weightUnit || 'kg'}`, sub: 'Active tracking' },
          { label: 'Training Streak', value: `${user?.currentStreak || 0} Days`, sub: 'Current momentum' },
          { label: 'Muscle Mastery', value: user?.experience || 'Beginner', sub: 'Calculated level' },
          { label: 'Body Goal', value: user?.goal || 'Maintain', sub: 'Primary focus' },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-card)] hover:bg-brand/5 hover:border-brand/30 hover:shadow-glow-sm transition-all duration-300 group cursor-default">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-1 group-hover:text-brand transition-colors">{s.label}</p>
            <p className="text-lg font-medium text-[var(--text-primary)] tracking-tight">{s.value}</p>
            <p className="text-[10px] text-muted/60 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Bio Section */}
      {user?.bio && (
        <div className="mb-12 px-1">
          <p className="text-sm text-muted leading-relaxed font-light italic">"{user.bio}"</p>
        </div>
      )}

      {/* Momentum Tracker */}
      <div className="mb-12">
        <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)] mb-6 px-1 uppercase">Training Momentum</h3>
        <div className="p-6 rounded-3xl bg-[var(--surface-elevated)]/20 border border-[var(--surface-border)]">
          <WeeklyBlocks workouts={allWorkouts} />
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mb-12">
        <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)] mb-6 px-1 uppercase">Weekly Attendance</h3>
        <div className="p-8 rounded-3xl bg-[var(--surface-elevated)]/20 border border-[var(--surface-border)]">
          <GymBarChart workouts={allWorkouts} />
        </div>
      </div>

      {/* Photo Journey */}
      <ProgressPhotoGrid photos={photos} onRefresh={loadData} />

      {/* Edit Modal (Instead of inline for cleaner look) */}
      {editing && (
        <div className="fixed inset-0 bg-[#0F0F14]/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] p-8 rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-semibold mb-6 tracking-tight">Modify Profile</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[11px] font-medium text-muted uppercase mb-1.5 block">Name</label>
                  <input className="input-field text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="col-span-1">
                  <label className="text-[11px] font-medium text-muted uppercase mb-1.5 block">Age</label>
                  <input type="number" className="input-field text-sm" value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
                </div>
                <div className="col-span-1">
                  <label className="text-[11px] font-medium text-muted uppercase mb-1.5 block">Weight</label>
                  <input type="number" className="input-field text-sm" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-medium text-muted uppercase mb-1.5 block">Bio</label>
                  <textarea className="input-field text-sm h-24 pt-3 resize-none" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setEditing(false)} className="flex-1 py-3 text-sm font-medium border border-[var(--surface-border)] rounded-xl hover:bg-[var(--surface-elevated)] transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 text-sm font-medium bg-brand text-[#0F0F14] rounded-xl hover:opacity-90 transition-opacity">Save changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {pwOpen && (
        <div className="fixed inset-0 bg-[#0F0F14]/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] p-8 rounded-[2rem] w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-semibold mb-6 tracking-tight">Update Security</h3>
            <div className="space-y-4">
              <input type="password" placeholder="Current password"
                className="input-field text-sm" value={pwForm.currentPassword}
                onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
              <input type="password" placeholder="New password"
                className="input-field text-sm" value={pwForm.newPassword}
                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
              <input type="password" placeholder="Confirm password"
                className="input-field text-sm" value={pwForm.confirm}
                onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} />
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setPwOpen(false)} className="flex-1 py-3 text-sm font-medium border border-[var(--surface-border)] rounded-xl">Cancel</button>
              <button onClick={handlePwChange} className="flex-1 py-3 text-sm font-medium bg-brand text-[#0F0F14] rounded-xl">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
