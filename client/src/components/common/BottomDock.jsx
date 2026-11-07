import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Compass, Globe2, Heart, MessageCircle, User, Shield } from 'lucide-react';

export default function BottomDock() {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  // Hide BottomDock when viewing an active mobile chat room so input/keyboard is full screen
  const isChatRoom = location.pathname.startsWith('/messages/') && location.pathname !== '/messages';
  if (!isAuthenticated || isChatRoom) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto h-16 rounded-3xl glass-panel-elevated border border-pink-500/25 px-2.5 flex items-center justify-around shadow-2xl backdrop-blur-2xl">
        {!isAdmin ? (
          <>
            <Link
              to="/discover"
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
                isActive('/discover')
                  ? 'bg-pink-500/25 text-pink-200 scale-105 border border-pink-400/40 shadow-glow-pink'
                  : 'text-pink-200/50 hover:text-white'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-0.5">Explore</span>
            </Link>

            <Link
              to="/campus-3d"
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
                isActive('/campus-3d')
                  ? 'bg-pink-500/25 text-pink-200 scale-105 border border-pink-400/40 shadow-glow-pink'
                  : 'text-pink-200/50 hover:text-white'
              }`}
            >
              <Globe2 className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-0.5">Campus Map</span>
            </Link>

            <Link
              to="/matches"
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
                isActive('/matches')
                  ? 'bg-rose-500/25 text-rose-200 scale-105 border border-rose-400/40 shadow-glow-rose'
                  : 'text-pink-200/50 hover:text-white'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-0.5">Matches</span>
            </Link>

            <Link
              to="/messages"
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
                isActive('/messages')
                  ? 'bg-pink-500/25 text-pink-200 scale-105 border border-pink-400/40 shadow-glow-pink'
                  : 'text-pink-200/50 hover:text-white'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-0.5">Chat</span>
            </Link>

            <Link
              to="/profile"
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
                isActive('/profile')
                  ? 'bg-fuchsia-500/25 text-fuchsia-200 scale-105 border border-fuchsia-400/40 shadow-glow-fuchsia'
                  : 'text-pink-200/50 hover:text-white'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-0.5">Profile</span>
            </Link>
          </>
        ) : (
          <Link
            to="/vault-panel-7729"
            className="flex items-center gap-2 text-amber-300 font-bold text-sm"
          >
            <Shield className="w-5 h-5" />
            <span>Admin Control Panel</span>
          </Link>
        )}
      </div>
    </div>
  );
}
