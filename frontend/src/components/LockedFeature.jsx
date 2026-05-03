import React, { useState } from 'react';
import { FiLock, FiZap, FiCheck } from 'react-icons/fi';
import { userAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LockedFeature({ title, feature }) {
  const { updateUser } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code) return toast.error('Enter a promo code');
    setLoading(true);
    try {
      const { data } = await userAPI.verifyPromo(code);
      updateUser(data.user);
      toast.success('Premium Unlocked! Enjoy the full YGB experience. 💪');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-in">
      <div className="card max-w-md w-full p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand to-accent" />
        
        <div className="w-20 h-20 bg-brand/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow-sm">
          <FiLock className="text-4xl text-brand" />
        </div>

        <h2 className="font-display text-3xl tracking-wider mb-2">PREMIUM FEATURE</h2>
        <p className="text-muted text-lg mb-8 leading-relaxed font-medium">
          The <span className="text-[var(--text-primary)] font-bold">{title}</span> is part of our Elite toolkit. 
          Unlock it to take your fitness to the next level.
        </p>

        <div className="space-y-4 mb-10">
          {[
            'Personalized Goal-Based Nutrition',
            'Full Strength Tracking & Analytics',
            'Exclusive Training Templates',
            'Custom Exercise Database'
          ].map(f => (
            <div key={f} className="flex items-center gap-3 text-left text-lg font-bold text-[var(--text-primary)]">
              <div className="w-5 h-5 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0">
                <FiCheck className="text-brand text-xs" />
              </div>
              {f}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input 
              type="text" 
              className="input-field text-center font-black tracking-widest uppercase placeholder:tracking-normal placeholder:font-medium"
              placeholder="ENTER PROMO CODE"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
            />
          </div>
          <button 
            onClick={handleVerify}
            disabled={loading}
            className="btn-primary w-full py-4 flex items-center justify-center gap-3 shadow-glow"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-[#0F0F14] border-t-transparent rounded-full animate-spin" />
            ) : (
              <><FiZap /> ACTIVATE ACCESS</>
            )}
          </button>
          <p className="text-[10px] text-muted font-bold uppercase tracking-widest">
            Try code <span className="text-brand cursor-pointer hover:underline" onClick={() => setCode('YGBFREE')}>YGBFREE</span> for trial
          </p>
        </div>
      </div>
    </div>
  );
}
