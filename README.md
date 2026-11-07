# DateLock | College Dating & Friendship Platform

> **Private, 3D Spatial Social Discovery Platform for Roorkee & Nearby Colleges**  
> *MVP Demo Phase – All data and verifications are simulated for demonstration purposes.*

---

## 🌟 Highlights & Features

### 1. 🪐 Immersive 3D Spatial User Interface
- **3D Constellation Hero Scene:** Orbiting campus node graph built with WebGL and Three.js connecting premier Roorkee institutions (IIT Roorkee, COER, Quantum, KLDAV, BSM, RIT, Motherhood, Haridwar, Phonics).
- **Physics-Driven 3D Profile Cards:** Dynamic mouse and gyro tilt parallax with depth layering (`perspective: 1200px`) and realistic shadow occlusion.
- **3D Tactile Swipe Deck:** Natural swipe gestures (drag right to Like, drag left to Pass) with spring physics, inertia, and visual stamp indicators.
- **3D Roorkee Campus Cluster (`/campus-3d`):** Interactive 3D visual cluster where students can click and explore peers from specific colleges.
- **Celebratory 3D Confetti Particles:** Instant celebratory explosion and connected avatar beam upon mutual match.

### 2. ⚡ Ultra User-Friendly & Frictionless UX
- **1-Click Instant Persona Bar:** Persistent floating bar at the top allowing evaluators to switch identities in 1 click between:
  - `Aarav Sharma (IIT Roorkee - 3rd Year CS)`
  - `Ananya Verma (COER University - 2nd Year IT)`
  - `Rohan Mehra (Quantum University - 4th Year Mech)`
  - `Admin (Moderator Portal)`
- **Full Desktop Keyboard Ergonomics:**
  - `←` Left Arrow: Pass
  - `→` Right Arrow: Like
  - `Space` or `↑`: Inspect Full Bio & Prompts
  - `Esc`: Close Modals
- **Undo / Rewind Capability:** One-tap button to undo accidental passes.
- **Dual Mode Morphing:** Instant switch between **🤝 Friendship Mode** (cyan/emerald aurora) and **💘 Dating Mode** (rose/violet neon).
- **Ergonomic Chat with Icebreakers:** Conversation starter prompts, real-time Socket.IO messaging, and 1-tap safety controls.
- **Simulated Verification Portal:** Demonstrates college roll-number verification with official trust badges.
- **Admin Control Panel:** Live metrics, institution distribution charts, verification approval queue, and report moderation.

---

## 🚀 Quick Start Guide

### 1. Start Both Backend & Frontend Concurrently:
```bash
npm run dev
```
- **Frontend:** [http://localhost:5173](http://localhost:5173) (Vite with HMR)
- **Backend API & Socket.IO:** [http://localhost:5000](http://localhost:5000)

### 2. Or Start Separately:
```bash
# Backend (Port 5000)
cd server
npm run dev

# Frontend (Port 5173)
cd client
npm run dev
```

### 3. Reset Demo Seed Data Anytime:
```bash
npm run seed
```
Or click the **"Reset Demo Data"** button directly in the Admin Dashboard or Settings page.

---

## 👥 Pre-Configured Demo Accounts

| Persona | Role | Email | Password | College |
|---|---|---|---|---|
| **Aarav Sharma** | Student | `student1@demo.com` | `demo123` | IIT Roorkee |
| **Ananya Verma** | Student | `student2@demo.com` | `demo123` | COER University |
| **Rohan Mehra** | Student | `student3@demo.com` | `demo123` | Quantum University |
| **Demo Admin** | Admin | `admin@demo.com` | `demo123` | Platform Admin |

*(Tip: You can also use the top 1-Click Persona Bar to switch accounts without entering credentials.)*

---

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Three.js, `@react-three/fiber`, Framer Motion, Lucide Icons, Canvas Confetti, Axios, Socket.IO Client.
- **Backend:** Node.js, Express.js, Socket.IO (WebSockets), JSON relational DB engine with seed scripts, JWT authentication, bcryptjs.
- **Design System:** Spatial glassmorphism, responsive mobile dock, dark/light luminescence themes.
