import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchApi } from '../services/api';
import { Heart, MessageCircle, MoreVertical, Sparkles, UserX, ShieldCheck, MapPin } from 'lucide-react';

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadMatches = async () => {
    try {
      const res = await matchApi.getMatches();
      setMatches(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const handleUnmatch = async (matchId) => {
    if (!window.confirm('Are you sure you want to unmatch? You will no longer be able to message each other.')) {
      return;
    }
    try {
      await matchApi.unmatch(matchId);
      loadMatches();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 text-pink-50">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>Mutual Matches</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-200 border border-pink-500/35 shadow-glow-pink">
            {matches.length} Connections
          </span>
        </h1>
        <p className="text-xs text-pink-200/70 mt-1">
          Students you've mutually connected with. Start a conversation or coordinate campus hangouts!
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-pink-300/60">Loading your matches...</div>
      ) : matches.length === 0 ? (
        <div className="max-w-md mx-auto my-12 p-8 rounded-3xl glass-panel-elevated border border-pink-500/25 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-pink-500/15 text-pink-400 flex items-center justify-center mx-auto mb-4 shadow-glow-pink">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No Matches Yet</h2>
          <p className="text-sm text-pink-200/70 mb-6">
            Keep exploring student profiles in Discovery. When someone likes you back, they will appear here!
          </p>
          <button
            onClick={() => navigate('/discover')}
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white font-extrabold text-sm shadow-glow-pink"
          >
            Start Swiping in Discover
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {matches.map((item) => {
            const partner = item.partner || {};
            return (
              <div
                key={item.id}
                className="rounded-3xl glass-panel-elevated border border-pink-500/20 overflow-hidden flex flex-col hover:border-pink-400/50 transition-all shadow-xl group"
              >
                {/* Photo Header */}
                <div className="relative h-60 overflow-hidden bg-slate-950">
                  <img
                    src={partner.avatarUrl}
                    alt={partner.displayName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#150a1b] via-transparent to-transparent" />

                  {/* Verification status */}
                  {partner.verificationStatus === 'verified' && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-pink-500/25 backdrop-blur-md border border-pink-400/40 text-[10px] font-bold text-pink-200 flex items-center gap-1 shadow-glow-pink">
                      <ShieldCheck className="w-3 h-3 text-pink-300" />
                      <span>Verified</span>
                    </div>
                  )}

                  {/* College Tag */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-xs text-pink-100 border border-pink-500/20">
                    <MapPin className="w-3 h-3 text-pink-400" />
                    <span>{partner.college?.name || 'Campus'}</span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center justify-between mb-1">
                      <span>{partner.displayName}, {partner.age}</span>
                      <span className="text-xs text-pink-300/60 font-normal">{partner.year}</span>
                    </h3>
                    <p className="text-xs text-pink-200/70 line-clamp-2">{partner.bio}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-pink-500/15">
                    <button
                      onClick={() => navigate(`/messages/${item.id}`)}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-glow-pink hover:opacity-95"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat Now</span>
                    </button>

                    <button
                      onClick={() => handleUnmatch(item.id)}
                      className="p-2.5 rounded-xl bg-pink-500/10 hover:bg-rose-500/25 text-pink-300/70 hover:text-rose-300 transition-all border border-pink-500/15"
                      title="Unmatch"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
