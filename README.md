# SarkariMockTest — Dynamic Web App
## BPSC TRE 4.0 + Bihar STET | Data Structure Test Series

---

## 📁 Files

```
SarkariMockTest/
├── index.html      ← Main entry point
├── style.css       ← All styles (dark theme + responsive)
├── auth.css        ← Auth pages + layout styles
├── auth.js         ← Register / Login / Profile / Leaderboard
├── app.js          ← Quiz logic + Dashboard + Results
├── questions.js    ← 20 Tests × 20 Questions = 400 Questions
└── README.md       ← This file
```

---

## ✅ New Features Added

### 🔐 Authentication System
- **Landing Page** — Professional landing with features list
- **Registration** — Name, Email, Phone, State, Exam target
- **Login** — Email + Password with Remember Me
- **Forgot Password** — Reset functionality
- **Logout** — From header dropdown or mobile menu

### 👤 User Account
- **Profile Page** — Edit name, phone, state, exam target
- **Change Password** — Secure password update
- **Delete Account** — With confirmation dialog

### 📊 Personal Dashboard
- Total tests, total score, avg accuracy, best score
- Recent test results with scores and time
- Topic-wise progress bars

### 🏆 Leaderboard
- All users ranked by total score
- Shows rank, name, state, tests done, score, accuracy
- Highlights current user's position

### 📱 Fully Responsive
- Mobile: Bottom navigation bar, slide-in question palette
- Tablet: Adapted layouts
- Desktop: Full sidebar, header nav, dropdown menus
- All devices: Touch-friendly buttons, proper font sizes

### ⌨️ Keyboard Shortcuts (in quiz)
- `→` or `n` = Next question
- `←` or `p` = Previous question
- `1/a`, `2/b`, `3/c`, `4/d` = Select option

---

## 🌐 How to Deploy LIVE (Free Options)

### Option 1: Netlify Drop (Easiest — 30 seconds)
1. Go to **netlify.com/drop**
2. Drag & drop the **SarkariMockTest** folder
3. Get a live URL instantly (e.g., `dataminds.netlify.app`)
4. Custom domain: Buy domain + connect in Netlify settings

### Option 2: Vercel
1. Push files to GitHub repository
2. Go to **vercel.com** → Import project
3. Auto-deploys on every push

### Option 3: GitHub Pages
1. Create GitHub repository
2. Upload all files
3. Settings → Pages → Source: main branch
4. URL: `username.github.io/dataminds`

### Option 4: Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Option 5: Traditional Web Hosting
- Upload all files to `public_html/` via cPanel File Manager
- Files work as-is (no server needed)

---

## 🚀 Upgrade to Real Backend (Optional)

To connect to a real database (for multi-device sync):

### Firebase Integration (Recommended)
1. Create Firebase project at **console.firebase.google.com**
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Replace `localStorage` calls in `auth.js` with Firebase SDK calls
5. Data persists across devices and browsers

### Backend API (Node.js/PHP/Python)
Replace `DB.get/set` functions in `auth.js` with `fetch()` API calls to your server.

---

## 📱 Device Support
| Device | Support |
|--------|---------|
| Mobile (Android/iOS) | ✅ Full |
| Tablet | ✅ Full |
| Desktop (Chrome/Firefox/Edge/Safari) | ✅ Full |
| PWA (Add to Home Screen) | ✅ Works |

---

*SarkariMockTest — Built for BPSC & Bihar STET Aspirants*
