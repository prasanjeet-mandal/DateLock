import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { Heart, X, Info, ShieldCheck, MapPin, Sparkles, BookOpen } from 'lucide-react';

export default function Card3D({
  profile,
  onLike,
  onPass,
  onViewDetails,
  active = true
}) {
  const cardRef = useRef(null);

  // Motion values for swipe drag
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useAnimation();

  // Dynamic transforms based on drag
  const rotate = useTransform(x, [-250, 250], [-20, 20]);
  const opacity = useTransform(x, [-350, -100, 0, 100, 350], [0.3, 1, 1, 1, 0.3]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -120], [0, 1]);

  // 3D Mouse Tilt values when hovering
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!active || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: -py * 16,
      y: px * 16
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Drag End Handler
  const handleDragEnd = async (event, info) => {
    const threshold = 120;
    if (info.offset.x > threshold) {
      // Swiped Right -> LIKE
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.25 } });
      onLike && onLike(profile);
    } else if (info.offset.x < -threshold) {
      // Swiped Left -> PASS
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.25 } });
      onPass && onPass(profile);
    } else {
      // Return to center
      controls.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 400, damping: 25 } });
    }
  };

  if (!profile) return null;

  return (
    <motion.div
      ref={cardRef}
      style={{
        x,
        y,
        rotate,
        opacity,
        transformStyle: 'preserve-3d',
        perspective: 1200
      }}
      animate={controls}
      drag={active ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[340px] sm:max-w-md h-[490px] sm:h-[540px] md:h-[560px] cursor-grab active:cursor-grabbing select-none rounded-3xl mx-auto"
    >
      {/* 3D Tilt Container with Pink-Tinted Glass */}
      <motion.div
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-full h-full rounded-3xl overflow-hidden glass-panel-elevated border border-pink-500/25 shadow-3d relative flex flex-col"
      >
        {/* Dynamic LIKE & NOPE Stamp Overlays */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-8 left-8 z-30 pointer-events-none border-4 border-pink-400 bg-pink-500/30 backdrop-blur-md text-pink-300 font-extrabold text-2xl sm:text-3xl px-3 sm:px-4 py-1 sm:py-1.5 rounded-2xl rotate-[-15deg] uppercase tracking-wider shadow-glow-pink"
        >
          LIKE 💖
        </motion.div>

        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute top-8 right-8 z-30 pointer-events-none border-4 border-rose-500 bg-rose-500/30 backdrop-blur-md text-rose-300 font-extrabold text-2xl sm:text-3xl px-3 sm:px-4 py-1 sm:py-1.5 rounded-2xl rotate-[15deg] uppercase tracking-wider shadow-lg"
        >
          PASS ✖
        </motion.div>

        {/* Card Background / Avatar with Depth */}
        <div className="relative w-full h-[62%] sm:h-[65%] overflow-hidden bg-slate-950 group">
          <img
            src={profile.avatarUrl}
            alt={profile.displayName}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#150a1b] via-[#150a1b]/40 to-transparent" />

          {/* Connection Mode Tag */}
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
              profile.connectionPreference === 'dating'
                ? 'bg-rose-500/30 text-rose-200 border-rose-400/40'
                : profile.connectionPreference === 'friendship'
                ? 'bg-pink-400/30 text-pink-200 border-pink-300/40'
                : 'bg-fuchsia-500/30 text-fuchsia-200 border-fuchsia-400/40'
            }`}>
              {profile.connectionPreference === 'dating' ? '💘 Dating' : profile.connectionPreference === 'friendship' ? '🤝 Friendship' : '✨ Both'}
            </span>
          </div>

          {/* Simulated Verification Badge */}
          {profile.verificationStatus === 'verified' && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/25 text-pink-200 border border-pink-400/50 backdrop-blur-md shadow-glow-pink">
              <ShieldCheck className="w-3.5 h-3.5 text-pink-300" />
              <span>Verified Student</span>
            </div>
          )}

          {/* College Floating Pill */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-pink-500/20 text-xs font-medium text-pink-100">
            <MapPin className="w-3.5 h-3.5 text-pink-400" />
            <span>{profile.college?.name || 'Roorkee Campus'}</span>
          </div>
        </div>

        {/* Card Body & Details with Pink Tones */}
        <div className="relative flex-1 p-5 flex flex-col justify-between bg-gradient-to-b from-[#150a1b] to-[#0e0612]">
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                {profile.displayName}
                <span className="text-lg font-normal text-pink-300/80">({profile.age})</span>
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300">
                {profile.year || 'Student'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-pink-200/70 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-pink-400/60" />
              <span>{profile.course || 'Degree Program'}</span>
            </div>

            {/* Short Bio */}
            <p className="text-sm text-pink-100/90 line-clamp-2 leading-relaxed">
              {profile.bio}
            </p>

            {/* Interest Tag Cloud */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.interests.slice(0, 3).map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg text-xs bg-pink-500/15 border border-pink-400/25 text-pink-200"
                  >
                    #{typeof item === 'string' ? item.replace(/_/g, ' ') : item}
                  </span>
                ))}
                {profile.interests.length > 3 && (
                  <span className="px-1.5 py-0.5 rounded-lg text-xs text-pink-300/60">
                    +{profile.interests.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Dock */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 pt-1 sm:pt-2">
            <button
              onClick={() => onPass && onPass(profile)}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 hover:bg-rose-500/25 hover:scale-110 active:scale-95 transition-all shadow-lg"
              title="Pass (Left Arrow)"
            >
              <X className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
            </button>

            <button
              onClick={() => onViewDetails && onViewDetails(profile)}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-200 hover:bg-pink-500/25 hover:scale-105 active:scale-95 transition-all"
              title="Inspect Full Bio (Up Arrow)"
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => onLike && onLike(profile)}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-pink-500/20 border border-pink-400/50 flex items-center justify-center text-pink-300 hover:bg-pink-500/35 hover:scale-110 active:scale-95 transition-all shadow-glow-pink"
              title="Like (Right Arrow)"
            >
              <Heart className="w-6 h-6 sm:w-7 sm:h-7 fill-pink-400/30 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
