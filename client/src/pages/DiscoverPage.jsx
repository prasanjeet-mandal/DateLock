import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { discoverApi, likeApi, collegeApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Card3D from '../components/3d/Card3D';
import MatchConfetti from '../components/3d/MatchConfetti';
import {
  RotateCcw,
  SlidersHorizontal,
  LayoutGrid,
  Layers,
  Sparkles,
  MapPin,
  Heart,
  X,
  ShieldCheck,
  Check,
  RefreshCw,
  Search
} from 'lucide-react';

export default function DiscoverPage() {
  const { user, profile } = useAuth();
  const { connectionMode } = useTheme();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [colleges, setColleges] = useState([]);
  const [viewMode, setViewMode] = useState('swipe'); // 'swipe' | 'grid'

  // Filters
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedScope, setSelectedScope] = useState('both');
  const [selectedYear, setSelectedYear] = useState('');

  // Match celebration state
  const [matchData, setMatchData] = useState(null);

  // Detailed Modal
  const [inspectProfile, setInspectProfile] = useState(null);

  // Fetch candidates
  const loadCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (connectionMode && connectionMode !== 'both') params.mode = connectionMode;
      if (selectedCollege) params.collegeId = selectedCollege;
      if (selectedScope && selectedScope !== 'both') params.scope = selectedScope;
      if (selectedYear) params.year = selectedYear;

      const res = await discoverApi.getCandidates(params);
      setCandidates(res.data.candidates || []);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Failed to load discovery candidates:', err);
    } finally {
      setLoading(false);
    }
  }, [connectionMode, selectedCollege, selectedScope, selectedYear]);

  useEffect(() => {
    collegeApi.getColleges()
      .then(res => setColleges(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  // Handle Swipe Actions
  const handleLike = async (candidate) => {
    if (!candidate) return;
    try {
      const res = await likeApi.sendLike(candidate.userId, 'like');
      if (res.data.isMatch) {
        setMatchData({
          match: res.data.match,
          partner: res.data.partner || candidate,
          currentUserAvatar: profile?.avatarUrl
        });
      }
      setCurrentIndex(prev => prev + 1);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handlePass = async (candidate) => {
    if (!candidate) return;
    try {
      await likeApi.sendLike(candidate.userId, 'pass');
      setCurrentIndex(prev => prev + 1);
    } catch (err) {
      console.error('Pass error:', err);
    }
  };

  const handleUndo = async () => {
    try {
      const res = await likeApi.undoLastAction();
      if (res.data.restoredProfile) {
        if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
        } else {
          setCandidates(prev => [res.data.restoredProfile, ...prev]);
        }
      }
    } catch (err) {
      alert('No previous pass action to undo.');
    }
  };

  // Keyboard Hotkeys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (inspectProfile) {
        if (e.key === 'Escape') setInspectProfile(null);
        return;
      }
      const activeCandidate = candidates[currentIndex];
      if (!activeCandidate) return;

      if (e.key === 'ArrowRight') {
        handleLike(activeCandidate);
      } else if (e.key === 'ArrowLeft') {
        handlePass(activeCandidate);
      } else if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        setInspectProfile(activeCandidate);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [candidates, currentIndex, inspectProfile]);

  const activeProfile = candidates[currentIndex];

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 text-pink-50">
      {/* Top Filter & View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Discover {profile?.college?.city ? `${profile.college.city} Students` : 'Campus Peers'}</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-200 border border-pink-500/35 shadow-glow-pink">
              {candidates.length - currentIndex} available
            </span>
          </h1>
          <p className="text-xs text-pink-200/70 mt-1">
            Peers from <strong className="text-pink-300">{profile?.college?.name || 'your campus'}</strong> and neighboring institutions
          </p>
        </div>

        {/* View Mode Toggle & Rewind */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            className="p-2.5 rounded-2xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 text-pink-200 transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="Rewind / Undo Last Pass"
          >
            <RotateCcw className="w-4 h-4 text-pink-400" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          <div className="flex p-1 rounded-2xl bg-black/40 border border-pink-500/20">
            <button
              onClick={() => setViewMode('swipe')}
              className={`p-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'swipe'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-glow-pink'
                  : 'text-pink-200/70 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Swipe Deck</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-glow-pink'
                  : 'text-pink-200/70 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Spatial Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar with Pink Accents */}
      <div className="flex flex-wrap items-center gap-2.5 mb-8 p-3 rounded-2xl glass-panel border border-pink-500/20">
        <SlidersHorizontal className="w-4 h-4 text-pink-300/70 mr-1" />

        {/* College Filter */}
        <select
          value={selectedCollege}
          onChange={(e) => setSelectedCollege(e.target.value)}
          className="px-3 py-1.5 rounded-xl glass-input text-xs bg-[#150a1b] border border-pink-500/20 text-pink-100"
        >
          <option value="">All Connected Campuses</option>
          {colleges.map(col => (
            <option key={col.id} value={col.id}>{col.name}</option>
          ))}
        </select>

        {/* Scope Filter */}
        <select
          value={selectedScope}
          onChange={(e) => setSelectedScope(e.target.value)}
          className="px-3 py-1.5 rounded-xl glass-input text-xs bg-[#150a1b] border border-pink-500/20 text-pink-100"
        >
          <option value="both">My Campus & Nearby</option>
          <option value="same_college">My College ({profile?.college?.shortName || 'Only'})</option>
          <option value="nearby">Nearby Campuses ({profile?.college?.city || 'Local'})</option>
        </select>

        {/* Year Filter */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3 py-1.5 rounded-xl glass-input text-xs bg-[#150a1b] border border-pink-500/20 text-pink-100"
        >
          <option value="">All Academic Years</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
          <option value="4th Year">4th Year</option>
        </select>

        {(selectedCollege || selectedScope !== 'both' || selectedYear) && (
          <button
            onClick={() => {
              setSelectedCollege('');
              setSelectedScope('both');
              setSelectedYear('');
            }}
            className="px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 text-xs font-semibold"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Discovery Interface */}
      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-pink-400 animate-spin" />
          <p className="text-xs text-pink-300/70">Loading student profiles across your campus network...</p>
        </div>
      ) : candidates.length === 0 || currentIndex >= candidates.length ? (
        /* Empty State */
        <div className="max-w-md mx-auto my-12 p-8 rounded-3xl glass-panel-elevated border border-pink-500/25 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-pink-500/15 text-pink-400 flex items-center justify-center mx-auto mb-4 shadow-glow-pink">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">You're All Caught Up!</h2>
          <p className="text-sm text-pink-200/70 mb-6">
            You've reviewed all available student profiles matching your current filters.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setSelectedCollege('');
                setSelectedScope('both');
                setSelectedYear('');
                loadCandidates();
              }}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-sm shadow-glow-pink"
            >
              Reset Filters & Reload
            </button>
            <button
              onClick={handleUndo}
              className="py-3 px-6 rounded-2xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-200 font-semibold text-sm border border-pink-500/20"
            >
              Undo Last Pass Action
            </button>
          </div>
        </div>
      ) : viewMode === 'swipe' ? (
        /* 3D Tactile Swipe Deck */
        <div className="relative flex flex-col items-center justify-center my-4">
          <Card3D
            key={activeProfile.userId}
            profile={activeProfile}
            onLike={handleLike}
            onPass={handlePass}
            onViewDetails={(p) => setInspectProfile(p)}
          />

          {/* Desktop Hotkey Guide Pill */}
          <div className="hidden sm:flex items-center gap-4 mt-6 text-xs text-pink-300/60 font-medium">
            <span><kbd className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-pink-200">←</kbd> Pass</span>
            <span><kbd className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-pink-200">Space</kbd> Inspect Bio</span>
            <span><kbd className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-pink-200">→</kbd> Like</span>
          </div>
        </div>
      ) : (
        /* Spatial Grid View with Pink Tones */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {candidates.slice(currentIndex).map((cand) => (
            <div
              key={cand.userId}
              className="rounded-3xl glass-panel-elevated border border-pink-500/20 overflow-hidden flex flex-col hover:border-pink-400/50 transition-all hover:scale-[1.02] shadow-xl group"
            >
              <div className="relative h-48 overflow-hidden bg-slate-950">
                <img
                  src={cand.avatarUrl}
                  alt={cand.displayName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#150a1b] to-transparent" />
                <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-semibold text-pink-300">
                  {cand.college?.name}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center justify-between">
                    <span>{cand.displayName}, {cand.age}</span>
                    <span className="text-xs text-pink-300/60 font-normal">{cand.year}</span>
                  </h3>
                  <p className="text-xs text-pink-200/70 line-clamp-2 mt-1">{cand.bio}</p>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-pink-500/15">
                  <button
                    onClick={() => handlePass(cand)}
                    className="flex-1 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs"
                  >
                    Pass
                  </button>
                  <button
                    onClick={() => handleLike(cand)}
                    className="flex-1 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 font-bold text-xs border border-pink-400/30"
                  >
                    Like
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3D Celebratory Match Modal */}
      {matchData && (
        <MatchConfetti
          matchData={matchData}
          onClose={() => setMatchData(null)}
          onOpenChat={(match) => {
            setMatchData(null);
            navigate(`/messages/${match.id || match._id || match.matchId || 'match_1'}`);
          }}
        />
      )}

      {/* Detailed Full Profile Inspection Modal */}
      {inspectProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl glass-panel-elevated border border-pink-500/30 p-0 overflow-hidden relative max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Cinematic Cover Banner Header */}
            <div className="relative w-full h-36 sm:h-44 bg-slate-950 overflow-hidden">
              <img
                src={inspectProfile.coverUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1400&q=80'}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#150a1b] via-[#150a1b]/40 to-transparent" />

              <button
                onClick={() => setInspectProfile(null)}
                className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/60 text-white hover:bg-pink-600/80 backdrop-blur-md border border-white/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 pt-0 relative -mt-12 sm:-mt-14">
              <div className="flex items-end gap-4 mb-4">
                <img
                  src={inspectProfile.avatarUrl}
                  alt={inspectProfile.displayName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover object-top border-4 border-[#150a1b] shadow-2xl ring-2 ring-pink-500/60 shadow-glow-pink shrink-0"
                />
                <div className="pt-2">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    {inspectProfile.displayName}, {inspectProfile.age}
                  </h2>
                  <div className="text-xs text-pink-300 font-semibold">{inspectProfile.college?.name}</div>
                  <div className="text-xs text-pink-200/60">{inspectProfile.course} • {inspectProfile.year}</div>
                </div>
              </div>

              <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-pink-300/70 mb-1">About Me</h4>
                <p className="text-sm text-pink-100 leading-relaxed">{inspectProfile.bio}</p>
              </div>

              {inspectProfile.vibePrompt && (
                <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20">
                  <div className="text-xs font-semibold text-pink-300 mb-1">Campus Prompt:</div>
                  <div className="text-sm text-white font-medium italic">"{inspectProfile.vibePrompt}"</div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-pink-300/70 mb-2">Interests & Hobbies</h4>
                <div className="flex flex-wrap gap-2">
                  {inspectProfile.interests?.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl text-xs bg-pink-500/15 border border-pink-400/25 text-pink-200">
                      #{item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => {
                    handlePass(inspectProfile);
                    setInspectProfile(null);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-rose-500/10 text-rose-400 font-bold text-sm hover:bg-rose-500/20"
                >
                  Pass
                </button>
                <button
                  onClick={() => {
                    handleLike(inspectProfile);
                    setInspectProfile(null);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-pink-500/25 text-pink-200 font-bold text-sm hover:bg-pink-500/35 border border-pink-400/40 shadow-glow-pink"
                >
                  Like
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
