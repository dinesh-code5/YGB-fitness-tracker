import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI, workoutAPI } from '../utils/api';
import { ARCHETYPES } from '../utils/archetypes';
import {
  FiEdit3, FiZap, FiTarget, FiAward, FiSave, FiX, FiLock, FiEye, FiEyeOff,
  FiCamera, FiTrash2, FiSettings, FiActivity, FiGlobe, FiTrendingUp,
  FiLogOut, FiPlusSquare, FiCheck, FiChevronRight, FiUser, FiStar,
  FiShield, FiDroplet, FiWind, FiBarChart2, FiCalendar, FiImage,
  FiHeart, FiClock, FiBell
} from 'react-icons/fi';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// YGB (Your Gym Brand) name generator
const YGB_PREFIXES = ['Alpha', 'Iron', 'Steel', 'Apex', 'Elite', 'Titan', 'Prime', 'Phantom', 'Viper', 'Ghost', 'Forge', 'Rogue', 'Blaze', 'Storm', 'Cipher'];
const YGB_SUFFIXES = ['X', 'Zero', 'Nova', 'Rex', 'Volt', 'Core', 'Flux', 'Edge', 'Axis', 'Pulse', 'Wave', 'Force', 'Drive', 'Shift', 'Lock'];

const generateYGBName = (username = '') => {
  const seed = username.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return `${YGB_PREFIXES[seed % YGB_PREFIXES.length]}${YGB_SUFFIXES[(seed * 3) % YGB_SUFFIXES.length]}`;
};

// ── Weekly Momentum Blocks ───────────────────────────────────────────────
const WeeklyBlocks = ({ workouts }) => {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff)).setHours(0, 0, 0, 0);
  };
  const monday = getMonday(new Date());
  const weekDates = [...Array(7)].map((_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d.toDateString();
  });
  const workoutDates = new Set(workouts.map(w => new Date(w.date).toDateString()));

  return (
    <div className="flex gap-2">
      {days.map((day, i) => {
        const active = workoutDates.has(weekDates[i]);
        const isToday = weekDates[i] === new Date().toDateString();
        return (
          <div key={i} className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <div className={`w-full aspect-square rounded-lg flex items-center justify-center border text-[10px] font-black transition-all duration-300 ${
              active
                ? 'bg-brand/20 border-brand text-brand shadow-glow-sm'
                : isToday
                  ? 'border-brand/50 bg-brand/5 text-brand/50'
                  : 'border-white/5 bg-white/[0.02] text-white/10'
            }`}>
              {active && <FiCheck />}
            </div>
            <span className={`text-[8px] font-bold tracking-widest ${active || isToday ? 'text-brand' : 'text-white/20'}`}>{day}</span>
          </div>
        );
      })}
    </div>
  );
};

// ── Gym Attendance Chart ─────────────────────────────────────────────────
const GymBarChart = ({ workouts, accentColor }) => {
  const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };
  const last8Weeks = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    last8Weeks.push({ week: getWeekNumber(d), year: d.getFullYear(), label: i === 0 ? 'Now' : `W-${i}`, count: 0 });
  }
  workouts.forEach(w => {
    const d = new Date(w.date);
    const wn = getWeekNumber(d);
    const yr = d.getFullYear();
    const obj = last8Weeks.find(l => l.week === wn && l.year === yr);
    if (obj) obj.count++;
  });

  const themeColor = accentColor || getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim() || '#F59E0B';

  return (
    <div className="h-44 w-full">
      <Bar
        data={{
          labels: last8Weeks.map(l => l.label),
          datasets: [{ label: 'Sessions', data: last8Weeks.map(l => l.count), backgroundColor: themeColor + '33', borderColor: themeColor, borderWidth: 1.5, borderRadius: 6, barThickness: 18 }],
        }}
        options={{
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0F0F14', titleColor: themeColor, bodyColor: '#fff', padding: 10, cornerRadius: 10, displayColors: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#555577', stepSize: 1, font: { size: 9 } }, border: { display: false } },
            x: { grid: { display: false }, ticks: { color: '#555577', font: { size: 9 } }, border: { display: false } },
          },
        }}
      />
    </div>
  );
};

// ── GitHub-Style Activity Heatmap ────────────────────────────────────────
const ActivityHeatmap = ({ workouts, accentColor }) => {
  const workoutDates = new Set(workouts.map(w => new Date(w.date).toDateString()));
  const days = [...Array(56)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (55 - i));
    return {
      date: d.toDateString(),
      active: workoutDates.has(d.toDateString()),
      isToday: d.toDateString() === new Date().toDateString(),
    };
  });

  const themeColor = accentColor || getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim() || '#F59E0B';

  return (
    <div className="w-full">
      <div className="grid gap-[3px]" style={{ gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' }}>
        {days.map((day, i) => (
          <div key={i} title={day.date}
            className={`aspect-square rounded-[3px] transition-all duration-300 ${
              day.active
                ? 'opacity-100'
                : day.isToday
                  ? 'border border-white/20 bg-white/5'
                  : 'bg-white/[0.04] hover:bg-white/10'
            }`}
            style={day.active ? { backgroundColor: themeColor, boxShadow: `0 0 6px ${themeColor}40` } : {}}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2 px-0.5">
        <span className="text-lg font-bold text-white/20 uppercase tracking-widest">8 wks ago</span>
        <span className="text-lg font-bold uppercase tracking-widest" style={{ color: themeColor }}>Today</span>
      </div>
    </div>
  );
};

// ── XP Bar ───────────────────────────────────────────────────────────────
const XPBar = ({ xp = 750, nextLevel = 1000, level = 12, accentColor }) => {
  const themeColor = accentColor || getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim() || '#F59E0B';
  const progress = Math.min((xp / nextLevel) * 100, 100);
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black uppercase tracking-widest" style={{ color: themeColor }}>Level {level}</span>
          <span className="text-lg text-white/30 font-bold">ELITE LIFTER</span>
        </div>
        <span className="text-lg font-bold text-white/30">{xp} / {nextLevel} XP</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, backgroundColor: themeColor, boxShadow: `0 0 8px ${themeColor}60` }} />
      </div>
    </div>
  );
};

// ── Archetype Selector Card ──────────────────────────────────────────────
const ArchetypeCard = ({ archetype, selected, onSelect, compact = false }) => {
  const isSelected = selected === archetype.id;
  return (
    <button
      onClick={() => onSelect(archetype.id)}
      className={`relative overflow-hidden rounded-2xl border text-left transition-all duration-500 group ${
        isSelected
          ? `${archetype.borderColor} shadow-lg`
          : 'border-white/5 hover:border-white/15'
      } ${compact ? 'p-4' : 'p-5'}`}
      style={isSelected ? { boxShadow: `0 0 24px ${archetype.color}20` } : {}}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${archetype.bgGradient} transition-opacity duration-500 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <span className="text-3xl font-black" style={{ color: isSelected ? archetype.color : 'rgba(255,255,255,0.15)' }}>
            {archetype.glyph}
          </span>
          {isSelected && (
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[#0A0A0F] text-xl" style={{ backgroundColor: archetype.color }}>
              <FiCheck />
            </div>
          )}
        </div>
        <p className="text-xl font-black uppercase tracking-widest mb-0.5" style={{ color: isSelected ? archetype.color : 'rgba(255,255,255,0.4)' }}>
          {archetype.label}
        </p>
        <p className="text-lg font-bold text-white/60 mb-2">{archetype.subtitle}</p>
        {!compact && <p className="text-lg text-white/30 leading-relaxed mb-4">{archetype.description}</p>}
        <div className="flex flex-wrap gap-1.5">
          {archetype.traits.map(t => (
            <span key={t} className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border transition-all ${isSelected ? archetype.tagColor : 'border-white/5 text-white/20 bg-white/[0.02]'}`}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
};

// ── Progress Photos ──────────────────────────────────────────────────────
const ProgressPhotoGrid = ({ photos, onRefresh }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const displayPhotos = photos.slice(-9).reverse();

  const handleDelete = async (photo, e) => {
    e.stopPropagation();
    if (!window.confirm('Remove this from your journey?')) return;
    try {
      await userAPI.deleteProgressPhoto(photo.id || photos.indexOf(photo));
      toast.success('Removed');
      onRefresh();
      setSelectedPhoto(null);
    } catch { toast.error('Failed'); }
  };

  if (displayPhotos.length === 0) {
    return (
      <div className="py-16 rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center gap-3">
        <FiCamera className="text-2xl text-white/10" />
        <p className="text-lg text-white/20 font-bold uppercase tracking-widest">No snapshots yet</p>
        <Link to="/progress/photos" className="text-lg font-black text-brand hover:underline uppercase tracking-widest">
          Add First Photo
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">
        {displayPhotos.map((p, i) => (
          <div key={i} onClick={() => setSelectedPhoto(p)}
            className="aspect-[3/4] relative group cursor-pointer overflow-hidden rounded-xl bg-white/[0.03]">
            <img src={p.imageUrl} alt="progress" className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-all">
              <span className="text-[10px] font-black text-white">{p.weight}kg</span>
            </div>
            {i === 0 && (
              <div className="absolute top-2 right-2">
                <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-brand/80 text-[#0A0A0F]">Latest</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 bg-[#0A0A0F]/95 z-[200] flex items-center justify-center p-6 backdrop-blur-xl" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-sm w-full bg-[#12121A] rounded-3xl overflow-hidden border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={selectedPhoto.imageUrl} alt="Full" className="w-full h-auto max-h-[60vh] object-cover" />
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xl font-black text-white">{selectedPhoto.weight} KG</p>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">
                  {new Date(selectedPhoto.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                {selectedPhoto.note && <p className="text-lg text-white/40 mt-2 italic">"{selectedPhoto.note}"</p>}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={(e) => handleDelete(selectedPhoto, e)} className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                  <FiTrash2 />
                </button>
                <button onClick={() => setSelectedPhoto(null)} className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 transition-colors">
                  <FiX />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── Achievement Badge ────────────────────────────────────────────────────
const Badge = ({ icon: Icon, label, date, unlocked = true, accentColor = '#00D4FF' }) => (
  <div className={`flex flex-col items-center p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden
    ${unlocked ? 'border-white/10 hover:border-white/20 bg-white/[0.02]' : 'border-white/[0.03] bg-transparent grayscale opacity-40'}`}
    style={unlocked ? { boxShadow: 'none' } : {}}>
    {unlocked && (
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{ background: `radial-gradient(circle at center, ${accentColor}08 0%, transparent 70%)` }} />
    )}
    <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
      style={unlocked ? { backgroundColor: accentColor + '15', color: accentColor } : { backgroundColor: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.15)' }}>
      <Icon className="text-xl" />
    </div>
    <span className="text-xs font-black uppercase tracking-tighter text-center leading-tight text-white/60 relative">{label}</span>
    {unlocked && date && <span className="text-[10px] text-white/20 mt-1 font-bold tracking-widest uppercase relative">{date}</span>}
    {!unlocked && <div className="absolute inset-0 rounded-2xl border border-dashed border-white/5" />}
  </div>
);

// ── Stat Ring ────────────────────────────────────────────────────────────
const StatRing = ({ value, label, unit = '', max = 100, color = '#00D4FF', size = 80 }) => {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const dash = pct * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 4px ${color}60)` }} />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          className="rotate-90 origin-center" fill="white"
          style={{ fontSize: size * 0.22, fontWeight: 900, transform: `rotate(90deg) translate(0, 0)` }}>
        </text>
      </svg>
      <div className="text-center">
        <p className="text-base font-black text-white leading-none">{value}<span className="text-[10px] text-white/30 font-bold ml-0.5">{unit}</span></p>
        <p className="text-lg text-white/30 font-bold uppercase tracking-widest mt-0.5">{label}</p>
      </div>
    </div>
  );
};

// ── Body Metrics Panel ───────────────────────────────────────────────────
const BodyMetrics = ({ user, accentColor }) => {
  const bmi = user?.weight && user?.height
    ? (user.weight / Math.pow(user.height / 100, 2)).toFixed(1)
    : null;
  const bmiCategory = bmi
    ? bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy' : bmi < 30 ? 'Overweight' : 'Obese'
    : null;

  return (
    <div className="grid grid-cols-3 gap-4">
      {[
        { label: 'Weight', value: user?.weight || '--', unit: 'kg', max: 150, color: accentColor },
        { label: 'Height', value: user?.height || '--', unit: 'cm', max: 220, color: '#A78BFA' },
        { label: 'BMI', value: bmi || '--', unit: '', max: 40, color: '#F59E0B' },
      ].map(m => (
        <div key={m.label} className="flex flex-col items-center gap-1 py-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <p className="text-2xl font-black text-white">{m.value}<span className="text-xs text-white/30 font-bold ml-1">{m.unit}</span></p>
          <p className="text-lg text-white/30 font-bold uppercase tracking-widest">{m.label}</p>
          {m.label === 'BMI' && bmiCategory && (
            <span className="text-[8px] font-black uppercase tracking-widest mt-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {bmiCategory}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

// ── Main Profile Page ─────────────────────────────────────────────────────
export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { setThemeColor } = useTheme();
  
  const [editing, setEditing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allWorkouts, setAllWorkouts] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [archetype, setArchetype] = useState(user?.archetype || 'fit');
  const [activeTab, setActiveTab] = useState('overview');

  const ygbName = generateYGBName(user?.username);
  const currentArchetype = ARCHETYPES.find(a => a.id === archetype) || ARCHETYPES[1];
  const accentColor = currentArchetype.color;

  const [form, setForm] = useState({
    name: user?.name || '', username: user?.username || '', bio: user?.bio || '',
    age: user?.age || '', weight: user?.weight || '', height: user?.height || '',
    gender: user?.gender || 'male', goal: user?.goal || 'maintain',
    experience: user?.experience || 'beginner', activityLevel: user?.activityLevel || 'moderate',
    restTimerDuration: user?.restTimerDuration || 90, weightUnit: user?.weightUnit || 'kg',
    heightUnit: user?.heightUnit || 'cm', archetype: user?.archetype || 'fit',
  });

  // Sync archetype and form when user data loads/changes
  useEffect(() => {
    if (user) {
      setArchetype(user.archetype || 'fit');
      setForm(prev => ({
        ...prev,
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        age: user.age || '',
        weight: user.weight || '',
        height: user.height || '',
        gender: user.gender || 'male',
        goal: user.goal || 'maintain',
        experience: user.experience || 'beginner',
        activityLevel: user.activityLevel || 'moderate',
        restTimerDuration: user.restTimerDuration || 90,
        weightUnit: user.weightUnit || 'kg',
        heightUnit: user.heightUnit || 'cm',
        archetype: user.archetype || 'fit'
      }));
    }
  }, [user]);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    Promise.all([workoutAPI.getAll({ limit: 200 }), userAPI.getProgressPhotos()])
      .then(([wRes, pRes]) => {
        setAllWorkouts(wRes.data.workouts?.filter(w => w.isCompleted) || []);
        setPhotos(pRes.data.progressPhotos || []);
      })
      .catch(err => console.error(err));
  }, []);

  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff)).setHours(0, 0, 0, 0);
  };
  const monday = getMonday(new Date());

  const thisWeekWorkoutDates = new Set(
    allWorkouts
      .filter(w => new Date(w.date).getTime() >= monday)
      .map(w => new Date(w.date).toDateString())
  );
  const thisWeekSessions = thisWeekWorkoutDates.size;
  const thisMonthSessions = allWorkouts.filter(w => new Date(w.date) > new Date(Date.now() - 30 * 86400000)).length;
  const totalSessions = allWorkouts.length;

  const handleSave = async (overridePayload = null) => {
    setSaving(true);
    try {
      const payload = overridePayload || { ...form, username: form.username.toLowerCase(), archetype };
      const { data } = await userAPI.updateProfile(payload);
      updateUser(data.user);
      
      // Update global theme if archetype changed
      const newArch = ARCHETYPES.find(a => a.id === data.user.archetype);
      if (newArch) {
        setThemeColor(newArch.color);
      }
      
      setEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      console.error('Update failed:', err);
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setSaving(false);
  };

  const handlePwChange = async () => {
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    try {
      await userAPI.updatePassword(pwForm);
      toast.success('Password updated');
      setPwOpen(false);
    } catch { toast.error('Failed'); }
  };

  const handleArchetypeChange = (id) => {
    setArchetype(id);
  };

  const handleTogglePrivacy = async () => {
    try {
      const { data } = await userAPI.togglePrivacy();
      updateUser({ ...user, isPublic: data.isPublic });
      toast.success(`Profile is now ${data.isPublic ? 'Public' : 'Private'}`);
    } catch { toast.error('Failed to update privacy'); }
  };

  const handleUpdateNotifications = async (notifications) => {
    try {
      const { data } = await userAPI.updateProfile({ notifications });
      updateUser(data.user);
      toast.success('Preferences updated');
    } catch { toast.error('Failed to update preferences'); }
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: FiUser },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
    { id: 'journey', label: 'Journey', icon: FiImage },
    { id: 'achievements', label: 'Achievements', icon: FiAward },
  ];

  return (
    <div className="min-h-screen bg-[#09090E] text-white pb-24">

      {/* Ambient Atmosphere */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[300px] rounded-full opacity-10 blur-[120px] transition-colors duration-1000"
          style={{ backgroundColor: accentColor }} />
      </div>

      <div className="relative overflow-hidden border-b border-white/5">
        <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-12 pt-10 pb-0">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border ${currentArchetype.tagColor} flex items-center gap-2`}>
                <span>{currentArchetype.glyph}</span>
                {currentArchetype.label}
              </span>
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest hidden sm:block">
                YGB: <span className="text-white/40">{ygbName}</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 text-xs font-bold uppercase tracking-widest transition-all">
                <FiEdit3 className="text-lg" /> Edit
              </button>
              <div className="relative">
                <button onClick={() => setSettingsOpen(!settingsOpen)} className="p-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all">
                  <FiSettings />
                </button>
                {settingsOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-[#14141E] border border-white/10 rounded-2xl shadow-2xl z-50 py-1.5 overflow-hidden">
                    {[
                      { icon: FiLock, label: 'Security', action: () => { setPwOpen(true); setSettingsOpen(false); } },
                      { icon: FiGlobe, label: 'Privacy Settings', action: () => { setPrivacyOpen(true); setSettingsOpen(false); } },
                    ].map((item, i) => (
                      <button key={i} onClick={item.action} className="w-full px-4 py-3 text-xs font-black uppercase tracking-widest text-left hover:bg-white/5 text-white/40 hover:text-white flex items-center gap-3 transition-colors">
                        <item.icon /> {item.label}
                      </button>
                    ))}
                    <div className="border-t border-white/5 my-1" />
                    <button onClick={logout} className="w-full px-4 py-3 text-xs font-black uppercase tracking-widest text-left text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors">
                      <FiLogOut /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 pb-0">
            <div className="flex items-end gap-8">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-full blur-2xl opacity-40 transition-colors duration-700"
                  style={{ backgroundColor: accentColor }} />
                <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-full p-[2px] transition-all duration-700"
                  style={{ background: `linear-gradient(135deg, ${accentColor}, transparent 60%)` }}>
                  <div className="w-full h-full rounded-full bg-[#0D0D14] flex items-center justify-center overflow-hidden">
                    <span className="font-black transition-all duration-500" style={{ fontSize: '3.5rem', color: accentColor + '40' }}>
                      {currentArchetype.glyph}
                    </span>
                    <span className="absolute text-5xl font-black" style={{ color: accentColor }}>
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                </div>
                {user?.currentStreak > 0 && (
                  <div className="absolute -bottom-1 -right-1 px-2 py-1 rounded-lg text-[9px] font-black text-[#0A0A0F] uppercase tracking-wider"
                    style={{ backgroundColor: accentColor }}>
                    🔥 {user.currentStreak}d
                  </div>
                )}
              </div>

              <div className="pb-2">
                <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white leading-none mb-1">
                  {user?.name || 'Athlete'}
                </h1>
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="text-lg font-bold text-white/30">@{user?.username || 'username'}</span>
                  <span className="text-white/10">·</span>
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color: accentColor }}>
                    {ygbName}
                  </span>
                  <span className="text-white/10">·</span>
                  <span className="text-[10px] font-bold text-white/20 uppercase">Level 10</span>
                </div>
                {user?.bio && (
                  <p className="text-lg text-white/30 font-light max-w-sm leading-relaxed italic">
                    "{user.bio}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-end gap-0 pb-2">
              {[
                { label: 'Total Sessions', value: totalSessions, color: accentColor },
                { label: 'This Month', value: thisMonthSessions, color: '#A78BFA' },
                { label: 'Best Streak', value: `${user?.longestStreak || 0}d`, color: '#F59E0B' },
                { label: 'This Week', value: thisWeekSessions, color: '#10B981' },
              ].map((s, i) => (
                <div key={i} className={`flex flex-col items-center gap-1 px-6 ${i !== 0 ? 'border-l border-white/5' : ''}`}>
                  <span className="text-3xl font-black" style={{ color: s.color }}>{s.value}</span>
                  <span className="text-lg font-bold text-white/20 uppercase tracking-widest text-center leading-tight">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-md mt-8 mb-6">
            <XPBar accentColor={accentColor} />
          </div>

          <div className="flex items-center gap-0 border-b border-white/0 -mb-px mt-2">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-[11px] font-black uppercase tracking-[0.15em] border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-current text-white'
                    : 'border-transparent text-white/25 hover:text-white/50'
                }`}
                style={activeTab === tab.id ? { color: accentColor, borderColor: accentColor } : {}}>
                <tab.icon className="text-lg" />
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white/40">Body Archetype</h2>
                    <p className="text-xl text-white/20 mt-0.5">What physique are you building?</p>
                  </div>
                  <button onClick={() => handleSave({ ...form, archetype })} disabled={saving}
                    className="text-l font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10 text-white/30 hover:text-white hover:border-white/20 transition-all">
                    {saving ? 'Saving...' : 'Save Archetype'}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {ARCHETYPES.map(a => (
                    <ArchetypeCard key={a.id} archetype={a} selected={archetype} onSelect={handleArchetypeChange} />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-black uppercase tracking-[0.2em] text-white/40">This Week</h2>
                  <span className="text-lg font-black px-2 py-1 rounded-lg" style={{ color: accentColor, backgroundColor: accentColor + '15' }}>
                    {thisWeekSessions}/7 days
                  </span>
                </div>
                <WeeklyBlocks workouts={allWorkouts} />
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6">
                <h2 className="text-lg font-black uppercase tracking-[0.2em] text-white/40 mb-5">Body Metrics</h2>
                <BodyMetrics user={user} accentColor={accentColor} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border p-6 relative overflow-hidden" style={{ borderColor: accentColor + '30', backgroundColor: accentColor + '06' }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-10" style={{ backgroundColor: accentColor }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <FiTarget style={{ color: accentColor }} />
                    <h2 className="text-lxl font-black uppercase tracking-[0.2em] text-white/40">Primary Goal</h2>
                  </div>
                  <p className="text-2xl font-black text-white mb-1 capitalize">{(user?.goal || 'Build Muscle').replace(/_/g, ' ')}</p>
                  <p className="text-lg text-white/30 font-bold uppercase tracking-widest mb-4">{user?.experience || 'Intermediate'} · {user?.activityLevel || 'Moderate'}</p>
                  <div className="mb-2 flex justify-between">
                    <span className="text-xl text-white/20 font-bold uppercase tracking-widest">Progress</span>
                    <span className="text-lg font-black" style={{ color: accentColor }}>72%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: '72%', backgroundColor: accentColor }} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 space-y-4">
                <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white/40">Profile</h2>
                {[
                  { label: 'Age', value: user?.age ? `${user.age} years` : '—' },
                  { label: 'Gender', value: user?.gender || '—', capitalize: true },
                  { label: 'Experience', value: user?.experience || '—', capitalize: true },
                  { label: 'Activity Level', value: (user?.activityLevel || '—').replace(/_/g, ' '), capitalize: true },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                    <span className="text-xs font-bold text-white/25 uppercase tracking-widest">{item.label}</span>
                    <span className="text-lg font-black text-white/60 capitalize">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white/40">Badges</h2>
                  <button onClick={() => setActiveTab('achievements')} className="text-lg font-black uppercase tracking-widest flex items-center gap-1" style={{ color: accentColor }}>
                    All <FiChevronRight />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Badge icon={FiZap} label="Fast Starter" date="MAY 26" accentColor={accentColor} />
                  <Badge icon={FiHeart} label="7-Day Streak" unlocked={false} accentColor={accentColor} />
                  <Badge icon={FiStar} label="First PR" date="APR 12" accentColor={accentColor} />
                  <Badge icon={FiShield} label="Consistency" unlocked={false} accentColor={accentColor} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white/40">Gym Attendance</h2>
                  <p className="text-xl text-white/20 mt-0.5">Sessions per week over the last 8 weeks</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                  <FiTrendingUp className="text-green-400 text-xs" />
                  <span className="text-xl font-black text-green-400">+20% this month</span>
                </div>
              </div>
              <GymBarChart workouts={allWorkouts} accentColor={accentColor} />
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6">
              <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white/40 mb-5">Streak Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Current Streak', value: user?.currentStreak || 0, unit: 'days', color: '#F59E0B' },
                  { label: 'Best Streak', value: user?.longestStreak || 0, unit: 'days', color: accentColor },
                  { label: 'Total Sessions', value: totalSessions, unit: '', color: '#A78BFA' },
                  { label: 'This Month', value: thisMonthSessions, unit: '', color: '#10B981' },
                ].map(s => (
                  <div key={s.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}<span className="text-xs text-white/20 ml-1 font-bold">{s.unit}</span></p>
                    <p className="text-lg text-white/25 font-bold uppercase tracking-widest mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6">
              <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white/40 mb-5">This Week</h2>
              <WeeklyBlocks workouts={allWorkouts} />
              <div className="mt-6">
                <ActivityHeatmap workouts={allWorkouts} accentColor={accentColor} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'journey' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white/40">Progress Journey</h2>
                  <p className="text-lg text-white/20 mt-0.5">Your transformation, documented</p>
                </div>
                <Link to="/progress/photos" className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-lg font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-white/20 transition-all">
                  <FiCamera className="text-l" /> Add Photo
                </Link>
              </div>
              <ProgressPhotoGrid photos={photos} onRefresh={() => {}} />
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6">
                <h2 className="text-lg font-black uppercase tracking-[0.2em] text-white/40 mb-4">Journey Stats</h2>
                {[
                  { label: 'Photos Logged', value: photos.length },
                  { label: 'Days Active', value: new Set(allWorkouts.map(w => new Date(w.date).toDateString())).size },
                  { label: 'Current Weight', value: user?.weight ? `${user.weight}kg` : '—' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                    <span className="text-lg font-bold text-white/25 uppercase tracking-widest">{s.label}</span>
                    <span className="text-lg font-black text-white/60">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
              {[
                { icon: FiZap, label: 'Fast Starter', date: 'MAY 26', unlocked: true },
                { icon: FiHeart, label: '7-Day Streak', unlocked: false },
                { icon: FiStar, label: 'First PR', date: 'APR 12', unlocked: true },
                { icon: FiShield, label: '30-Day Club', unlocked: false },
                { icon: FiHeart, label: '100 Sessions', unlocked: false },
                { icon: FiAward, label: 'Elite Status', unlocked: false },
                { icon: FiActivity, label: 'Cardio King', unlocked: false },
                { icon: FiTarget, label: 'Goal Crusher', date: 'MAR 05', unlocked: true },
                { icon: FiClock, label: 'Early Bird', unlocked: false },
                { icon: FiTrendingUp, label: 'Momentum', date: 'MAY 01', unlocked: true },
              ].map((b, i) => (
                <Badge key={i} {...b} accentColor={accentColor} />
              ))}
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6">
              <h2 className="text-lg font-black uppercase tracking-[0.2em] text-white/40 mb-5">Rank Progress</h2>
              <div className="space-y-3">
                {[
                  { rank: 'Bronze', req: 10, current: totalSessions, color: '#92400E' },
                  { rank: 'Silver', req: 30, current: totalSessions, color: '#6B7280' },
                  { rank: 'Gold', req: 75, current: totalSessions, color: '#F59E0B' },
                  { rank: 'Diamond', req: 150, current: totalSessions, color: accentColor },
                  { rank: 'Legend', req: 365, current: totalSessions, color: '#A78BFA' },
                ].map(tier => {
                  const pct = Math.min((tier.current / tier.req) * 100, 100);
                  const done = tier.current >= tier.req;
                  return (
                    <div key={tier.rank} className={`flex items-center gap-4 p-4 rounded-xl ${done ? 'bg-white/[0.03]' : ''}`}>
                      <span className="text-m font-black uppercase tracking-widest w-20" style={{ color: done ? tier.color : 'rgba(255,255,255,0.2)' }}>{tier.rank}</span>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: done ? tier.color : tier.color + '60' }} />
                      </div>
                      <span className="text-[13px] font-bold text-white/20 w-20 text-right">{Math.min(tier.current, tier.req)}/{tier.req}</span>
                      {done && <FiCheck className="text-sm flex-shrink-0" style={{ color: tier.color }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-[#09090E]/95 z-[100] flex items-center justify-center p-4 backdrop-blur-xl overflow-y-auto">
          <div className="bg-[#11111A] border border-white/10 p-8 rounded-3xl w-full max-w-2xl shadow-2xl my-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white">Edit Profile</h3>
                <p className="text-lg text-white/30 mt-1">Update your athlete configuration</p>
              </div>
              <button onClick={() => setEditing(false)} className="p-2.5 rounded-xl border border-white/10 text-white/30 hover:text-white hover:border-white/20 transition-all">
                <FiX />
              </button>
            </div>

            <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-1">
              <div>
                <label className="text-lg font-black uppercase tracking-widest text-white/30 mb-3 block">Body Archetype</label>
                <div className="grid grid-cols-3 gap-3">
                  {ARCHETYPES.map(a => (
                    <ArchetypeCard key={a.id} archetype={a} selected={archetype} onSelect={(id) => { handleArchetypeChange(id); }} compact />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-lg font-black uppercase tracking-widest text-white/30 mb-2 block">Name</label>
                  <input className="input-field text-lg font-bold" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                </div>
                <div>
                  <label className="text-lg font-black uppercase tracking-widest text-white/30 mb-2 block">Username</label>
                  <input className="input-field text-lg font-bold" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="@handle" />
                </div>
                <div>
                  <label className="text-lg font-black uppercase tracking-widest text-white/30 mb-2 block">Age</label>
                  <input type="number" className="input-field text-lg font-bold" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
                </div>
                <div>
                  <label className="text-lg font-black uppercase tracking-widest text-white/30 mb-2 block">Weight (kg)</label>
                  <input type="number" className="input-field text-lg font-bold" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
                </div>
                <div>
                  <label className="text-lg font-black uppercase tracking-widest text-white/30 mb-2 block">Height (cm)</label>
                  <input type="number" className="input-field text-lg font-bold" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="text-lg font-black uppercase tracking-widest text-white/30 mb-2 block">Bio</label>
                  <textarea className="input-field text-lg h-20 pt-3 resize-none" placeholder="Your motto..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
                </div>
                <div>
                  <label className="text-lg font-black uppercase tracking-widest text-white/30 mb-2 block">Goal</label>
                  <select className="input-field text-lg font-bold" value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}>
                    {['lose_fat', 'maintain', 'build_muscle', 'improve_endurance', 'get_stronger'].map(g => (
                      <option key={g} value={g}>{g.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-lg font-black uppercase tracking-widest text-white/30 mb-2 block">Experience</label>
                  <select className="input-field text-lg font-bold" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })}>
                    {['beginner', 'intermediate', 'advanced'].map(e => (
                      <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(false)} className="flex-1 py-3.5 rounded-2xl border border-white/10 text-lg font-black uppercase tracking-widest text-white/30 hover:text-white hover:border-white/20 transition-all">
                Cancel
              </button>
              <button onClick={() => handleSave()} disabled={saving}
                className="flex-1 py-3.5 rounded-2xl text-lg font-black uppercase tracking-widest text-[#09090E] transition-all"
                style={{ backgroundColor: accentColor }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {pwOpen && (
        <div className="fixed inset-0 bg-[#09090E]/95 z-[100] flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="bg-[#11111A] border border-white/10 p-8 rounded-3xl w-full max-md shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-white">Security</h3>
                <p className="text-lg text-white/30 mt-1">Update your password</p>
              </div>
              <button onClick={() => setPwOpen(false)} className="p-2.5 rounded-xl border border-white/10 text-white/30 hover:text-white transition-all"><FiX /></button>
            </div>
            <div className="space-y-4">
              {[
                { key: 'currentPassword', label: 'Current Password' },
                { key: 'newPassword', label: 'New Password' },
                { key: 'confirm', label: 'Confirm Password' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-lg font-black uppercase tracking-widest text-white/30 mb-2 block">{f.label}</label>
                  <div className="relative">
                    <input
                      type={showPw[f.key] ? 'text' : 'password'}
                      className="input-field text-lg pr-10"
                      value={pwForm[f.key]}
                      onChange={e => setPwForm({ ...pwForm, [f.key]: e.target.value })}
                    />
                    <button onClick={() => setShowPw(p => ({ ...p, [f.key]: !p[f.key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                      {showPw[f.key] ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handlePwChange}
              className="w-full mt-6 py-3.5 rounded-2xl text-lg font-black uppercase tracking-widest text-[#09090E] transition-all"
              style={{ backgroundColor: accentColor }}>
              Update Password
            </button>
          </div>
        </div>
      )}

      {privacyOpen && (
        <div className="fixed inset-0 bg-[#09090E]/95 z-[100] flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="bg-[#11111A] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-white">Privacy & Preferences</h3>
                <p className="text-lg text-white/30 mt-1">Manage your social visibility</p>
              </div>
              <button onClick={() => setPrivacyOpen(false)} className="p-2.5 rounded-xl border border-white/10 text-white/30 hover:text-white transition-all"><FiX /></button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <FiGlobe className="text-xl" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-white">Public Profile</p>
                    <p className="text-xs text-white/30 font-bold uppercase">Allow others to see your progress</p>
                  </div>
                </div>
                <button 
                  onClick={handleTogglePrivacy}
                  className={`w-14 h-7 rounded-full transition-all relative ${user?.isPublic ? 'bg-brand' : 'bg-white/10'}`}>
                  <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${user?.isPublic ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <FiBell className="text-xl" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-white">Workout Reminders</p>
                    <p className="text-xs text-white/30 font-bold uppercase">Daily push notifications</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleUpdateNotifications({ workoutReminder: !user?.notifications?.workoutReminder })}
                  className={`w-14 h-7 rounded-full transition-all relative ${user?.notifications?.workoutReminder ? 'bg-brand' : 'bg-white/10'}`}>
                  <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${user?.notifications?.workoutReminder ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <button onClick={() => setPrivacyOpen(false)}
              className="w-full mt-8 py-3.5 rounded-2xl text-lg font-black uppercase tracking-widest text-[#09090E] transition-all"
              style={{ backgroundColor: accentColor }}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
