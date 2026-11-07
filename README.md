# 🌸 DateLock | Campus Dating & Friendship Platform

> **Private, Intent-Driven Social & Dating Network for Verified College Campuses**  
> *A secure, student-centric platform connecting peers within their college and neighboring institutions.*

---

## ✨ Overview

**DateLock** is an authentic social discovery platform tailored specifically for college students. By removing awkward cold approaches and spammy unsolicited messaging, DateLock allows students to find study partners, hackathon teammates, sports buddies, and romantic connections through mutual consent matching.

---

## 🚀 Key Features

### 1. 🎓 Dynamic Campus Clustering
- **No Hardcoded Geographies:** Rather than locking students to a single predefined city, DateLock dynamically anchors around the student's selected institution, surfacing peers from their campus and neighboring colleges.
- **Academic Context:** Displays degree, branch/stream, academic year, and college badges on student cards.

### 2. ⚡ Dual Connection Modes
- **🤝 Friendship Mode:** Connect with classmates for study circles, hackathons, badminton/sports, campus events, and weekend hangouts.
- **💘 Dating Mode:** Explore genuine dating with verified college peers through icebreaker prompts and shared campus interests.
- **✨ Combined Mode:** Explore both friendship and dating connections simultaneously.

### 3. 🖼️ Profile Customization & Media Uploads
- **Custom Profile Pictures & Cover Photos:** Instant drag-and-drop or file upload for both profile avatars and wide cover banners with live preview and automatic persistent storage.
- **Vibe Prompts & Tags:** Select campus interest tags (`#Coding`, `#SunsetChai`, `#Hackathons`, `#IndieMusic`, `#Badminton`) and customize personal icebreaker questions.

### 4. 🔒 Privacy-First & Mutual Consent Architecture
- **Zero Unsolicited Messages:** Direct chat unlocks strictly when two students mutually match.
- **PII Shielding:** Personal email addresses, phone numbers, and sensitive identifiers are never publicly exposed in feeds or APIs.
- **Real-Time Messaging:** Powered by WebSockets (Socket.IO) with emoji reactions, message search, and unmatch/block safety controls.

### 5. 📬 Email OTP Verification (Personal & Institutional)
- **Registration OTP:** Real-time 6-digit one-time password delivered directly to personal email on signup.
- **Real SMTP Integration:** Out-of-the-box support for Gmail App Passwords, Resend, and standard SMTP relays. In development mode without SMTP credentials, an instant preview fallback ensures uninterrupted testing.
- **Institutional Badging:** Optional college email verification (`@college.edu` / `@college.ac.in`) grants an official blue verification badge.

### 6. 📱 Native Downloadable Apps
- **Windows Desktop App:** Direct `.exe` installer (`DateLock-Setup-v1.0.0.exe`) available on the landing page for Windows 10/11.
- **Android Mobile App:** Direct `.apk` standalone package (`DateLock-Campus-v1.0.0.apk`) available for Android 9.0+.

### 7. 🛡️ Isolated Admin Control Panel (`/vault-panel-7729`)
- **Fortified Security:** Relocated from predictable `/admin` paths to a hardened route requiring a dedicated 2FA Master Passkey.
- **Live Moderation:** Real-time platform metrics, college distribution analytics, user verification approvals, and user report handling.

### 8. 🛡️ Public / Private Route Isolation
- **Intelligent Landing Routing:** Logged-in users are automatically routed to their active module (`/discover`) and cannot view the landing page unless they explicitly log out.

---

## 👥 Pre-Configured Demo Accounts

For testing and evaluation, pre-seeded student and administrator accounts are ready to use:

| Persona | Role | Email | Password | College / Notes |
|---|---|---|---|---|
| **Aarav Sharma** | Student | `student1@demo.com` | `demo123` | B.Tech CSE (3rd Year) |
| **Ananya Verma** | Student | `student2@demo.com` | `demo123` | B.Tech IT & Cyber (2nd Year) |
| **Rohan Mehra** | Student | `student3@demo.com` | `demo123` | B.Tech Mechanical (4th Year) |
| **Platform Admin** | Admin | `admin@demo.com` | `demo123` | 2FA Passkey: `DL_ADMIN_MASTER_SECURE_2026_ROORKEE` |

*(Tip: In development mode, the top 1-Click Persona Bar allows instant switching between accounts without re-entering credentials.)*

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Three.js & `@react-three/fiber`, Framer Motion, Lucide React, Socket.IO Client, Axios.
- **Backend:** Node.js, Express.js, Socket.IO (WebSockets), Nodemailer, JWT authentication, bcryptjs.
- **Security:** Helmet HTTP headers, Content Security Policy (CSP), anti-clickjacking (`X-Frame-Options: DENY`), prototype pollution guardrails, XSS sanitization, brute-force rate limiting.
- **Design System:** Obsidian Rose aesthetic — deep plum/black glassmorphic panels accented with glowing rose, blush pink, and subtle neon highlights.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher

### 1. Installation
Install root dependencies and both client and server packages in one command:
```bash
npm run install:all
```

### 2. Configure Environment Variables (Optional for Real Email)
Create `server/.env` based on `server/.env.example`:
```bash
cp server/.env.example server/.env
```

To enable real Gmail OTP delivery:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=datelock_super_secret_demo_key_2026
ADMIN_SECRET_KEY=DL_ADMIN_MASTER_SECURE_2026_ROORKEE

# Gmail App Password (free setup via https://myaccount.google.com/apppasswords)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM="DateLock Campus" <your_email@gmail.com>
```
*(If left unset, OTPs are printed to the server terminal and shown in the UI preview modal for smooth development.)*

### 3. Start Development Server
Run both client (Port 5173) and backend (Port 5000) concurrently:
```bash
npm run dev
```

- **Frontend Application:** [http://localhost:5173](http://localhost:5173)
- **Backend API & WebSockets:** [http://localhost:5000](http://localhost:5000)
- **Admin Security Vault:** [http://localhost:5173/vault-panel-7729](http://localhost:5173/vault-panel-7729)

### 4. Reset Demo Seed Data Anytime
```bash
npm run seed
```

---

## 🧪 Automated Test Suites

The project includes 56 comprehensive automated tests across security, API endpoints, and email OTP workflows:

```bash
# Run All Tests (56 Tests)
npm --prefix server run test:all

# Run Security & Hardening Suite (24 Tests)
npm --prefix server run test:security

# Run Core API & Matchmaking Suite (21 Tests)
npm --prefix server run test

# Run Email OTP Verification Suite (11 Tests)
npm --prefix server run test:otp
```

---

## 📁 Project Architecture

```
DateLock/
├── client/                      # React 18 + Vite Frontend
│   ├── public/
│   │   └── downloads/           # Static downloads (.exe & .apk packages)
│   ├── src/
│   │   ├── components/          # Reusable UI, 3D Canvas, & Nav components
│   │   ├── context/             # Auth & Theme Context providers
│   │   ├── pages/               # Landing, Discover, Chat, Profile, Admin pages
│   │   └── services/            # Axios API & Socket.IO clients
│   └── package.json
├── server/                      # Node.js + Express Backend
│   ├── downloads/               # Direct binary download repository
│   ├── src/
│   │   ├── config/              # Email transporter & environment config
│   │   ├── controllers/         # Auth, Discover, Match, Profile, Admin logic
│   │   ├── db/                  # JSON storage engine & initial seed data
│   │   ├── middleware/          # JWT, Role Guard, Rate Limiter, XSS Sanitizer
│   │   ├── routes/              # Express API route endpoints
│   │   ├── test/                # Automated test suites (Security, API, OTP)
│   │   └── index.js             # Server entry point & Socket.IO initialization
│   └── package.json
├── package.json                 # Monorepo runner scripts
└── README.md                    # Project documentation
```

---

## 📄 License
This project is developed for educational and campus community demonstration purposes. All rights reserved © 2026 DateLock Platform.
