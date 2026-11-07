import React from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HeroScene3D from '../components/3d/HeroScene3D';
import Card3D from '../components/3d/Card3D';
import {
  Sparkles,
  ShieldCheck,
  Heart,
  Users,
  Compass,
  ArrowRight,
  MapPin,
  Lock,
  Layers,
  GraduationCap,
  Monitor,
  Smartphone,
  Download,
  CheckCircle2
} from 'lucide-react';

const FEATURED_STUDENTS = [
  {
    displayName: 'Aarav Sharma',
    age: 21,
    college: { name: 'Engineering Campus' },
    course: 'B.Tech Computer Science',
    year: '3rd Year',
    bio: 'Late night hackathon survivor, coffee enthusiast. Let’s jam indie songs or collaborate on tech projects!',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    connectionPreference: 'both',
    interests: ['coding', 'indie_music', 'ai', 'night_walks'],
    verificationStatus: 'verified'
  },
  {
    displayName: 'Ananya Verma',
    age: 20,
    college: { name: 'University Campus' },
    course: 'B.Tech IT & Cyber Security',
    year: '2nd Year',
    bio: 'Sketching during lectures and trying to beat everyone at Badminton. Believer in spontaneous midnight Maggi runs.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    connectionPreference: 'dating',
    interests: ['sketching', 'badminton', 'cafe_hopping', 'indie_music'],
    verificationStatus: 'verified'
  }
];

const PARTNER_CAMPUSES = [
  'Institutes of Technology & Engineering',
  'Central & State Universities',
  'Management & Commerce Schools',
  'Design & Architecture Colleges',
  'Medical & Science Campuses',
  'Law & Liberal Arts Colleges'
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, they must not see the visitor landing page
  if (isAuthenticated) {
    return <Navigate to="/discover" replace />;
  }

  return (
    <div className="relative min-h-screen bg-[#0e0612] overflow-hidden text-pink-50">
      {/* 3D WebGL Background Canvas with Pinkish Constellation */}
      <HeroScene3D />

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-24 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Universal Campus Tag in Pink Accent */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-400/30 text-xs font-semibold text-pink-200 backdrop-blur-md mb-6 shadow-glow-pink animate-pulse">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>Private Social & Dating Network for Verified College Campuses</span>
        </div>

        {/* Main Heading with Pinkish Spatial Typography */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
          Meet Your Campus. <br />
          <span className="bg-gradient-to-r from-pink-300 via-rose-400 to-fuchsia-400 bg-clip-text text-transparent">
            Find Your People.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-pink-100/80 max-w-2xl mb-10 leading-relaxed font-normal">
          Discover genuine college peers, build meaningful friendships, and explore dating in an immersive student community centered around your college and nearby institutions.
        </p>

        {/* Call to Actions in Pink Palette */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md justify-center mb-6">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white font-extrabold text-base flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-glow-pink"
          >
            <span>Create Profile</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-100 font-bold text-base flex items-center justify-center gap-2 transition-all backdrop-blur-md shadow-sm"
          >
            <span>Sign In</span>
          </Link>
        </div>

        {/* Quick App Downloads */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          <a
            href="/downloads/DateLock-Setup-v1.0.0.exe"
            download="DateLock-Setup-v1.0.0.exe"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/25 text-xs font-semibold text-pink-200 transition-all hover:border-pink-400/50 hover:text-white"
          >
            <Monitor className="w-3.5 h-3.5 text-pink-400" />
            <span>Download for Windows (.exe)</span>
          </a>
          <a
            href="/downloads/DateLock-Campus-v1.0.0.apk"
            download="DateLock-Campus-v1.0.0.apk"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/25 text-xs font-semibold text-pink-200 transition-all hover:border-pink-400/50 hover:text-white"
          >
            <Smartphone className="w-3.5 h-3.5 text-rose-400" />
            <span>Download Mobile App (.apk)</span>
          </a>
        </div>

        {/* Interactive Card Showcase Preview */}
        <div className="w-full max-w-sm sm:max-w-md my-8 relative">
          <div className="absolute -top-6 -left-6 z-20 px-3 py-1 rounded-xl bg-pink-500/25 border border-pink-400/40 text-[11px] font-bold text-pink-200 backdrop-blur-md shadow-glow-pink">
            ✨ Interactive Student Card (Swipe to Connect)
          </div>
          <Card3D
            profile={FEATURED_STUDENTS[0]}
            onLike={() => navigate('/register')}
            onPass={() => navigate('/register')}
            onViewDetails={() => navigate('/login')}
          />
        </div>
      </section>

      {/* Dual Mode Showcase (Friendship vs Dating) in Pink Tones */}
      <section className="relative z-10 py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-pink-500/15">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Two Connection Modes, Zero Awkwardness
          </h2>
          <p className="text-pink-200/70 max-w-xl mx-auto text-sm sm:text-base">
            Whether you want project teammates, sports buddies, or someone special for evening cafe talks, DateLock lets you set your exact intent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Friendship Mode Card */}
          <div className="p-8 rounded-3xl glass-panel-elevated border border-pink-400/30 hover:border-pink-400/60 transition-all shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-300 mb-6 shadow-glow-pink">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">🤝 Friendship Mode</h3>
            <p className="text-sm text-pink-100/80 leading-relaxed mb-4">
              Find study partners, festival teams, gym buddies, and genuine campus friends based on mutual academic interests and weekend hobbies.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-pink-300 font-semibold">
              <span className="px-2.5 py-1 rounded-lg bg-pink-500/15 border border-pink-500/25">#Hackathons</span>
              <span className="px-2.5 py-1 rounded-lg bg-pink-500/15 border border-pink-500/25">#Badminton</span>
              <span className="px-2.5 py-1 rounded-lg bg-pink-500/15 border border-pink-500/25">#CafeHopping</span>
            </div>
          </div>

          {/* Dating Mode Card */}
          <div className="p-8 rounded-3xl glass-panel-elevated border border-rose-500/30 hover:border-rose-500/60 transition-all shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-300 mb-6 shadow-glow-rose">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">💘 Dating Mode</h3>
            <p className="text-sm text-pink-100/80 leading-relaxed mb-4">
              Explore romantic connections within your campus or nearby colleges with mutual consent matching, icebreakers, and verified student profiles.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-rose-300 font-semibold">
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/25">#SunsetChai</span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/25">#IndieMusic</span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/25">#DeepTalks</span>
            </div>
          </div>
        </div>
      </section>

      {/* Connected Campus Network */}
      <section className="relative z-10 py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-pink-500/15 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-3">
          Connected Campus Network
        </h2>
        <p className="text-sm text-pink-200/70 mb-10 max-w-lg mx-auto">
          When you enter your college details, DateLock automatically matches you with students from your campus and neighboring institutions.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto mb-12">
          {PARTNER_CAMPUSES.map((col, idx) => (
            <div
              key={idx}
              className="px-4 py-2.5 rounded-2xl glass-panel border border-pink-500/20 text-xs sm:text-sm font-semibold text-pink-100 flex items-center gap-2 hover:border-pink-400/50 hover:bg-pink-500/10 transition-all"
            >
              <GraduationCap className="w-4 h-4 text-pink-400" />
              <span>{col}</span>
            </div>
          ))}
        </div>

        {/* 3D Campus Explorer CTA */}
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-400/35 text-sm font-bold text-pink-200 transition-all shadow-glow-pink"
        >
          <span>Find Students Near Your College</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Safety & Trust Pillars */}
      <section className="relative z-10 py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-pink-500/15">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-3xl glass-panel border border-pink-500/15">
            <ShieldCheck className="w-8 h-8 text-pink-400 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">Institutional Verification</h4>
            <p className="text-xs text-pink-200/70 leading-relaxed">
              Real institutional email OTP verification with college badges, keeping communities authentic and accountable.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-pink-500/15">
            <Lock className="w-8 h-8 text-rose-400 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">Privacy First Architecture</h4>
            <p className="text-xs text-pink-200/70 leading-relaxed">
              No public exposure of email, phone numbers, or exact coordinates. Granular visibility controls at all times.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-pink-500/15">
            <Layers className="w-8 h-8 text-fuchsia-400 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">Mutual Consent Only</h4>
            <p className="text-xs text-pink-200/70 leading-relaxed">
              Private chat is unlocked only when both students express mutual interest. Zero unsolicited messages.
            </p>
          </div>
        </div>
      </section>

      {/* Download Apps Section: Windows (.exe) & Android (.apk) */}
      <section id="download" className="relative z-10 py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-pink-500/15">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-400/25 text-xs font-semibold text-pink-300 backdrop-blur-md mb-4 shadow-glow-pink">
            <Download className="w-4 h-4 text-pink-400" />
            <span>Native DateLock Clients</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Get DateLock Everywhere
          </h2>
          <p className="text-sm sm:text-base text-pink-200/70 max-w-xl mx-auto">
            Install DateLock directly on your laptop or smartphone for lightning-fast matching, instant alerts, and an uninterrupted campus experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Windows Download Card */}
          <div className="p-8 rounded-3xl glass-panel-elevated border border-pink-500/25 hover:border-pink-400/50 transition-all flex flex-col justify-between group shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500/30 to-purple-500/20 border border-pink-400/30 flex items-center justify-center text-pink-300 shadow-glow-pink group-hover:scale-105 transition-transform">
                  <Monitor className="w-7 h-7 text-pink-300" />
                </div>
                <span className="px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-[11px] font-bold text-pink-300 uppercase tracking-wider">
                  Windows 10 / 11
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Download for Windows
              </h3>
              <p className="text-xs text-pink-300/70 mb-4 font-mono">
                v1.0.0 Stable • 64-bit Installer (.exe)
              </p>
              <p className="text-sm text-pink-100/80 leading-relaxed mb-6">
                Full-featured desktop application with native keyboard shortcuts, instant desktop notification tray, and fast multi-tab student discovery.
              </p>

              <ul className="space-y-2.5 mb-8 text-xs text-pink-200/80">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  <span>Silent auto-launch & persistent campus notifications</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  <span>Optimized GPU rendering for smooth card swiping</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  <span>Encrypted local session credentials vault</span>
                </li>
              </ul>
            </div>

            <a
              href="/downloads/DateLock-Setup-v1.0.0.exe"
              download="DateLock-Setup-v1.0.0.exe"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 hover:opacity-95 active:scale-95 transition-all shadow-glow-pink"
            >
              <Download className="w-4 h-4" />
              <span>Download for Windows (.exe)</span>
            </a>
          </div>

          {/* Android Mobile App Download Card */}
          <div className="p-8 rounded-3xl glass-panel-elevated border border-rose-500/25 hover:border-rose-400/50 transition-all flex flex-col justify-between group shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500/30 to-pink-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300 shadow-glow-rose group-hover:scale-105 transition-transform">
                  <Smartphone className="w-7 h-7 text-rose-300" />
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-[11px] font-bold text-rose-300 uppercase tracking-wider">
                  Android 9.0+
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Download Mobile App
              </h3>
              <p className="text-xs text-rose-300/70 mb-4 font-mono">
                v1.0.0 Release • Standalone Package (.apk)
              </p>
              <p className="text-sm text-pink-100/80 leading-relaxed mb-6">
                Carry your campus radar everywhere. Instant mutual match alerts, quick chat reply bubbles, and seamless profile editing on the go.
              </p>

              <ul className="space-y-2.5 mb-8 text-xs text-pink-200/80">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>Real-time college proximity discovery radar</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>Instant push alerts for mutual likes & messages</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>Ultra-lightweight APK with zero bloat or trackers</span>
                </li>
              </ul>
            </div>

            <a
              href="/downloads/DateLock-Campus-v1.0.0.apk"
              download="DateLock-Campus-v1.0.0.apk"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 hover:opacity-95 active:scale-95 transition-all shadow-glow-rose"
            >
              <Download className="w-4 h-4" />
              <span>Download Mobile App (.apk)</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-pink-500/15 text-center text-xs text-pink-300/50">
        <p>© 2026 DateLock Platform | Verified Campus Social & Dating Community</p>
        <p className="mt-1 text-[11px] text-pink-300/40">Verified institutional college matching and privacy-first student connections.</p>
      </footer>
    </div>
  );
}
