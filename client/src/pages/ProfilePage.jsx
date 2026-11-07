import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../services/api';
import Card3D from '../components/3d/Card3D';
import {
  User,
  ShieldCheck,
  Save,
  Sparkles,
  Check,
  Camera,
  Image as ImageIcon,
  Upload,
  Link2,
  X,
  Palette,
  MapPin,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const PRESET_COVERS = [
  {
    id: 'cover_1',
    name: 'IIT Roorkee Heritage',
    tag: 'Classic Campus',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1400&q=80'
  },
  {
    id: 'cover_2',
    name: 'Solani Aqueduct Sunset',
    tag: 'Sunset Vibes',
    url: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=1400&q=80'
  },
  {
    id: 'cover_3',
    name: 'Campus Night Walks',
    tag: 'Night Aesthetic',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80'
  },
  {
    id: 'cover_4',
    name: 'Obsidian Rose Neon',
    tag: 'Cyber Dating',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1400&q=80'
  },
  {
    id: 'cover_5',
    name: 'Central Library Hall',
    tag: 'Study & Chill',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1400&q=80'
  },
  {
    id: 'cover_6',
    name: 'Ganga Canal Greenery',
    tag: 'Nature Walk',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80'
  }
];

const PRESET_AVATARS = [
  { id: 'av_1', name: 'Aesthetic Girl 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80' },
  { id: 'av_2', name: 'Campus Boy 1', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80' },
  { id: 'av_3', name: 'Aesthetic Girl 2', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80' },
  { id: 'av_4', name: 'Campus Boy 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80' },
  { id: 'av_5', name: 'Portrait Girl', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80' },
  { id: 'av_6', name: 'Portrait Boy', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80' },
  { id: 'av_7', name: 'Chill Girl', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80' },
  { id: 'av_8', name: 'Moody Boy', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80' }
];

export default function ProfilePage() {
  const { profile, updateProfileData } = useAuth();

  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    age: profile?.age || 20,
    course: profile?.course || '',
    year: profile?.year || '3rd Year',
    bio: profile?.bio || '',
    vibePrompt: profile?.vibePrompt || '',
    connectionPreference: profile?.connectionPreference || 'both',
    avatarUrl: profile?.avatarUrl || PRESET_AVATARS[0].url,
    coverUrl: profile?.coverUrl || PRESET_COVERS[0].url
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Modal State for Image Picker ('avatar' | 'cover' | null)
  const [activeModal, setActiveModal] = useState(null);
  const [modalTab, setModalTab] = useState('upload'); // 'upload' | 'preset' | 'url'
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        displayName: profile.displayName ?? prev.displayName,
        age: profile.age ?? prev.age,
        course: profile.course ?? prev.course,
        year: profile.year ?? prev.year,
        bio: profile.bio ?? prev.bio,
        vibePrompt: profile.vibePrompt ?? prev.vibePrompt,
        connectionPreference: profile.connectionPreference ?? prev.connectionPreference,
        avatarUrl: profile.avatarUrl || prev.avatarUrl,
        coverUrl: profile.coverUrl || prev.coverUrl
      }));
    }
  }, [profile]);

  // Open modal for either avatar or cover
  const handleOpenModal = (type) => {
    setActiveModal(type);
    setModalTab('upload');
    setUploadError('');
    setCustomUrlInput('');
  };

  // Direct image file upload to server
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input to allow re-selection
    e.target.value = '';

    setUploadLoading(true);
    setUploadError('');

    try {
      // 1. Read file as Base64 Data URL
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
      });

      // 2. Upload to server
      const uploadRes = await profileApi.uploadImage(dataUrl, activeModal);
      const publicUrl = uploadRes.data.url;

      // 3. Immediately apply to profile state and auto-save
      if (activeModal === 'avatar') {
        setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
        await profileApi.updateProfile({ avatarUrl: publicUrl });
        updateProfileData({ avatarUrl: publicUrl });
        setSuccessMessage('Profile photo uploaded and updated successfully!');
      } else {
        setFormData(prev => ({ ...prev, coverUrl: publicUrl }));
        await profileApi.updateProfile({ coverUrl: publicUrl });
        updateProfileData({ coverUrl: publicUrl });
        setSuccessMessage('Cover photo uploaded and updated successfully!');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
      setActiveModal(null);
    } catch (err) {
      console.error('Image upload failed:', err);
      setUploadError(err.response?.data?.error || err.message || 'Image upload failed. Please try a different image.');
    } finally {
      setUploadLoading(false);
    }
  };

  // Preset selection handler
  const handleSelectPreset = async (presetUrl) => {
    setUploadLoading(true);
    try {
      if (activeModal === 'avatar') {
        setFormData(prev => ({ ...prev, avatarUrl: presetUrl }));
        await profileApi.updateProfile({ avatarUrl: presetUrl });
        updateProfileData({ avatarUrl: presetUrl });
        setSuccessMessage('Avatar preset applied successfully!');
      } else {
        setFormData(prev => ({ ...prev, coverUrl: presetUrl }));
        await profileApi.updateProfile({ coverUrl: presetUrl });
        updateProfileData({ coverUrl: presetUrl });
        setSuccessMessage('Cover theme applied successfully!');
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
      setActiveModal(null);
    } catch (err) {
      console.error(err);
      setUploadError('Failed to apply preset.');
    } finally {
      setUploadLoading(false);
    }
  };

  // Direct URL apply handler
  const handleApplyUrl = async () => {
    if (!customUrlInput.trim()) return;
    setUploadLoading(true);
    try {
      const url = customUrlInput.trim();
      if (activeModal === 'avatar') {
        setFormData(prev => ({ ...prev, avatarUrl: url }));
        await profileApi.updateProfile({ avatarUrl: url });
        updateProfileData({ avatarUrl: url });
        setSuccessMessage('Profile photo updated successfully!');
      } else {
        setFormData(prev => ({ ...prev, coverUrl: url }));
        await profileApi.updateProfile({ coverUrl: url });
        updateProfileData({ coverUrl: url });
        setSuccessMessage('Cover photo updated successfully!');
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
      setActiveModal(null);
    } catch (err) {
      console.error(err);
      setUploadError('Failed to apply image URL.');
    } finally {
      setUploadLoading(false);
    }
  };

  // Form submission for text fields
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const res = await profileApi.updateProfile(formData);
      updateProfileData(res.data);
      setSuccessMessage('Profile details saved successfully! Card preview updated.');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 text-pink-50">
      
      {/* ========================================================================= */}
      {/* 1. CINEMATIC COVER PHOTO & PROFILE AVATAR BANNER */}
      {/* ========================================================================= */}
      <div className="relative mb-10 rounded-3xl overflow-hidden glass-panel-elevated border border-pink-500/25 shadow-2xl">
        {/* Cover Photo */}
        <div className="relative w-full h-44 sm:h-56 md:h-64 bg-slate-950 overflow-hidden group">
          <img
            src={formData.coverUrl}
            alt="Campus Cover"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0612] via-[#0e0612]/30 to-transparent" />

          {/* Change Cover Button Overlay */}
          <button
            type="button"
            onClick={() => handleOpenModal('cover')}
            className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/60 hover:bg-pink-600/80 backdrop-blur-md border border-pink-400/30 text-white text-xs font-bold transition-all shadow-glow-pink active:scale-95"
          >
            <Camera className="w-4 h-4 text-pink-300" />
            <span>Change Cover Photo</span>
          </button>

          {/* Campus Tag */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-pink-500/30 text-xs font-semibold text-pink-200">
            <MapPin className="w-3.5 h-3.5 text-pink-400" />
            <span>{profile?.college?.name || 'Roorkee Campus'}</span>
          </div>
        </div>

        {/* Profile Avatar & Quick Bio Bar */}
        <div className="relative px-6 pb-6 pt-0 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left z-20">
            {/* Circular Profile Avatar with Glowing Border & Camera Badge */}
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-[#0e0612] shadow-2xl bg-slate-900 ring-2 ring-pink-500/50 shadow-glow-pink">
                <img
                  src={formData.avatarUrl}
                  alt={formData.displayName}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Change Avatar Button Badge */}
              <button
                type="button"
                onClick={() => handleOpenModal('avatar')}
                className="absolute bottom-1 right-1 p-2 rounded-2xl bg-pink-500 text-white hover:bg-pink-600 border-2 border-[#0e0612] shadow-lg transition-transform hover:scale-110 active:scale-95 flex items-center justify-center shadow-glow-pink"
                title="Change Profile Picture"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Status */}
            <div className="pt-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center justify-center sm:justify-start gap-2">
                <span>{formData.displayName || 'Campus Student'}</span>
                {profile?.verificationStatus === 'verified' && (
                  <ShieldCheck className="w-6 h-6 text-pink-400 fill-pink-400/20" title="Verified Campus Student" />
                )}
              </h1>
              <p className="text-xs text-pink-200/80 mt-0.5">
                {formData.course || 'Degree Program'} • {formData.year || 'Student'} • Age {formData.age}
              </p>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2 z-20">
            <button
              type="button"
              onClick={() => handleOpenModal('avatar')}
              className="px-3.5 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/30 text-pink-200 text-xs font-bold transition-all shadow-glow-pink flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Update Profile Pic</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenModal('cover')}
              className="px-3.5 py-2 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-200 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Change Cover</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN GRID: EDIT FORM (LEFT) & LIVE 3D CARD PREVIEW (RIGHT) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Edit Form */}
        <div className="lg:col-span-7 glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-pink-500/25 shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-pink-500/15">
            <div>
              <h2 className="text-lg font-bold text-white">Profile Details & Vibe</h2>
              <p className="text-xs text-pink-200/60 mt-0.5">Customize your bio, course details, and preferences</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-200 border border-pink-500/35">
              Live Sync
            </span>
          </div>

          {success && (
            <div className="mb-6 p-3.5 rounded-2xl bg-pink-500/20 border border-pink-500/40 text-pink-200 text-xs font-semibold flex items-center gap-2 shadow-glow-pink animate-fade-in">
              <Check className="w-4 h-4 text-pink-300" />
              <span>{successMessage || 'Profile changes saved successfully!'}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-pink-200 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-pink-200 mb-1">Age</label>
                <input
                  type="number"
                  min="18"
                  max="35"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-pink-200 mb-1">Course / Major</label>
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  placeholder="e.g. B.Tech Computer Science"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-pink-200 mb-1">Academic Year</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm bg-[#150a1b]"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-pink-200 mb-1">Bio</label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Share your interests, favourite campus spots, and what you’re looking for..."
                className="w-full p-4 rounded-xl glass-input text-sm leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-pink-200 mb-1">Campus Personality Prompt</label>
              <input
                type="text"
                value={formData.vibePrompt}
                onChange={(e) => setFormData({ ...formData, vibePrompt: e.target.value })}
                placeholder="e.g. The best chai in Roorkee is at Solani river bank..."
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-pink-200 mb-1">Connection Preference</label>
              <div className="grid grid-cols-3 gap-2">
                {['both', 'friendship', 'dating'].map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => setFormData({ ...formData, connectionPreference: pref })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all border ${
                      formData.connectionPreference === pref
                        ? 'bg-pink-500/25 text-pink-200 border-pink-400 shadow-glow-pink'
                        : 'bg-pink-500/5 text-pink-300/60 border-pink-500/15'
                    }`}
                  >
                    {pref === 'both' ? '✨ Both' : pref === 'friendship' ? '🤝 Friends' : '💘 Dating'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-glow-pink hover:opacity-95 active:scale-95 transition-all mt-6"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Right: Live Profile Card Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="text-xs font-bold text-pink-300 mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Profile Preview</span>
          </div>

          <Card3D
            profile={{
              ...profile,
              displayName: formData.displayName,
              age: formData.age,
              course: formData.course,
              year: formData.year,
              bio: formData.bio,
              vibePrompt: formData.vibePrompt,
              connectionPreference: formData.connectionPreference,
              avatarUrl: formData.avatarUrl,
              coverUrl: formData.coverUrl,
              college: profile?.college || { name: 'IIT Roorkee' }
            }}
            active={false}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL: AVATAR & COVER PHOTO SELECTOR / UPLOADER */}
      {/* ========================================================================= */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl glass-panel-elevated border border-pink-500/30 p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-pink-500/15 text-pink-200 hover:bg-pink-500/25 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-pink-400" />
                <span>{activeModal === 'avatar' ? 'Change Profile Picture' : 'Change Cover Photo'}</span>
              </h3>
              <p className="text-xs text-pink-200/70 mt-1">
                {activeModal === 'avatar'
                  ? 'Upload any photo from your phone or computer, or pick a campus preset'
                  : 'Upload your own custom cover banner or choose a campus theme'}
              </p>
            </div>

            {/* Error Banner */}
            {uploadError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-pink-500/10 border border-pink-500/20 mb-6">
              <button
                type="button"
                onClick={() => setModalTab('upload')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  modalTab === 'upload'
                    ? 'bg-pink-500 text-white shadow-glow-pink'
                    : 'text-pink-300/70 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('preset')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  modalTab === 'preset'
                    ? 'bg-pink-500 text-white shadow-glow-pink'
                    : 'text-pink-300/70 hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Presets</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('url')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  modalTab === 'url'
                    ? 'bg-pink-500 text-white shadow-glow-pink'
                    : 'text-pink-300/70 hover:text-white'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Image Link</span>
              </button>
            </div>

            {/* TAB 1: UPLOAD FROM DEVICE */}
            {modalTab === 'upload' && (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onClick={() => !uploadLoading && fileInputRef.current?.click()}
                  className={`w-full h-48 rounded-2xl border-2 border-dashed border-pink-500/40 hover:border-pink-400 bg-pink-500/5 hover:bg-pink-500/10 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group p-4 ${
                    uploadLoading ? 'opacity-70 pointer-events-none' : ''
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-pink-500/20 text-pink-300 flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow-pink">
                    {uploadLoading ? (
                      <RefreshCw className="w-7 h-7 animate-spin text-pink-400" />
                    ) : (
                      <Upload className="w-7 h-7" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">
                      {uploadLoading ? 'Uploading & saving photo...' : 'Click to select photo from Phone / PC'}
                    </p>
                    <p className="text-xs text-pink-300/60 mt-1">
                      Supports JPG, PNG, WebP (Instant auto-upload & live preview)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRESET GALLERY */}
            {modalTab === 'preset' && (
              <div>
                {activeModal === 'avatar' ? (
                  <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-1">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        disabled={uploadLoading}
                        onClick={() => handleSelectPreset(av.url)}
                        className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all group ${
                          formData.avatarUrl === av.url
                            ? 'border-pink-400 ring-2 ring-pink-500 shadow-glow-pink scale-105'
                            : 'border-white/10 opacity-70 hover:opacity-100 hover:border-pink-500/50'
                        }`}
                      >
                        <img src={av.url} alt={av.name} className="w-full h-full object-cover object-top" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                    {PRESET_COVERS.map((cov) => (
                      <button
                        key={cov.id}
                        type="button"
                        disabled={uploadLoading}
                        onClick={() => handleSelectPreset(cov.url)}
                        className={`relative rounded-2xl overflow-hidden h-24 border-2 transition-all group ${
                          formData.coverUrl === cov.url
                            ? 'border-pink-400 ring-2 ring-pink-500 shadow-glow-pink scale-[1.02]'
                            : 'border-white/10 opacity-70 hover:opacity-100 hover:border-pink-500/50'
                        }`}
                      >
                        <img src={cov.url} alt={cov.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                          <span className="text-[11px] font-bold text-white truncate">{cov.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: DIRECT IMAGE URL */}
            {modalTab === 'url' && (
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-pink-200">Paste Image Web Address (URL)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs font-mono"
                  />
                  <button
                    type="button"
                    disabled={uploadLoading || !customUrlInput.trim()}
                    onClick={handleApplyUrl}
                    className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 border border-pink-400/30 text-white text-xs font-bold shadow-glow-pink transition-all"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
