import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileApi, collegeApi } from '../services/api';
import Card3D from '../components/3d/Card3D';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Palette,
  Heart,
  Compass,
  Smile,
  ShieldCheck,
  Camera,
  Upload
} from 'lucide-react';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80'
];

export default function OnboardingPage() {
  const { profile, updateProfileData } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [interestsList, setInterestsList] = useState([]);
  const [formData, setFormData] = useState({
    bio: profile?.bio || 'Coffee enthusiast, late night coder, always down for Solani sunset walks!',
    avatarUrl: profile?.avatarUrl || AVATAR_OPTIONS[0],
    interests: profile?.interests || ['coding', 'indie_music', 'cafe_hopping'],
    connectionPreference: profile?.connectionPreference || 'both',
    discoveryScope: profile?.discoveryScope || 'both',
    vibePrompt: profile?.vibePrompt || 'Best chai spot in Roorkee: Near the canal bridge.'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    collegeApi.getInterests()
      .then(res => setInterestsList(res.data))
      .catch(err => console.error(err));
  }, []);

  const toggleInterest = (id) => {
    setFormData(prev => {
      const exists = prev.interests.includes(id);
      const updated = exists
        ? prev.interests.filter(item => item !== id)
        : [...prev.interests, id];
      return { ...prev, interests: updated };
    });
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const res = await profileApi.updateProfile(formData);
      updateProfileData(res.data);
      navigate('/discover');
    } catch (err) {
      console.error(err);
      navigate('/discover');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-5xl mx-auto px-4 py-8 flex flex-col justify-center text-pink-50">
      {/* Progress Stepper Bar in Pink */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-pink-300/60 mb-2">
          <span>STEP {step} OF 5</span>
          <span className="text-pink-300 font-semibold">
            {step === 1 && 'Personal Bio'}
            {step === 2 && 'Profile Avatar'}
            {step === 3 && 'Interests & Passions'}
            {step === 4 && 'Campus Discovery'}
            {step === 5 && 'Profile Preview'}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-pink-500/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-400 via-rose-500 to-fuchsia-500 transition-all duration-300 shadow-glow-pink"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Form Container */}
        <div className="lg:col-span-7 glass-panel-elevated p-8 rounded-3xl border border-pink-500/25 shadow-2xl">
          {/* STEP 1: Bio & Prompt */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Express Your Campus Vibe</h2>
              <p className="text-xs text-pink-200/70">Write a quick short bio to let others know who you are.</p>

              <div>
                <label className="block text-xs font-semibold text-pink-200 mb-1.5">Short Bio</label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full p-4 rounded-2xl glass-input text-sm leading-relaxed"
                  placeholder="Tell your story..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-pink-200 mb-1.5">Personality Prompt</label>
                <input
                  type="text"
                  value={formData.vibePrompt}
                  onChange={(e) => setFormData({ ...formData, vibePrompt: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl glass-input text-sm"
                  placeholder="e.g. My favorite weekend activity..."
                />
              </div>
            </div>
          )}

          {/* STEP 2: 3D Avatar Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Choose Your Profile Picture</h2>
              <p className="text-xs text-pink-200/70">Upload your own real photo or pick a stylized campus avatar.</p>

              {/* Upload Own Photo Button */}
              <div className="flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/25">
                <input
                  type="file"
                  id="onboarding-avatar-input"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    e.target.value = '';
                    const reader = new FileReader();
                    reader.onload = async () => {
                      try {
                        const res = await profileApi.uploadImage(reader.result, 'avatar');
                        setFormData(prev => ({ ...prev, avatarUrl: res.data.url }));
                      } catch (err) {
                        console.error('Failed to upload image:', err);
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                <label
                  htmlFor="onboarding-avatar-input"
                  className="cursor-pointer px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-95 text-white text-xs font-bold transition-all shadow-glow-pink flex items-center gap-2 active:scale-95 shrink-0"
                >
                  <Camera className="w-4 h-4" />
                  <span>Upload Real Photo</span>
                </label>
                <span className="text-[11px] text-pink-200/70 text-center sm:text-left">
                  Supports JPG, PNG from your device, or select a preset avatar:
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3 py-2">
                {AVATAR_OPTIONS.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarUrl: img })}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all p-0.5 ${
                      formData.avatarUrl === img
                        ? 'border-pink-400 scale-105 shadow-glow-pink'
                        : 'border-pink-500/15 hover:border-pink-400/40'
                    }`}
                  >
                    <img src={img} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Smart Interest Tags */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">What Are You Passionate About?</h2>
              <p className="text-xs text-pink-200/70">Select at least 3 interests to match with like-minded students.</p>

              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1">
                {interestsList.map((item) => {
                  const selected = formData.interests.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleInterest(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                        selected
                          ? 'bg-pink-500/25 text-pink-200 border-pink-400 shadow-glow-pink'
                          : 'bg-pink-500/5 hover:bg-pink-500/15 text-pink-200/70 border-pink-500/15'
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Preferences */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Connection & Discovery Scope</h2>

              <div>
                <label className="block text-xs font-semibold text-pink-200 mb-2">I Want To Find:</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'friendship', label: '🤝 Friends', desc: 'Study & hangout buddies' },
                    { id: 'dating', label: '💘 Dating', desc: 'Campus romance & dates' },
                    { id: 'both', label: '✨ Both', desc: 'Open to all connections' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, connectionPreference: p.id })}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        formData.connectionPreference === p.id
                          ? 'bg-pink-500/25 border-pink-400 text-white shadow-glow-pink'
                          : 'bg-pink-500/5 border-pink-500/15 text-pink-300/60'
                      }`}
                    >
                      <div className="font-bold text-sm">{p.label}</div>
                      <div className="text-[10px] text-pink-300/50 mt-1">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-pink-200 mb-2">Discovery Range:</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'same_college', label: 'My College', desc: 'Only your campus' },
                    { id: 'nearby', label: 'Nearby Colleges', desc: 'Campuses in your area' },
                    { id: 'both', label: 'All Campuses', desc: 'Maximum discovery' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, discoveryScope: s.id })}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        formData.discoveryScope === s.id
                          ? 'bg-fuchsia-500/25 border-fuchsia-400 text-white shadow-glow-fuchsia'
                          : 'bg-pink-500/5 border-pink-500/15 text-pink-300/60'
                      }`}
                    >
                      <div className="font-bold text-sm">{s.label}</div>
                      <div className="text-[10px] text-pink-300/50 mt-1">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Final Confirmation */}
          {step === 5 && (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-pink-500/20 text-pink-300 mx-auto flex items-center justify-center shadow-glow-pink">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">Your Profile Looks Spectacular!</h2>
              <p className="text-xs text-pink-200/80 max-w-md mx-auto">
                Check out your live profile card on the right. You can now start discovering other students across your campus network!
              </p>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-pink-500/15 mt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-5 py-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-200 font-semibold text-sm flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-glow-pink"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-glow-pink"
              >
                <span>{saving ? 'Saving...' : 'Start Discovering'}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Live 3D Card Preview (Right Side) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="text-xs font-bold text-pink-300 mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Profile Preview</span>
          </div>

          <Card3D
            profile={{
              displayName: profile?.displayName || 'Your Name',
              age: profile?.age || 20,
              course: profile?.course || 'B.Tech CS',
              year: '1st Year',
              bio: formData.bio,
              avatarUrl: formData.avatarUrl,
              college: profile?.college || { name: 'IIT Roorkee' },
              connectionPreference: formData.connectionPreference,
              interests: formData.interests,
              verificationStatus: 'verified'
            }}
            active={false}
          />
        </div>
      </div>
    </div>
  );
}
