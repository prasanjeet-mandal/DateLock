# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## College Dating & Friendship Platform

**Version:** 1.0  
**Project Status:** MVP Development – Demo Data Phase  
**Initial Target Market:** Roorkee and nearby colleges, Uttarakhand, India  
**Platform Type:** Web Application  
**Primary Users:** College students aged 18 and above  
**Connection Types:** Friendship and Dating

---

# 1. Product Overview

## 1.1 Product Vision

Build a private, college-focused social networking platform where adult college students can discover other students, build meaningful friendships, explore dating opportunities and communicate in a safer, verified-community environment.

Unlike general dating applications, the platform will focus on college communities, allowing students to discover people from their own institution as well as nearby colleges.

The platform will provide separate friendship and dating preferences, profile discovery, mutual matching, messaging and user safety controls.

## 1.2 Problem Statement

College students often face difficulties when trying to meet new people outside their existing social circles.

Common problems include:

- Limited opportunities to meet students from other colleges.
- Difficulty finding people with similar interests.
- Fake profiles and uncertainty about identity.
- Lack of dedicated platforms for college-based friendships and dating.
- Privacy concerns when using public dating applications.
- Unwanted messages and harassment.

## 1.3 Proposed Solution

A college-exclusive platform that provides:

- **Immersive 3D Visual Experience:** Interactive 3D campus visualizer, spatial 3D card tilt effects, dynamic lighting, and stylized 3D avatars.
- **Ultra User-Friendly Interface:** Zero-friction onboarding, tactile gesture-driven swipe cards, intuitive keyboard navigation, and instant 1-click demo persona switching.
- **College-based student discovery:** Dynamic filtering for institution, year, branch, and nearby colleges.
- **Dual connection preferences:** Seamless separation and toggle between friendship and dating modes.
- **Student profiles:** Expressive profiles with rich interest tags, 3D avatars, and personality prompts.
- **Like and mutual-match functionality:** Physics-based card interactions and celebratory 3D match animations.
- **Private messaging:** Instant chat unlocked exclusively upon mutual match.
- **Profile privacy controls:** Granular visibility toggles, ghost mode, and private details shielding.
- **Safety ecosystem:** Frictionless one-tap blocking, contextual reporting, and transparent moderation.
- **Student verification workflow:** Simulated visual verification badges and trust tiers.

**Current development restriction:** All features must operate using fictional demo data. Real student registration, real identity verification and real personal document collection are out of scope for this phase.

---

# 2. Product Goals and Objectives

## 2.1 Primary Goals

1. Build a fully functional college-focused social discovery platform.
2. Deliver a cutting-edge **3D spatial user interface** (interactive 3D hero, tilt-parallax profile cards, dynamic depth glassmorphism).
3. Ensure an **ultra user-friendly experience** (zero-friction navigation, responsive touch swipe gestures, instant demo persona switching, accessible design).
4. Enable users to discover students from their own and nearby colleges via intuitive filters and spatial visualization.
5. Support both friendship and dating with clear, distinguished visual modes.
6. Provide tactile, physics-driven matching and celebratory feedback animations.
7. Demonstrate a simulated student verification process with visual trust badges.
8. Implement essential privacy, safety controls, and one-tap moderation.
9. Build an intuitive admin dashboard for managing demo users, moderation, and analytics.
10. Establish an architecture with 60 FPS performance and graceful WebGL fallbacks.

## 2.2 Success Criteria for the Demo

The demo will be considered successful when:

- Users can register and log in effortlessly using demo accounts with 1-click persona quick-switching.
- The 3D campus visualizer and interactive 3D hero load smoothly at 60 FPS with zero lag.
- Discovery cards support smooth 3D tilt, tactile physics-based swiping (mouse drag & touch swipe), and keyboard shortcuts.
- Users can create and edit profiles with real-time 3D avatar customizer/preview.
- Users can switch between friendship, dating, or both with instantaneous UI theme adjustments.
- Users can discover demo students across campus categories with zero layout shifts.
- Users can like or pass on profiles, triggering micro-animations.
- Mutual likes trigger a celebratory 3D particle match screen.
- Matched users can exchange demo messages in an ergonomic, modern chat interface.
- Users can block and report other demo profiles in two clicks or taps.
- Admins can manage simulated verification requests with a clear, user-friendly queue.
- Low-power or non-WebGL devices gracefully fall back to optimized 2.5D CSS parallax without functional loss.

---

# 3. Target Audience

## 3.1 Primary Audience

Currently enrolled college and university students aged 18+.

## 3.2 Initial Geographic Focus

Roorkee and nearby areas.

## 3.3 Initial Institution Database

The demo dataset can include fictional students associated with these institutions:

- IIT Roorkee
- COER University
- Quantum University
- KLDAV PG College
- BSM PG College
- Roorkee Institute of Technology
- Motherhood University
- Haridwar University
- Phonics University

These are demo institution references, not confirmed institutional partnerships.

## 3.4 User Types

### A. Student User
- Creates and manages a profile.
- Selects connection preferences.
- Discovers other students.
- Likes or passes on profiles.
- Matches with other users.
- Chats with mutual matches.
- Controls privacy and safety settings.

### B. Administrator
- Views demo users.
- Manages simulated verification requests.
- Reviews reported profiles.
- Manages inappropriate content.
- Suspends or blocks demo accounts.
- Views platform analytics.

---

# 4. User Roles and Permissions

| Feature | Student | Administrator |
|---|---|---|
| View own profile | Yes | Yes |
| Edit own profile | Yes | No |
| Discover students | Yes | Optional |
| Like/pass profiles | Yes | No |
| View mutual matches | Yes | No |
| Chat with matches | Yes | No |
| Block users | Yes | Yes |
| Report users | Yes | Yes |
| Manage verification | No | Yes |
| Review reports | No | Yes |
| Manage users | No | Yes |
| View analytics | No | Yes |

Admin access must be protected through role-based access control.

---

# 5. Functional Requirements

## 5.1 Landing Page

The landing page is the first interaction point, crafted with an immersive 3D aesthetic and ultra-frictionless user onboarding.

### Required Components

- **Sticky Glassmorphic Navigation:** Frosted glass navbar with backdrop-filter blur, logo, connection mode toggle, and quick access buttons.
- **Interactive 3D Hero Section:**
  - Real-time 3D interactive campus globe / floating college network nodes rendered with WebGL (Three.js / React Three Fiber).
  - Cursor tracking & tilt physics where campus nodes gently float, glow, and respond to user mouse hover or device gyroscope.
  - Floating 3D holographic demo profile cards showing live connection previews.
- **Clear Value Proposition:** "Meet Your Campus. Find Your People."
- **Dual Frictionless CTAs:**
  - Primary CTA: **Get Started (Create Account)** with smooth spring animation.
  - **1-Click Instant Demo Access:** Direct jump into a preloaded student session without typing credentials.
- **Interactive Feature Showcase:**
  - 3D interactive comparison toggle between Friendship Mode (blue/emerald aurora glow) and Dating Mode (rose/violet neon glow).
  - Tactile demo card simulator allowing visitors to test-drag a 3D card right on the landing page.
- **Interactive Roorkee Campus Cluster:** Visual showcase of participating colleges (IIT Roorkee, COER, Quantum, etc.) with animated student count badges.
- **Safety, Privacy & Trust Highlights:** Visual trust shields, simulated verification badges, and privacy-first indicators.
- **Responsive Footer:** About, Contact, Privacy Policy, Terms, and quick demo reset trigger.

---

## 5.2 Authentication Module

Designed for maximum user friendliness, eliminating sign-in friction during testing and evaluation.

### Required Features

- User registration with real-time field validation.
- User login with email and password.
- **1-Click Demo Persona Bar:** A dedicated floating demo bar allowing evaluators to sign in instantly as:
  - `Demo Student 1 (IIT Roorkee)`
  - `Demo Student 2 (COER University)`
  - `Demo Student 3 (Quantum University)`
  - `Demo Admin (Moderator)`
- **Auto-Fill Buttons:** One-tap auto-fill for login form credentials.
- Password visibility toggle (eye icon) with tactile micro-interaction.
- Session handling with persistent token/mock session.
- Graceful inline error messages (no jarring full-page reloads).
- Role-based automatic redirection (Students → Discover, Admins → Admin Dashboard).

---

## 5.3 Onboarding Module

A gamified, enjoyable 5-step onboarding flow designed with real-time 3D feedback and minimal typing effort.

### Step 1: Basic Information
- First name & Display name.
- Demo age / birth year (quick stepper or slider).
- Gender selection with friendly pill buttons.
- College/University dropdown with fuzzy search.
- Department/Course & Academic year (1st, 2nd, 3rd, 4th, PG).

### Step 2: 3D Avatar & Visual Styling
- **Interactive 3D Avatar Picker:** Selection of stylized 3D avatars (Memoji/DiceBear 3D/stylized renders) with dynamic lighting preview.
- Photo upload simulation with instant crop and 3D frame preview.
- Dynamic color aura customizer (matches friendship vs. dating vibes).

### Step 3: Bio & Smart Interest Chips
- Short bio with character counter and friendly prompt suggestions ("Coffee enthusiast, late-night coder...").
- **Smart Interest Tag Cloud:** Categorized interest pills (Tech, Music, Gaming, Sports, Arts, Fitness, Anime, Cafe Hopping) for 1-tap multi-selection.
- Personality badges (e.g., Introvert, Night Owl, Weekend Explorer).

### Step 4: Connection & Discovery Preferences
- **Intent Selection:** Friendship, Dating, or Open to Both (dynamic theme tinting).
- **Discovery Scope:** Same College, Nearby Colleges, or All Roorkee Campuses.

### Step 5: Live 3D Profile Preview & Confirmation
- **Interactive 3D Card Preview:** Full holographic 3D card tilt preview reflecting the exact profile the user just built.
- One-tap "Looks Great, Let's Connect!" confirmation button with confetti burst.

---

## 5.4 Student Profile Module

Rich, expressive, and visually captivating profile views featuring spatial depth and user safety.

### Profile Attributes
- **3D Floating Avatar / Photo Header:** Multi-layer card with floating avatar, depth-mapped background, and glowing status aura.
- Display name, age, verified demo badge.
- College name, branch, and graduation year badge.
- Intent badge ("Looking for: Friendship" / "Looking for: Dating").
- Formatted bio and personality prompt cards.
- Interactive interest tag pills with matching icons.
- Simulated verification status badge (Verified Student, Pending, or Unverified).

### Ergonomic Profile Actions
- Primary action dock: **Pass (X)**, **Detailed Bio (Info)**, **Like (Heart)**.
- Contextual safety actions: **Block**, **Report**, **Share Profile Link (Demo)**.
- Tactile hover tilt and 3D button depression on click.

### Privacy Safeguards
- Strict shielding of private data: zero display of email, phone numbers, or exact residential addresses.
- Internal database IDs replaced with obfuscated public slugs.

---

## 5.5 Discovery Module

The core interaction hub, engineered with tactile 3D swipe physics and intuitive user-friendly controls.

### Discovery Visual Modes
1. **3D Tactile Swipe Deck (Default):**
   - Central 3D card stack with realistic depth perspective (`perspective: 1200px`).
   - Physics-based card drag & swipe with rotation inertia (Framer Motion / Spring physics).
   - Dynamic visual indicators as card is dragged: Green glow + "LIKE" stamp on right pull; Red glow + "NOPE" stamp on left pull.
   - Mouse drag for desktop; fluid touch swipe for mobile.
   - Smooth card flip animation to inspect detailed bio and extra prompts.
2. **Interactive 3D Campus Cluster / Grid View (Alternative):**
   - Switchable grid view showcasing profiles grouped by institution.
   - Spatial 3D hover tilt cards with subtle glass sheen.

### User-Friendly Controls & Hotkeys
- **Desktop Keyboard Navigation:**
  - `←` Left Arrow: Pass
  - `→` Right Arrow: Like
  - `↑` Up Arrow: Expand full profile details
  - `↓` Down Arrow: Minimize profile details
  - `Space`: Next profile / Flip card
- **Action Buttons Bar:** Large, ergonomic, color-coded buttons with haptic-style visual pulse.
- **Rewind/Undo Action:** Allows undoing the last accidental pass (essential UX quality-of-life feature).

### Smart Instant Filters
- **Sticky Filter Bar:**
  - Connection Mode: All / Friendship / Dating.
  - Institution: Same Campus vs. Specific Nearby College.
  - Academic Year & Common Interests filter.
- Instant search filter without page reloads.
- Clear empty state with an engaging 3D illustration and "Expand Filters" suggestion when no profiles match.

---

## 5.6 Like and Matching Module

### Tactile Match Experience
- **Mutual Match Celebration:**
  - When a mutual like occurs, an immersive full-screen 3D celebratory modal appears.
  - Floating 3D avatars of both users connecting with a glowing beam and 3D particle confetti.
  - Celebratory copy: *"It's a Campus Connection!"*
  - Instant action buttons:
    - **"Send First Message"** (opens chat immediately).
    - **"Keep Discovering"** (smoothly dismisses modal back to deck).
- **Match List Screen:**
  - Horizontal story-style avatars of new matches with glowing unread halos.
  - Quick-action buttons to jump directly into conversation.
  - Safe unmatch option with clear confirmation modal.

---

## 5.7 Messaging Module

An ergonomic, modern chat interface tailored for college connections.

### Ergonomic & Friendly Chat Features
- **Icebreaker Starter Prompts:** 1-click suggested conversation starters based on shared interests (e.g., *"Ask about their favorite playlist"*, *"Discuss COER vs. IIT tech fests"*).
- Instant message delivery simulation with sent, delivered, and read receipt ticks.
- Rich text, emoji picker, and floating 3D reaction pills (heart, laugh, fire, wave).
- Typing indicator simulation with realistic animated dots.
- Unread badge counters and last message preview.
- Seamless search within active conversations.
- Persistent safety banner in chat header with one-tap **Block** and **Report** buttons.
- Responsive design with virtual keyboard avoidance on mobile devices.

---

## 5.8 Notifications Module

Notifications should be generated for:

- New mutual match.
- New message.
- Verification status change (simulated).
- Profile-related updates.
- Important platform announcements.

### Notification Features

- Notification list.
- Read/unread state.
- Mark all as read.
- Notification timestamp.
- Navigation to relevant page.

---

## 5.9 Verification Module – Demo Simulation

This module demonstrates how future student verification will work.

### Verification Statuses

- Not Submitted.
- Pending.
- Verified.
- Rejected.
- Resubmission Required.

### Demo Verification Workflow

1. User opens verification page.
2. User sees a simulated verification explanation.
3. User submits a fictional verification request.
4. Request appears in the admin dashboard.
5. Admin selects an outcome.
6. User sees the updated status.

### Important Demo Rules

- Do not request real college ID cards.
- Do not request Aadhaar, PAN, bank details or personal documents.
- Do not store real identity documents.
- Use fictional records and simulated document references.
- Clearly label verification as DEMO / SIMULATED.
- Never represent a simulated verification badge as proof of real identity or enrolment.

---

## 5.10 User Safety Module

### Required Features

**Block User**
- Remove the blocked profile from discovery.
- Prevent new interactions.
- Prevent further messaging.

**Report User**
- Select a reason.
- Add an optional description.
- Submit report.
- Display confirmation.

### Report Categories

- Fake profile.
- Harassment.
- Inappropriate content.
- Spam.
- Impersonation.
- Other.

### Additional Features

- Unmatch.
- Hide profile.
- Discovery visibility control.
- Account logout.
- Account deletion simulation.

---

## 5.11 User Settings Module

### Account Settings

- Edit personal profile.
- Change password UI.
- Manage account preferences.
- Logout.
- Delete demo account.

### Privacy Settings

- Enable/disable discovery.
- Control profile visibility.
- Manage blocked users.
- Manage notification preferences.

---

# 6. Admin Dashboard

The admin panel is required for platform management and demo presentation.

## 6.1 Admin Overview

Display:

- Total demo users.
- Active demo users.
- Total matches.
- Total messages.
- Pending demo verifications.
- Verified demo profiles.
- Rejected demo profiles.
- Open reports.

All figures must be generated from demo records and clearly labelled as demo statistics.

## 6.2 User Management

Admin can:

- View demo users.
- Search users.
- Filter by institution.
- View account status.
- Activate or deactivate demo accounts.
- Suspend demo accounts.
- View profile details.

## 6.3 Verification Management

Admin can:

- View pending requests.
- Review fictional submitted information.
- Approve demo requests.
- Reject demo requests.
- Request resubmission.
- Add internal demo notes.

## 6.4 Report Management

Admin can:

- View reports.
- View reported account details.
- Review report reason.
- Change report status.
- Take moderation action.
- Add internal notes.

### Report Statuses

- Pending.
- Under Review.
- Resolved.
- Dismissed.

## 6.5 Analytics

Display:

- Registrations by college.
- Users by connection preference.
- Number of matches.
- Number of conversations.
- Verification status distribution.
- Reports by category.

---

# 7. Application Pages and Routing

The following routes are recommended.

| Route | Page |
|---|---|
| `/` | Landing Page with 3D Hero |
| `/login` | Login with 1-Click Persona Bar |
| `/register` | Registration |
| `/onboarding` | 3D Interactive Onboarding |
| `/discover` | Discover Students (3D Swipe Deck & Spatial Grid) |
| `/campus-3d` | Interactive 3D Campus Cluster / College Explorer |
| `/profile/:id` | Student Profile with 3D Tilt Card |
| `/matches` | Matches & Match Stories |
| `/messages` | Chat List |
| `/messages/:id` | Ergonomic Chat Interface |
| `/notifications` | Notifications |
| `/verification` | Demo Verification Portal |
| `/settings` | Account & Privacy Settings |
| `/privacy` | Privacy Policy |
| `/terms` | Terms & Conditions |
| `/admin` | Admin Dashboard |
| `/admin/users` | User Management |
| `/admin/verifications` | Verification Management |
| `/admin/reports` | Report Management |
| `/admin/analytics` | Analytics |

All protected routes must require the appropriate demo login and role.

---

# 8. User Journey

## 8.1 Student Journey

1. Visit landing page.
2. Click Get Started.
3. Register or use a demo account.
4. Complete onboarding.
5. Create a student profile.
6. Select friendship, dating or both.
7. Choose discovery preferences.
8. Open Discover.
9. Browse demo student profiles.
10. Like or pass.
11. Receive a mutual match.
12. Open Messages.
13. Communicate with the matched demo user.
14. Manage profile and privacy settings.

## 8.2 Admin Journey

1. Login using the demo admin account.
2. Open Admin Dashboard.
3. Review platform statistics.
4. View demo users.
5. Open verification queue.
6. Approve or reject simulated requests.
7. Review user reports.
8. Take moderation actions.
9. View analytics.

---

# 9. UI/UX Requirements

## 9.1 Immersive 3D Design Language & Visual Aesthetics

The platform features an avant-garde, spatial 3D aesthetic blending futuristic glassmorphism with college warmth.

### Visual Style & 3D Elements
- **Spatial Glassmorphism (Depth Glass):**
  - Multi-layered frosted glass panels (`backdrop-filter: blur(16px)` to `blur(24px)`).
  - Subtle glowing specular borders and realistic ambient occlusion drop-shadows.
  - Layered visual depth where background, cards, UI controls, and modals live in distinct Z-planes.
- **Interactive 3D Canvas Elements (WebGL / Three.js / React Three Fiber):**
  - **3D Hero Scene:** Orbiting campus node constellation connecting Roorkee institutions with glowing pulse vectors that respond to pointer movement.
  - **3D Campus Explorer:** Visual node graph where users can pan, zoom, and select college spheres to discover active students.
  - **Stylized 3D Avatars:** Expressive 3D Memoji-style student avatars with real-time lighting previews during onboarding.
- **Physics-Driven 3D Tilt & Holographic Cards:**
  - CSS 3D perspective (`perspective: 1200px`, `transform-style: preserve-3d`).
  - Cards dynamically tilt towards mouse cursor or phone gyroscope angle.
  - Internal element layering: Avatars pop out with +20px Z-translation, while badges and name tags float with distinct parallax depth.
- **Dynamic Dual-Mode Theme Morphing:**
  - **Friendship Mode:** Vibrant cyan, electric sky-blue, and emerald aurora glow.
  - **Dating Mode:** Neon violet, velvet rose, and magenta sunset glow.
  - Instant fluid color transitions when toggling preference modes.
- **Tactile Micro-Interactions & Particle Physics:**
  - Fluid spring-physics card swiping with inertia, bounce-back, and rotation angles.
  - 3D celebration fireworks and confetti particle explosion upon mutual match.
  - Tactile 3D button press depth (`transform: translateY(2px) scale(0.98)`).

---

## 9.2 Human-Centric & Ultra User-Friendly Design Principles

Designed to provide zero cognitive friction, welcoming students with an intuitive, joyful interface.

### Zero-Friction Experience
- **1-Click Demo Persona Bar:** Persistent floating bar at the screen edge to instantly switch identities between demo students and admin without re-entering credentials.
- **Undo / Rewind Capability:** Ability to undo the previous pass decision, removing the fear of accidental swipes.
- **Smart Filter Chips:** Instant single-tap filter toggles for Campus, Batch Year, and Interests with zero page reloads.
- **Delightful Empty States:** When no profiles match filters, display animated 3D illustrations with a helpful 1-click "Reset Filters" action.

### Desktop & Mobile Ergonomics
- **Mobile-First Touch Gestures:**
  - Fluid swipe right (Like) and swipe left (Pass) with visual feedback stamps ("LIKE" in emerald, "PASS" in ruby).
  - Pull-to-refresh to fetch new candidate profiles.
  - Virtual keyboard awareness: messaging input shifts cleanly without obscuring active messages.
  - Ergonomic bottom navigation dock within easy reach of the user's thumb.
- **Full Desktop Keyboard Accessibility:**
  - Arrow keys: `←` Pass, `→` Like, `↑` Expand profile, `↓` Collapse profile.
  - `Space`: Flip card for bio prompts.
  - `Esc`: Close modals and chat drawers.

### Accessibility & Inclusive Design (WCAG 2.1 AA)
- High-contrast text ratios for effortless legibility across light and dark modes.
- Clear ARIA labels for screen readers across all interactive 3D elements.
- **Reduced Motion Support:** Respects `prefers-reduced-motion` media query by gracefully replacing 3D camera orbits and flying particles with elegant subtle fades.
- Visible focus rings for seamless keyboard tab navigation.

### Navigation Architecture
- **Student User Navigation:**
  - **Desktop:** Floating glass top navigation with Logo, Mode Selector, Discover, 3D Campus, Matches, Messages, Notifications, and Profile Avatar.
  - **Mobile:** Floating glass bottom navigation bar with thumb-accessible icons and glowing active pills.
- **Floating Demo Quick-Action Widget:** Small unobtrusive pill giving instant access to reset the seed dataset, switch demo personas, or view demo tips.
- **Admin Dashboard Navigation:** Clean sidebar layout focused on productivity, moderation queues, user tables, and analytics.

---

# 10. Technical Architecture

The following modern stack is tailored for high performance, smooth 3D rendering, and responsive interactions.

## 10.1 Frontend Stack

- **Framework:** React.js (v18+) with Vite for ultra-fast HMR and bundling.
- **Styling:** Tailwind CSS with custom glassmorphism, perspective, and neon gradient utility classes.
- **3D Graphics & Canvas:**
  - **Three.js** core rendering engine.
  - **@react-three/fiber (R3F):** Declarative React wrapper for Three.js canvas components.
  - **@react-three/drei:** Useful 3D helpers (OrbitControls, Float, Stars, Text3D, Html).
- **Animation & Physics:**
  - **Framer Motion (`framer-motion`):** Gesture-based drag physics, layout animations, and 3D card tilt orchestration.
  - **Canvas Confetti:** Lightweight 3D particle celebration bursts.
- **Icons:** Lucide React for consistent, modern icons.
- **Routing:** React Router v6.
- **State Management:** React Context API + LocalStorage persistence for demo sessions.
- **API Client:** Axios / Native Fetch with structured response wrappers.

## 10.2 Backend Stack

- **Runtime:** Node.js (v18+ LTS).
- **Framework:** Express.js with modular route architecture.
- **Real-Time Communication:** Socket.IO for instant live messaging and mutual match broadcasts.
- **Authentication:** JWT (JSON Web Tokens) with cookie/bearer support and mock demo token generation.
- **Validation:** Joi or Zod for rigorous request validation.

## 10.3 Database & Seed Architecture

- **Database:** MySQL 8.0.
- **ORM / Query Builder:** Prisma or Knex.js / MySQL2 pool.
- **Automated Seed Scripts:** Deterministic script (`npm run seed`) creating complete demo entities:
  - 9 Roorkee & nearby colleges.
  - 50+ diverse fictional student profiles with 3D avatar identifiers.
  - Pre-seeded mutual matches, conversational message histories, and moderation reports.

## 10.4 3D Performance & Progressive Enhancement Architecture

- **Target Framerate:** Solid 60 FPS across standard consumer laptops and mobile devices.
- **Dynamic WebGL Detection:** System checks for WebGL availability on mount.
- **Graceful Fallback Mode:**
  - If WebGL is unavailable or the user activates "Low Power Mode", 3D canvas scenes gracefully fall back to optimized 2.5D CSS parallax layers and lightweight SVGs.
  - Card tilt physics seamlessly switch from WebGL shaders to lightweight CSS transform matrices.
- **Resource Optimization:** Low polygon counts for 3D meshes, compressed textures, and lazy mounting of 3D canvas components using `React.lazy` and `Suspense`.

---

# 11. Database Requirements

The following entities are recommended.

| Table | Purpose |
|---|---|
| `users` | Login credentials and roles |
| `student_profiles` | Student profile information |
| `colleges` | Institution records |
| `interests` | Available interests |
| `user_interests` | Student-interest relationships |
| `user_preferences` | Dating/friendship preferences |
| `likes` | Like and pass records |
| `matches` | Mutual match records |
| `conversations` | Chat conversations |
| `messages` | Chat messages |
| `notifications` | User notifications |
| `verification_requests` | Simulated verification requests |
| `blocks` | Blocked user relationships |
| `reports` | User reports |
| `admin_actions` | Administrative activity log |

### Database Rules

- Use primary and foreign keys.
- Apply appropriate indexes.
- Prevent duplicate likes and matches.
- Validate relationships between users.
- Restrict access to administrative records.
- Store timestamps consistently.
- Use migrations and seed scripts.

---

# 12. Non-Functional Requirements

## 12.1 Performance & 3D Frame Budget

- **60 FPS Animation Target:** All 3D canvas interactions, card tilt effects, and gesture-driven card swipes must execute at 60 frames per second without stutter or frame drops.
- **Lightweight 3D Asset Loading:** 3D scene bundles, shaders, and geometry assets must be lazy-loaded, staying below 500KB initial chunk weight.
- **Low Interaction Latency:** Touch and drag gesture response time must be under 50ms.
- **Hardware-Accelerated Rendering:** Leverage GPU-accelerated CSS transforms (`translate3d`, `will-change`) and WebGL canvas buffers.
- **Intelligent Canvas Pause:** Automatically pause 3D render loops (`cancelAnimationFrame`) when canvas is out of viewport view to preserve battery life.
- Use pagination/virtual scrolling for discovery and messages.
- Optimise profile images with modern WebP formatting.

## 12.2 Security

- Hash passwords using bcrypt or Argon2.
- Validate all incoming data.
- Protect admin routes with role verification.
- Implement rate limiting.
- Prevent unauthorised access to private messages.
- Apply server-side permission checks.
- Avoid exposing internal database details.

## 12.3 Reliability & Graceful Fallbacks

- Handle API failures gracefully with non-blocking toast notifications.
- Automatic fallback from WebGL 3D to 2.5D CSS parallax on unsupported or low-tier devices.
- Provide skeleton loading states for profile cards and conversation lists.
- Provide clear, actionable error messages with one-click retry.
- Maintain data consistency and avoid duplicate matches or notifications.

## 12.4 Responsiveness & Ergonomics

The platform must deliver a flawless, tailored experience on:

- **Desktop & Laptops:** Fluid mouse hover parallax, cursor tracking, and complete keyboard shortcuts.
- **Tablets:** Adaptive layout supporting both landscape grid and portrait swipe deck.
- **Mobile Browsers (iOS Safari, Android Chrome):**
  - Native feel with touch drag inertia, card swipe-to-dismiss, and haptic feedback simulation.
  - Floating bottom glass tab bar ergonomically placed for one-handed thumb navigation.
  - Viewport-aware layout preventing address bar jump and virtual keyboard overlap.

## 12.5 Accessibility & Inclusivity (WCAG 2.1 AA)

- Full keyboard navigability across all screens.
- Screen reader accessible labels (`aria-label`) on all 3D canvas buttons and visual tags.
- `prefers-reduced-motion` compliance: smoothly disables rapid 3D rotations, particle bursts, and parallax tilts for motion-sensitive users.

## 12.5 Maintainability

- Use reusable components.
- Separate frontend and backend logic.
- Follow a consistent folder structure.
- Maintain readable code.
- Use environment variables.
- Document API endpoints.
- Keep seed data separate from application logic.

---

# 13. Demo Data Requirements

This section is mandatory for the current phase.

## 13.1 Sample Dataset

Recommended initial seed dataset:

| Data Type | Suggested Quantity |
|---|---:|
| Demo colleges | 9 |
| Demo student accounts | 40–60 |
| Demo admin accounts | 1–2 |
| Student interests | 25–30 |
| Demo likes | 40–60 |
| Demo matches | 15–25 |
| Demo conversations | 10–15 |
| Demo messages | 100–150 |
| Demo verification requests | 15–20 |
| Demo reports | 5–10 |

These quantities are development targets, not real platform statistics.

## 13.2 Demo Profile Distribution

Include a balanced variety of fictional profiles with different:

- Colleges.
- Courses.
- Academic years.
- Interests.
- Personalities.
- Friendship preferences.
- Dating preferences.
- Discovery preferences.

Use appropriate placeholder profile images or licensed assets. Do not use real students' photographs without permission.

## 13.3 Demo Account Behaviour

The demo environment should support:

- Login using sample accounts.
- Switching between demo student accounts.
- Testing likes and mutual matches.
- Testing messages.
- Testing blocking and reporting.
- Testing admin moderation.
- Resetting the demo dataset.

## 13.4 Demo Labels

Show a visible but unobtrusive notice:

**DEMO ENVIRONMENT – All student profiles, verification statuses and activity are simulated.**

---

# 14. MVP Scope

## Phase 1 – Current Development

Build the complete UI and functional workflows using demo data.

Included:

- Landing page.
- Authentication simulation.
- Student onboarding.
- Student profiles.
- Discovery.
- Likes and matching.
- Messaging.
- Notifications.
- Simulated verification.
- User settings.
- Safety controls.
- Admin dashboard.
- Demo analytics.

## Phase 2 – Real User Readiness

After the demo is validated:

- Real account registration.
- Secure authentication.
- Age assurance.
- Current enrolment verification policy.
- Manual verification dashboard.
- Secure document handling, if legally necessary.
- Real-time messaging.
- Privacy and consent management.
- Security testing.
- Moderation and incident response processes.

## Phase 3 – Controlled Campus Pilot

- Start with one approved campus.
- Invite eligible adult students.
- Monitor onboarding and engagement.
- Review safety reports.
- Gather user feedback.
- Expand to additional colleges only after reviewing pilot results.

---

# 15. Out of Scope for Current Demo

The following must not be implemented as real services during the current demo phase:

- Real college ID collection.
- Real identity verification.
- Aadhaar verification.
- Real student database integration.
- Real payment processing.
- Paid subscriptions.
- Real email or SMS OTP delivery.
- Live location tracking.
- Public launch.
- Actual institutional partnership claims.
- Real student personal information.

These features can be evaluated separately for future phases.

---

# 16. Acceptance Criteria

The MVP demo will be accepted when all the following tests pass:

| ID | Acceptance Test | Expected Result |
|---|---|---|
| AC-01 | Login with demo student account | Successful login |
| AC-02 | Login with demo admin account | Admin dashboard opens |
| AC-03 | Invalid login | Appropriate error |
| AC-04 | Complete onboarding | Profile is created |
| AC-05 | Edit profile | Updated information is saved |
| AC-06 | Open discovery | Eligible demo profiles appear |
| AC-07 | Apply college filter | Matching profiles appear |
| AC-08 | Like another profile | Like is recorded |
| AC-09 | Mutual like | Match is created |
| AC-10 | Open match conversation | Chat opens |
| AC-11 | Send message | Message is saved and displayed |
| AC-12 | Block a user | Further interaction is prevented |
| AC-13 | Submit a report | Report appears in admin panel |
| AC-14 | Submit demo verification | Request appears in admin queue |
| AC-15 | Admin approves request | Demo status changes to verified |
| AC-16 | Admin rejects request | Demo status changes to rejected |
| AC-17 | Change privacy setting | Discovery visibility updates |
| AC-18 | Delete demo account | Account is removed or deactivated according to demo rules |
| AC-19 | Open application on mobile | Responsive layout with bottom dock and touch swipe works |
| AC-20 | Reset demo data | Seed dataset is restored |
| AC-21 | 1-Click Demo Persona Switch | Instant account switch without re-typing credentials |
| AC-22 | 3D Hero Scene & Campus Map | WebGL canvas renders at 60 FPS with cursor reaction |
| AC-23 | 3D Profile Card Tilt & Swipe | Physics-based drag & swipe with inertia and keyboard hotkeys |
| AC-24 | 3D Match Celebration | Full-screen 3D particle celebration and action modal |
| AC-25 | 3D Avatar Customizer | Real-time 3D lighting/styling preview during onboarding |
| AC-26 | WebGL Fallback Mode | Graceful 2.5D CSS parallax fallback on low-power devices |
| AC-27 | Rewind / Undo Action | Restores the immediately preceding passed profile |

---

# 17. Development Priority

| Priority | Module | Importance |
|---|---|---|
| P0 | 3D Design System & Glassmorphic Shell | Critical |
| P0 | Authentication & 1-Click Demo Persona Switcher | Critical |
| P0 | Student Onboarding with 3D Avatar Preview | Critical |
| P0 | Student Profiles & 3D Tilt Cards | Critical |
| P0 | Discovery (3D Tactile Swipe Deck + Hotkeys) | Critical |
| P0 | Likes, Rewind & 3D Match Celebration | Critical |
| P0 | Ergonomic Messaging with Icebreakers | Critical |
| P0 | Admin Dashboard & Moderation Queue | Critical |
| P0 | Demo Verification Workflow | Critical |
| P0 | Block and Report System | Critical |
| P1 | Interactive 3D Campus Explorer (`/campus-3d`) | High |
| P1 | Notifications & Real-Time Socket Events | High |
| P1 | Privacy Settings & Ghost Mode | High |
| P1 | Analytics & Charts | High |
| P2 | Advanced 3D Shaders & Campus Orbit Controls | Medium |
| P2 | Sound Effects & Micro-Haptics Toggle | Medium |
| P2 | Additional Profile Badges & Custom themes | Medium |

---

# 18. Risks and Mitigation

| Risk | Mitigation |
|---|---|
| Fake or misleading verification | Clearly mark all demo verification as simulated |
| Exposure of personal information | Use fictional data only |
| Unauthorised admin access | Implement role-based access control |
| Duplicate matching records | Enforce database constraints |
| Messaging abuse | Implement block and report flows |
| Poor mobile experience | Mobile-first testing |
| Demo data confusion | Add visible demo labels |
| Future legal compliance gaps | Conduct legal and privacy review before real-user launch |

---

# 19. Final Product Definition

The final demo should demonstrate a complete college-based social discovery experience.

A user should be able to:

1. Enter the platform.
2. Log in using a demo account.
3. Complete a student profile.
4. Select friendship or dating preferences.
5. Discover students from different colleges.
6. Like profiles.
7. Receive mutual matches.
8. Chat with matched users.
9. Manage privacy settings.
10. Block or report users.

An administrator should be able to:

1. Access the admin dashboard.
2. Manage demo student accounts.
3. Review simulated verification requests.
4. Moderate demo reports.
5. View demo analytics.

**Final development principle:** Build a complete, connected and functional demo product rather than a collection of static UI screens. Every primary button, form, filter, navigation item and dashboard action must perform its intended function using demo data.

The application must remain isolated from real student data until a separate production-readiness decision is made.