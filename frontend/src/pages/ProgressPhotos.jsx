import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../utils/api';
import { FiCamera, FiArrowLeft, FiPlus, FiTrash2, FiMaximize2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProgressPhotos() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const { data } = await userAPI.getProgressPhotos();
      setPhotos(data.progressPhotos || []);
    } catch (err) {
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        const { data } = await userAPI.addProgressPhoto({ 
          weight: weight ? Number(weight) : null, 
          note, 
          imageUrl: base64 
        });
        setPhotos(data.progressPhotos || []);
        setWeight(''); 
        setNote('');
        toast.success('Progress photo saved! 💪');
      };
      reader.readAsDataURL(file);
    } catch { 
      toast.error('Upload failed'); 
    } finally { 
      setUploading(false); 
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#1E1E2A] rounded-full transition-colors">
          <FiArrowLeft className="text-xl" />
        </button>
        <h1 className="font-display text-2xl tracking-wider">PROGRESS PHOTOS</h1>
      </div>

      {/* Upload Card */}
      <div className="card p-5 mb-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <FiPlus className="text-brand" /> Add New Photo
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-[10px] uppercase tracking-wider">Weight (kg)</label>
              <input 
                type="number" 
                className="input-field text-sm" 
                placeholder="e.g. 75"
                value={weight} 
                onChange={e => setWeight(e.target.value)} 
              />
            </div>
            <div>
              <label className="label text-[10px] uppercase tracking-wider">Note (optional)</label>
              <input 
                className="input-field text-sm" 
                placeholder="Feeling stronger..."
                value={note} 
                onChange={e => setNote(e.target.value)} 
              />
            </div>
          </div>
          
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            {uploading ? (
              <span className="w-5 h-5 border-2 border-[#0F0F14] border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiCamera className="text-lg" />
            )}
            {uploading ? 'Processing Image...' : 'Capture / Select Photo'}
          </button>
          <p className="text-[10px] text-muted text-center">Your photos are stored securely and only visible based on your privacy settings.</p>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-3 gap-1 md:gap-2">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-[#1E1E2A] animate-pulse rounded-md" />
          ))
        ) : photos.length === 0 ? (
          <div className="col-span-3 py-20 text-center text-muted">
            <FiCamera className="text-4xl mx-auto mb-3 opacity-20" />
            <p className="text-sm">No progress photos yet.</p>
            <p className="text-xs mt-1">Consistency is key! Start tracking your physical changes.</p>
          </div>
        ) : (
          photos.slice().reverse().map((p, i) => (
            <div 
              key={i} 
              className="relative aspect-square cursor-pointer group overflow-hidden rounded-md md:rounded-lg"
              onClick={() => setSelectedPhoto(p)}
            >
              <img 
                src={p.imageUrl} 
                alt="progress" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <FiMaximize2 className="text-white text-xl" />
              </div>
              {(p.weight) && (
                <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-bold text-brand">
                  {p.weight}kg
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Full Screen Viewer */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-4 backdrop-blur-md">
          <button 
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <FiX className="text-2xl" />
          </button>
          
          <div className="w-full max-w-lg">
            <img 
              src={selectedPhoto.imageUrl} 
              alt="Full progress" 
              className="w-full rounded-2xl shadow-2xl border border-white/10" 
            />
            <div className="mt-6 text-center">
              <p className="text-brand font-bold text-xl">{selectedPhoto.weight ? `${selectedPhoto.weight} kg` : 'Weight not logged'}</p>
              <p className="text-muted text-sm mt-1">
                {new Date(selectedPhoto.date).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
              {selectedPhoto.note && (
                <p className="text-white/80 mt-4 bg-white/5 p-4 rounded-xl italic">
                  "{selectedPhoto.note}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
