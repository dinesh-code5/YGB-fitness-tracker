import React, { useState, useEffect } from 'react';
import { dietAPI } from '../utils/api';
import { FiSearch, FiPlus, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const FOOD_CATEGORIES = ['All', 'Vegetarian', 'Non-Vegetarian', 'Supplement', 'Egg', 'Dairy', 'Fruits', 'Grains'];

export default function FoodLibrary() {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(null);

  useEffect(() => {
    // In a real app, replace this with a backend call: dietAPI.getFoods()
    const mockFoods = [
      { id: 1, name: 'Oats', category: 'Grains', calories: 150, protein: 5, fats: 2, carbs: 27 },
      { id: 2, name: 'Chicken Breast (100g)', category: 'Non-Vegetarian', calories: 165, protein: 31, fats: 3.6, carbs: 0 },
      { id: 3, name: 'Whey Protein (1 Scoop)', category: 'Supplement', calories: 120, protein: 25, fats: 1, carbs: 3 },
      { id: 4, name: 'Boiled Egg (Large)', category: 'Egg', calories: 78, protein: 6, fats: 5, carbs: 0.6 },
      { id: 5, name: 'Tofu (100g)', category: 'Vegetarian', calories: 144, protein: 17, fats: 9, carbs: 3 },
      { id: 6, name: 'Salmon (100g)', category: 'Non-Vegetarian', calories: 208, protein: 20, fats: 13, carbs: 0 },
      { id: 7, name: 'Creatine Monohydrate', category: 'Supplement', calories: 0, protein: 0, fats: 0, carbs: 0 },
      { id: 8, name: 'Greek Yogurt (100g)', category: 'Dairy', calories: 59, protein: 10, fats: 0.4, carbs: 3.6 },
      { id: 9, name: 'Banana (Medium)', category: 'Fruits', calories: 105, protein: 1.3, fats: 0.3, carbs: 27 },
      { id: 10, name: 'Brown Rice (100g Cooked)', category: 'Grains', calories: 111, protein: 2.6, fats: 0.9, carbs: 23 },
      { id: 11, name: 'Paneer (100g)', category: 'Dairy', calories: 265, protein: 18, fats: 20, carbs: 1.2 },
      { id: 12, name: 'Almonds (28g)', category: 'Vegetarian', calories: 164, protein: 6, fats: 14, carbs: 6 },
      { id: 13, name: 'Peanut Butter (1 tbsp)', category: 'Vegetarian', calories: 94, protein: 4, fats: 8, carbs: 3 },
      { id: 14, name: 'Milk (Full Cream, 200ml)', category: 'Dairy', calories: 124, protein: 6.8, fats: 6.5, carbs: 9.5 },
      { id: 15, name: 'Sweet Potato (100g)', category: 'Vegetarian', calories: 86, protein: 1.6, fats: 0.1, carbs: 20 },
    ];
    setFoods(mockFoods);
    setLoading(false);
  }, []);

  const handleLog = async (food) => {
    setLogging(food.id);
    try {
      await dietAPI.logMeal({ 
        name: food.name,
        calories: food.calories || 0,
        protein: food.protein || 0,
        carbs: food.carbs || 0,
        fats: food.fats !== undefined ? food.fats : (food.fat || 0)
      });
      window.dispatchEvent(new CustomEvent('dietUpdated'));
      toast.success(`${food.name} added to today's log! 🍎`);
    } catch (err) {
      console.error('Log error:', err);
      toast.error(err.response?.data?.message || 'Failed to log food');
    } finally {
      setLogging(null);
    }
  };

  const filtered = foods.filter(f => 
    (selectedCat === 'All' || f.category === selectedCat) &&
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container max-w-4xl">
      <div className="mb-8 relative overflow-hidden p-8 rounded-3xl bg-brand/5 border border-brand/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <h1 className="font-display text-5xl tracking-widest text-brand mb-2">FOOD LIBRARY</h1>
        <p className="text-muted text-xs font-black uppercase tracking-[0.3em]">Precision nutrition for peak performance</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input-field pl-12 h-14" placeholder="Search foods (e.g. Chicken, Oats...)" 
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field md:w-56 h-14 font-black uppercase tracking-widest text-[10px]"
          value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
          {FOOD_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest">Syncing library...</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(f => (
            <div key={f.id} className="card p-5 flex items-center justify-between hover:border-brand/40 transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand/10 group-hover:bg-brand transition-all" />
              <div className="flex-1 min-w-0 pr-4">
                <p className="font-black text-sm text-[var(--text-primary)] truncate uppercase tracking-tight">{f.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-brand font-black uppercase tracking-widest">{f.category}</span>
                  <span className="w-1 h-1 rounded-full bg-muted" />
                  <span className="text-[10px] text-muted font-bold">{f.calories} kcal</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden xs:flex gap-3 text-center border-l border-[var(--surface-border)] pl-4">
                  {[ {l:'P',v:f.protein}, {l:'F',v:f.fats}, {l:'C',v:f.carbs} ].map(m => (
                    <div key={m.l} className="min-w-[24px]">
                      <p className="text-[var(--text-primary)] font-black text-xs">{m.v}g</p>
                      <p className="text-[8px] text-muted uppercase font-black">{m.l}</p>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => handleLog(f)}
                  disabled={logging === f.id}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    logging === f.id ? 'bg-brand/20 text-brand' : 'bg-brand/10 text-brand hover:bg-brand hover:text-[#0F0F14] shadow-glow-sm'
                  }`}
                >
                  {logging === f.id ? (
                    <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiPlus />
                  )}
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center card border-dashed">
              <p className="text-muted text-sm font-medium">No foods found matching your search</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
