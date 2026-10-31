# ⚡ QuizSphere Pro — Multi-Tier Architecture

QuizSphere Pro is an advanced, full-featured online quiz application cleanly separated into **Frontend**, **Backend**, and **Database** tiers.

---

## 📁 Project Architecture & File Separation

```
quiz-app/
├── 🌐 frontend/                      # Tier 1: Client Application
│   ├── index.html                    # Main HTML5 structure, HUD, and modal dialogs
│   ├── styles.css                    # Design system, themes (dark/light), animations & glassmorphism
│   └── app.js                        # Client-side UI logic, Web Audio synth, TTS & API communication
│
├── ⚙️ backend/                       # Tier 2: Server Application
│   ├── server.js                     # Zero-dependency Node.js REST API server & static host
│   └── package.json                  # Backend package config & scripts
│
├── 💾 database/                      # Tier 3: Data & Storage Layer
│   ├── db.js                         # Database access module (queries, mutations, daily quest algorithms)
│   ├── quizzes.json                  # 62-question bank (categorized, difficulty tiers, clues, explanations)
│   └── scores.json                   # Player scores & global leaderboard records
│
├── package.json                      # Root npm scripts (`npm start`, `npm run dev`)
├── start.bat                         # 1-Click launcher (starts server & opens browser)
├── Launch QuizSphere.bat             # 1-Click desktop shortcut runner
└── README.md                         # Architecture & run documentation
```

---

## 🌟 Tier Overview

### 1. 🌐 Frontend (`/frontend`)
- **`index.html`**: Semantic markup featuring the active quiz dashboard, 8 power-up inventory buttons, live countdown timer, and interactive dialogs (Audience Poll, Ask a Friend, Shop, Badges, Creator).
- **`styles.css`**: Complete responsive stylesheet supporting dark/light mode toggles, gradient accents, timer circular progress, and icy freeze visual effects.
- **`app.js`**: Pure JavaScript application managing game state, Web Audio synthesizer, browser Text-to-Speech (TTS), streak combo multipliers, and asynchronous API calls to the backend.

### 2. ⚙️ Backend (`/backend`)
- **`server.js`**: Lightweight, fast, zero-dependency Node.js server.
- Connects directly to `../database/db.js` for clean separation of concerns.
- Serves static assets from `../frontend`.
- Exposes RESTful endpoints:
  - `GET /api/quizzes`: Returns all quizzes
  - `GET /api/quizzes/:id`: Returns specific quiz with question bank
  - `POST /api/quizzes`: Creates and saves a new custom quiz
  - `DELETE /api/quizzes/:id`: Deletes a custom quiz
  - `GET /api/daily-challenge`: Returns today's deterministic 5-question quest
  - `GET /api/random-quiz`: Returns a randomized question set
  - `GET /api/scores`: Returns global leaderboard
  - `POST /api/scores`: Saves user score & statistics
  - `GET /api/stats`: Returns platform analytics

### 3. 💾 Database (`/database`)
- **`db.js`**: Dedicated data access layer. Encapsulates reading, writing, filtering, seeding, and mathematical seeding for daily challenges.
- **`quizzes.json`**: Persistent JSON database of 62 hand-crafted questions across Technology, Science, Geography, History, and Trivia with Easy, Medium, and Hard tiers.
- **`scores.json`**: Persistent JSON storage for player leaderboard rankings, accuracy, streaks, and timestamps.

---

## 🚀 How to Run

### Method 1: 1-Click Launch (Recommended)
Double-click **`start.bat`** or **`Launch QuizSphere.bat`**.
This starts the backend server and immediately opens **`http://localhost:3000`** in your default browser.

### Method 2: Terminal from Project Root
```bash
npm start
```
*(or `npm run dev` to run with auto-reload)*

### Method 3: Run Backend Directly
```bash
cd backend
node server.js
```
Then visit:
👉 **http://localhost:3000**
