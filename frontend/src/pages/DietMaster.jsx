import React, { useState, useEffect } from 'react';
import { dietAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import LockedFeature from '../components/LockedFeature';
import DietToday from '../components/DietToday';
import DietAIPlan from '../components/DietAIPlan';
import DietFoodLibrary from '../components/DietFoodLibrary';
import { FiActivity, FiTarget, FiCoffee } from 'react-icons/fi';

const TABS = [
  { id: 'today', label: "TODAY'S MEALS ⭐", icon: FiActivity },
  { id: 'ai', label: "AI MEAL PLAN", icon: FiTarget },
  { id: 'library', label: "FOOD LIBRARY", icon: FiCoffee },
];

export default function DietMaster() {
  const { user, dashboardData, refreshGlobalData } = useAuth();
  const [activeTab, setActiveTab] = useState('today');
  const result = dashboardData.dietPlan;
  const todaysTotal = (dashboardData.todayLogs || []).reduce((acc, curr) => ({
    calories: acc.calories + Number(curr.calories),
    protein: acc.protein + Number(curr.protein),
    carbs: acc.carbs + (Number(curr.carbs) || 0),
    fats: acc.fats + Number(curr.fats)
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const fetching = dashboardData.isRefreshing && !dashboardData.lastFetched;

  const refreshLogs = async () => {
    refreshGlobalData(true);
  };

  if (!user?.isPremium) return <LockedFeature title="Diet Master" feature="diet" />;

  if (fetching) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="page-container">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="font-display text-5xl md:text-6xl tracking-widest text-brand">DIET MASTER</h1>
          <p className="text-muted text-xl font-medium mt-1 uppercase tracking-tighter">Peak Performance Nutrition</p>
        </div>
        {result && (
          <div className="flex items-center gap-4">
            <div className="bg-brand/10 border border-brand/20 p-4 px-8 rounded-2xl text-center backdrop-blur-sm">
              <p className="text-[10px] font-black text-brand uppercase tracking-widest">Daily Goal</p>
              <p className="text-3xl font-display text-[var(--text-primary)]">{result.targetCalories} <span className="text-xs font-body text-muted uppercase">kcal</span></p>
            </div>
            <div className="bg-brand/10 border border-brand/20 p-4 px-8 rounded-2xl text-center backdrop-blur-sm">
              <p className="text-[10px] font-black text-brand uppercase tracking-widest">Hydration</p>
              <p className="text-3xl font-display text-[var(--text-primary)]">{result.waterIntake}<span className="text-xs font-body text-muted uppercase ml-1">L</span></p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-[var(--surface-border)] pb-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative
              ${activeTab === tab.id 
                ? 'text-brand' 
                : 'text-muted hover:text-[var(--text-primary)]'
              }`}
          >
            <tab.icon className="text-base" />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-brand rounded-full shadow-glow-sm" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'today' && (
          <DietToday 
            todaysTotal={todaysTotal} 
            result={result} 
            onAddMeal={() => setActiveTab('library')} 
          />
        )}
        {activeTab === 'ai' && (
          <DietAIPlan 
            user={user} 
            result={result} 
            refreshLogs={refreshLogs} 
          />
        )}
        {activeTab === 'library' && (
          <DietFoodLibrary refreshLogs={refreshLogs} />
        )}
      </div>
    </div>
  );
}
