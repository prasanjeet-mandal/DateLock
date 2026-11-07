import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle, ArrowRight } from 'lucide-react';

export default function MatchConfetti({ matchData, onClose, onOpenChat }) {
  useEffect(() => {
    if (!matchData) return;

    // Trigger double celebratory confetti cannons in pink and rose gold
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff2d87', '#ff77a9', '#ff007f', '#ffd700', '#ffffff']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff2d87', '#ff77a9', '#ff007f', '#ffd700', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [matchData]);

  if (!matchData) return null;

  const partner = matchData.partner || {};

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md p-8 rounded-3xl glass-panel-elevated border border-pink-500/40 text-center shadow-2xl overflow-hidden"
        >
          {/* Glowing Aura Ring in Pink */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-pink-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/25 rounded-full blur-3xl pointer-events-none" />

          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/25 to-rose-500/25 border border-pink-400/40 text-xs font-bold uppercase tracking-wider text-pink-200 mb-6">
            <Sparkles className="w-4 h-4 text-pink-400 animate-spin" />
            <span>It's a Campus Connection!</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-300 via-rose-300 to-pink-100 bg-clip-text text-transparent mb-2">
            You and {partner.displayName || 'Student'} Matched!
          </h2>

          <p className="text-sm text-pink-200/80 mb-8">
            You both expressed interest. Say hello and break the ice!
          </p>

          {/* Floating Connected Avatars with Glowing Pink Rings */}
          <div className="flex items-center justify-center -space-x-5 mb-8">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-pink-400 to-rose-500 shadow-glow-pink z-10">
              <img
                src={matchData.currentUserAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                alt="You"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-rose-500 to-pink-300 shadow-glow-rose z-20">
              <img
                src={partner.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80'}
                alt={partner.displayName}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => onOpenChat && onOpenChat(matchData.match || matchData)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-glow-pink"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send First Message</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-pink-200/80 font-semibold text-sm transition-all border border-pink-500/10"
            >
              Keep Swiping
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
