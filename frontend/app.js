/**
 * QuizSphere Pro — Core Application Engine
 * Implements:
 * 1. 50-50 Lifeline (removes 2 incorrect choices)
 * 2. Skip Question (skip without points/streak penalty)
 * 3. Hint (reveal small clue with -20 pts deduction)
 * 4. Time Freeze (pauses timer for 7 seconds with icy visual effect)
 * 5. Double Points (risk current question for 2× points and XP)
 * 6. Extra Time (+15 bonus seconds on timer)
 * 7. Audience Poll (simulated animated percentage poll with difficulty weighting)
 * 8. Ask a Friend (phone-a-friend with persona quote & confidence meter)
 * 9. Streak System (rewards consecutive answers with escalating bonus points)
 * 10. Combo Multiplier (1.0x -> 1.2x -> 1.5x -> 1.7x -> 2.0x -> 2.5x)
 * 11. Difficulty Levels (Easy, Medium, Hard with increasing rewards)
 * 12. Achievements & Badges (10 unlockable achievements with coin bonuses & toasts)
 * 13. Leaderboard (Global hall of fame with rank, avatar, difficulty, time)
 * 14. Daily Challenge (Deterministic daily quest with streak tracking & 2x rewards)
 * 15. Random Question Mode (Dynamic shuffled questions & randomized options)
 * 16. Category Selection (Subject filters and multi-topic gauntlets)
 * 17. Power-ups Inventory (Persistent inventory earned via gameplay + coin shop)
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. Web Audio Synthesizer (Native Web Audio API)
  // ==========================================================================
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.enabled = localStorage.getItem('quiz_sound_enabled') !== 'false';
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('quiz_sound_enabled', this.enabled);
      return this.enabled;
    }

    playCorrect() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.18, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.28);
      });
    }

    playWrong() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.35);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    }

    playTick() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    }

    playFanfare() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [
        { f: 261.63, t: 0.0 },
        { f: 329.63, t: 0.12 },
        { f: 392.00, t: 0.24 },
        { f: 523.25, t: 0.36 },
        { f: 659.25, t: 0.50 }
      ];

      notes.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, now + n.t);

        gain.gain.setValueAtTime(0.2, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + n.t);
        osc.stop(now + n.t + 0.8);
      });
    }

    playClick() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    }

    playCoin() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    }

    playFreeze() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.4);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    }

    playBoost() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.35);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    }

    playCrowd() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [440, 554, 659, 880].forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.05);
        gain.gain.setValueAtTime(0.12, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + 0.6);
      });
    }
  }

  const sound = new SoundManager();

  // ==========================================================================
  // 2. Confetti Particle Generator
  // ==========================================================================
  function launchConfetti(count = 75) {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    container.innerHTML = '';

    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.top = '-20px';
      piece.style.transform = `scale(${0.6 + Math.random() * 0.8}) rotate(${Math.random() * 360}deg)`;
      piece.style.animationDuration = `${2.5 + Math.random() * 2}s`;
      piece.style.animationDelay = `${Math.random() * 0.7}s`;
      container.appendChild(piece);
    }

    setTimeout(() => {
      container.innerHTML = '';
    }, 5500);
  }

  // Toast Notification System
  function showToast(icon, title, desc) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'quiz-toast';
    toast.innerHTML = `
      <div class="quiz-toast-icon">${icon}</div>
      <div>
        <div class="quiz-toast-title">${escapeHTML(title)}</div>
        <div class="quiz-toast-desc">${escapeHTML(desc)}</div>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(60px)';
      setTimeout(() => toast.remove(), 350);
    }, 4500);
  }

  // ==========================================================================
  // 3. Application State & Storage
  // ==========================================================================
  // Initial Power-Ups Inventory Definition
  const DEFAULT_INVENTORY = {
    fiftyFifty: 2,
    skip: 2,
    hint: 3,
    freeze: 2,
    doublePoints: 2,
    extraTime: 2,
    audiencePoll: 2,
    askFriend: 2
  };

  // Power-Ups Metadata Catalog
  const POWERUPS_CATALOG = [
    {
      id: 'fiftyFifty',
      name: '50-50 Lifeline',
      icon: '🪄',
      desc: 'Removes 2 incorrect choices, giving you a 50% chance.',
      costSingle: 50,
      costBundle: 120,
      bundleQty: 3
    },
    {
      id: 'skip',
      name: 'Skip Question',
      icon: '⏭️',
      desc: 'Skip any tough question without losing points or resetting your streak.',
      costSingle: 60,
      costBundle: 150,
      bundleQty: 3
    },
    {
      id: 'hint',
      name: 'Smart Hint',
      icon: '💡',
      desc: 'Reveals an educational clue (costs -20 pts if answered correctly).',
      costSingle: 40,
      costBundle: 100,
      bundleQty: 3
    },
    {
      id: 'freeze',
      name: 'Time Freeze',
      icon: '❄️',
      desc: 'Pauses the question countdown timer for 7 full seconds.',
      costSingle: 50,
      costBundle: 120,
      bundleQty: 3
    },
    {
      id: 'doublePoints',
      name: '2× Double Points',
      icon: '2️⃣',
      desc: 'High risk: gamble current question for 2× points & XP, or lose 50 pts.',
      costSingle: 60,
      costBundle: 150,
      bundleQty: 3
    },
    {
      id: 'extraTime',
      name: '+15s Extra Time',
      icon: '⏳',
      desc: 'Adds 15 bonus seconds directly to the current question clock.',
      costSingle: 50,
      costBundle: 120,
      bundleQty: 3
    },
    {
      id: 'audiencePoll',
      name: 'Audience Poll',
      icon: '📊',
      desc: 'Displays simulated percentage votes from 500 audience members.',
      costSingle: 60,
      costBundle: 150,
      bundleQty: 3
    },
    {
      id: 'askFriend',
      name: 'Ask a Friend',
      icon: '📞',
      desc: 'Call a virtual trivia genius for their recommendation & confidence rating.',
      costSingle: 60,
      costBundle: 150,
      bundleQty: 3
    }
  ];

  // Achievements Definition Catalog
  const ACHIEVEMENTS_CATALOG = [
    {
      id: 'first_victory',
      title: 'First Victory',
      icon: '🎯',
      desc: 'Complete your first quiz on QuizSphere.',
      rewardCoins: 50
    },
    {
      id: 'ten_correct',
      title: '10 Correct Answers',
      icon: '🔟',
      desc: 'Accumulate 10 total correct answers across quizzes.',
      rewardCoins: 50
    },
    {
      id: 'perfect_round',
      title: 'Perfect Round',
      icon: '💯',
      desc: 'Finish any quiz with a flawless 100% score.',
      rewardCoins: 100
    },
    {
      id: 'speed_demon',
      title: 'Speed Demon',
      icon: '⚡',
      desc: 'Complete a quiz with an average speed under 5 seconds per question.',
      rewardCoins: 75
    },
    {
      id: 'streak_master',
      title: 'Streak Master',
      icon: '🔥',
      desc: 'Achieve a 5-question answer streak.',
      rewardCoins: 60
    },
    {
      id: 'untouchable',
      title: 'Untouchable',
      icon: '🌟',
      desc: 'Achieve an 8-question answer streak.',
      rewardCoins: 100
    },
    {
      id: 'power_player',
      title: 'Power Player',
      icon: '🧪',
      desc: 'Utilize 3 or more power-ups in a single quiz session.',
      rewardCoins: 60
    },
    {
      id: 'daily_victor',
      title: 'Daily Victor',
      icon: '📅',
      desc: 'Complete a Daily Challenge quest.',
      rewardCoins: 100
    },
    {
      id: 'coin_collector',
      title: 'Coin Collector',
      icon: '🪙',
      desc: 'Accumulate 300 or more Quiz Coins in your wallet.',
      rewardCoins: 50
    },
    {
      id: 'grand_scholar',
      title: 'Grand Scholar',
      icon: '👑',
      desc: 'Advance your player progression to Level 3 or higher.',
      rewardCoins: 100
    }
  ];

  // ==========================================================================
  // Embedded Question Bank (Offline & Static Deployment Support)
  // ==========================================================================
  const DEFAULT_QUIZZES = [
  {
    "id": "web-dev",
    "title": "Modern Web & JavaScript",
    "description": "Test your mastery of JavaScript, CSS layout models, DOM, and modern web architecture.",
    "category": "Technology",
    "icon": "🌐",
    "timePerQuestion": 20,
    "questions": [
      {
        "id": "wd-1",
        "question": "Which HTTP status code signifies that a resource has been permanently moved to a new URI?",
        "options": [
          "301 Moved Permanently",
          "302 Found",
          "307 Temporary Redirect",
          "404 Not Found"
        ],
        "correct": 0,
        "difficulty": "Easy",
        "hint": "It is in the 3xx redirection family and specifically marks permanent moves for SEO.",
        "explanation": "HTTP 301 indicates that the requested resource has been definitively assigned a new permanent URI."
      },
      {
        "id": "wd-2",
        "question": "What is the primary difference between 'let' and 'var' in modern JavaScript?",
        "options": [
          "'let' is block-scoped while 'var' is function-scoped",
          "'var' cannot be reassigned while 'let' can",
          "'let' is hoisted to the top of the script and initialized with null",
          "There is no difference in ES6+"
        ],
        "correct": 0,
        "difficulty": "Easy",
        "hint": "Think about code blocks wrapped in curly braces { } like if-statements and loops.",
        "explanation": "'let' declarations are block-scoped (confined to the enclosing pair of braces) and enter the Temporal Dead Zone until initialized."
      },
      {
        "id": "wd-3",
        "question": "Which CSS property specifies whether an element creates a new stacking context for z-index layering?",
        "options": [
          "isolation: isolate",
          "display: flow-root",
          "box-sizing: border-box",
          "visibility: collapse"
        ],
        "correct": 0,
        "difficulty": "Medium",
        "hint": "It literally contains the word 'isolate' to separate stacking contexts cleanly.",
        "explanation": "'isolation: isolate' creates a new stacking context without requiring position, opacity, or transform tricks."
      },
      {
        "id": "wd-4",
        "question": "What does the 'defer' attribute on a <script> tag guarantee?",
        "options": [
          "The script executes asynchronously as soon as it downloads",
          "The script is downloaded in parallel and executed in document order after HTML parsing",
          "The script blocks DOM parsing until completely loaded",
          "The script only runs when the window triggers the 'unload' event"
        ],
        "correct": 1,
        "difficulty": "Medium",
        "hint": "It defers execution until the HTML document is fully parsed, preserving script order.",
        "explanation": "'defer' downloads the script in parallel without blocking HTML parsing, then executes in order right before DOMContentLoaded."
      },
      {
        "id": "wd-5",
        "question": "In JavaScript, what is the output of: typeof NaN ?",
        "options": [
          "'undefined'",
          "'number'",
          "'object'",
          "'NaN'"
        ],
        "correct": 1,
        "difficulty": "Easy",
        "hint": "Even though it stands for 'Not-a-Number', numeric arithmetic produces it.",
        "explanation": "In IEEE 754 floating-point arithmetic and JavaScript specification, NaN represents 'Not-a-Number', but its data type is 'number'."
      },
      {
        "id": "wd-6",
        "question": "Which web API is designed to measure Core Web Vitals such as LCP, FID/INP, and CLS?",
        "options": [
          "PerformanceObserver",
          "MutationObserver",
          "ResizeObserver",
          "IntersectionObserver"
        ],
        "correct": 0,
        "difficulty": "Hard",
        "hint": "It observes browser performance events and timeline entries.",
        "explanation": "PerformanceObserver allows developers to listen for and record browser performance timeline entries, including Core Web Vitals."
      },
      {
        "id": "wd-7",
        "question": "What happens when a Promise is passed to Promise.all() where one of the promises rejects?",
        "options": [
          "It ignores the rejected promise and returns resolved ones",
          "It immediately rejects with the reason of the first rejected promise",
          "It waits for all promises to settle before reporting the error",
          "It returns an array containing both successes and errors"
        ],
        "correct": 1,
        "difficulty": "Medium",
        "hint": "Promise.all adheres to a 'fail-fast' mechanism.",
        "explanation": "Promise.all 'fail-fast' behavior means it immediately rejects as soon as any promise in the iterable rejects. (Use Promise.allSettled for waiting on all)."
      },
      {
        "id": "wd-8",
        "question": "Which HTML element provides a semantic, accessible native modal dialog box with keyboard focus trapping?",
        "options": [
          "<modal>",
          "<popup>",
          "<dialog>",
          "<window>"
        ],
        "correct": 2,
        "difficulty": "Easy",
        "hint": "It has methods like .showModal() and .close().",
        "explanation": "The native HTML5 <dialog> element provides built-in focus trapping, Esc key dismissal, and backdrop rendering via dialog.showModal()."
      },
      {
        "id": "wd-9",
        "question": "What is the time complexity of looking up a key in a JavaScript Map or Set?",
        "options": [
          "O(log n)",
          "O(1) average case",
          "O(n)",
          "O(n log n)"
        ],
        "correct": 1,
        "difficulty": "Medium",
        "hint": "Maps and Sets use hash table backing stores for constant-time lookups.",
        "explanation": "JavaScript Map and Set implementations use hash tables providing average O(1) time complexity for lookup, insertion, and deletion."
      },
      {
        "id": "wd-10",
        "question": "Which modern CSS pseudo-class acts as a parent or relational selector?",
        "options": [
          ":is()",
          ":where()",
          ":has()",
          ":parent()"
        ],
        "correct": 2,
        "difficulty": "Medium",
        "hint": "It checks if the element 'has' certain child or sibling matches.",
        "explanation": "The :has() relational pseudo-class allows styling an element based on its descendants or subsequent siblings."
      },
      {
        "id": "wd-11",
        "question": "In modern CSS, what does the :has() pseudo-class enable that was previously impossible without JavaScript?",
        "options": [
          "Selecting a parent element based on its descendants or following siblings",
          "Creating 3D WebGL meshes directly in stylesheets",
          "Detecting hardware GPU acceleration status",
          "Running asynchronous HTTP requests"
        ],
        "correct": 0,
        "difficulty": "Hard",
        "hint": "Often referred to as the \"parent selector\" in CSS.",
        "explanation": "The :has() relational pseudo-class acts as a parent selector, matching elements if any relative selectors match from that element."
      },
      {
        "id": "wd-12",
        "question": "Which HTTP/2 and HTTP/3 feature eliminates Head-of-Line blocking at the application stream layer?",
        "options": [
          "Multiplexing independent streams over a single connection",
          "Base64 cookie encryption",
          "Automatic DOM diffing",
          "Lossless video compression"
        ],
        "correct": 0,
        "difficulty": "Hard",
        "hint": "Multiple requests and responses are interleaved simultaneously in frames.",
        "explanation": "Multiplexing breaks requests and responses into independent binary frames transmitted over one connection without blocking other streams."
      }
    ]
  },
  {
    "id": "science-nature",
    "title": "Science & The Universe",
    "description": "Explore mysteries of quantum mechanics, astrophysics, biology, and chemistry.",
    "category": "Science",
    "icon": "🔬",
    "timePerQuestion": 25,
    "questions": [
      {
        "id": "sn-1",
        "question": "What is the powerhouse organelle of eukaryotic cells responsible for producing ATP?",
        "options": [
          "Ribosome",
          "Endoplasmic Reticulum",
          "Mitochondria",
          "Golgi Apparatus"
        ],
        "correct": 2,
        "difficulty": "Easy",
        "hint": "Famous biology slogan: 'Mitochondria is the powerhouse of the cell.'",
        "explanation": "Mitochondria generate most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy."
      },
      {
        "id": "sn-2",
        "question": "What particle is theorized to give mass to elementary particles through its quantum field?",
        "options": [
          "Higgs Boson",
          "Graviton",
          "Photon",
          "Gluon"
        ],
        "correct": 0,
        "difficulty": "Medium",
        "hint": "Discovered at CERN's Large Hadron Collider in 2012; nicknamed 'The God Particle'.",
        "explanation": "The Higgs boson is the excitation of the Higgs field, which gives mass to fundamental quarks and leptons via the Brout-Englert-Higgs mechanism."
      },
      {
        "id": "sn-3",
        "question": "What is the approximate speed of light in a vacuum?",
        "options": [
          "150,000 km/s",
          "299,792 km/s",
          "384,400 km/s",
          "1,080,000 km/s"
        ],
        "correct": 1,
        "difficulty": "Easy",
        "hint": "Almost 300,000 kilometers per second.",
        "explanation": "Light travels at exactly 299,792,458 meters per second (approx. 299,792 km/s) in a vacuum."
      },
      {
        "id": "sn-4",
        "question": "Which planet in our solar system has the highest surface temperature despite not being closest to the Sun?",
        "options": [
          "Mercury",
          "Mars",
          "Venus",
          "Jupiter"
        ],
        "correct": 2,
        "difficulty": "Medium",
        "hint": "Named after the Roman goddess of love, it suffers from a runaway greenhouse effect.",
        "explanation": "Venus has a runaway greenhouse effect caused by a dense atmosphere of 96.5% carbon dioxide, keeping surface temperatures around 465°C."
      },
      {
        "id": "sn-5",
        "question": "What type of chemical bond involves the sharing of electron pairs between atoms?",
        "options": [
          "Ionic bond",
          "Covalent bond",
          "Hydrogen bond",
          "Metallic bond"
        ],
        "correct": 1,
        "difficulty": "Easy",
        "hint": "The prefix 'co-' signifies cooperation or sharing.",
        "explanation": "A covalent bond is formed when two atoms share one or more pairs of valence electrons to achieve stability."
      },
      {
        "id": "sn-6",
        "question": "What is the event horizon of a black hole?",
        "options": [
          "The singularity at the exact center",
          "The boundary beyond which nothing, not even light, can escape",
          "The accretion disk of glowing superheated gas",
          "The gravitational wave wave-front"
        ],
        "correct": 1,
        "difficulty": "Medium",
        "hint": "The point of no return for anything falling towards a black hole.",
        "explanation": "The event horizon is the cosmic boundary where escape velocity equals and exceeds the speed of light."
      },
      {
        "id": "sn-7",
        "question": "What is the most abundant chemical element in the observable universe?",
        "options": [
          "Helium",
          "Hydrogen",
          "Oxygen",
          "Carbon"
        ],
        "correct": 1,
        "difficulty": "Easy",
        "hint": "Element #1 on the Periodic table with atomic symbol H.",
        "explanation": "Hydrogen accounts for approximately 75% of the elemental mass of the observable universe."
      },
      {
        "id": "sn-8",
        "question": "Which principle states that you cannot simultaneously know both the precise position and momentum of a particle?",
        "options": [
          "Pauli Exclusion Principle",
          "Heisenberg Uncertainty Principle",
          "Schrödinger Equation",
          "Fermi-Dirac Distribution"
        ],
        "correct": 1,
        "difficulty": "Medium",
        "hint": "Formulated by German physicist Werner Heisenberg.",
        "explanation": "Werner Heisenberg formulated that Δx · Δp ≥ ℏ/2, meaning fundamental limits exist when measuring conjugate variables."
      },
      {
        "id": "sn-9",
        "question": "What is the theoretical boundary around a black hole beyond which nothing, not even light, can escape?",
        "options": [
          "Event Horizon",
          "Accretion Disk",
          "Ergosphere",
          "Photon Sphere"
        ],
        "correct": 0,
        "difficulty": "Hard",
        "hint": "The point of no return where escape velocity exceeds light speed.",
        "explanation": "The event horizon is the outer boundary where the gravitational pull becomes so intense that nothing can overcome escape velocity."
      },
      {
        "id": "sn-10",
        "question": "What subatomic particle was experimentally verified at CERN's Large Hadron Collider in 2012, responsible for conferring mass to other particles?",
        "options": [
          "Higgs Boson",
          "Top Quark",
          "Tau Neutrino",
          "Gluon"
        ],
        "correct": 0,
        "difficulty": "Hard",
        "hint": "Often colloquially termed the \"God Particle\".",
        "explanation": "The Higgs boson is the quantum excitation of the Higgs field, which gives fundamental mass to quarks and leptons via electroweak symmetry breaking."
      }
    ]
  },
  {
    "id": "world-geography",
    "title": "World Geography & Wonders",
    "description": "Travel across continents, capitals, mountain ranges, and architectural wonders.",
    "category": "Geography",
    "icon": "🌍",
    "timePerQuestion": 20,
    "questions": [
      {
        "id": "wg-1",
        "question": "Which is the largest desert in the world by total surface area?",
        "options": [
          "Sahara Desert",
          "Arabian Desert",
          "Antarctic Polar Desert",
          "Gobi Desert"
        ],
        "correct": 2,
        "difficulty": "Medium",
        "hint": "Deserts are defined by low precipitation, not temperature; look to the southern pole.",
        "explanation": "Antarctica is technically a desert due to very low precipitation, and with 14.2 million km² it is the largest desert on Earth (Sahara is the largest hot desert)."
      },
      {
        "id": "wg-2",
        "question": "What is the capital city of Australia?",
        "options": [
          "Sydney",
          "Melbourne",
          "Canberra",
          "Brisbane"
        ],
        "correct": 2,
        "difficulty": "Easy",
        "hint": "It is neither Sydney nor Melbourne, but a planned city between the two.",
        "explanation": "Canberra was chosen as the compromise capital of Australia in 1908 to settle rivalries between Sydney and Melbourne."
      },
      {
        "id": "wg-3",
        "question": "Which river flows through the highest number of countries in the world?",
        "options": [
          "Amazon River",
          "Danube River",
          "Nile River",
          "Rhine River"
        ],
        "correct": 1,
        "difficulty": "Hard",
        "hint": "Flowing through central and southeastern Europe, touching 10 countries.",
        "explanation": "The Danube flows through or borders 10 European nations: Germany, Austria, Slovakia, Hungary, Croatia, Serbia, Romania, Bulgaria, Moldova, and Ukraine."
      },
      {
        "id": "wg-4",
        "question": "Which country spans 11 time zones, the most of any continuous contiguous landmass?",
        "options": [
          "Canada",
          "Russia",
          "United States",
          "China"
        ],
        "correct": 1,
        "difficulty": "Easy",
        "hint": "The largest nation by total land area on Earth.",
        "explanation": "Russia spans 11 consecutive time zones from Kaliningrad on the Baltic Sea to Kamchatka on the Pacific Ocean."
      },
      {
        "id": "wg-5",
        "question": "What is the deepest known location in Earth's oceans?",
        "options": [
          "Challenger Deep (Mariana Trench)",
          "Puerto Rico Trench",
          "Java Trench",
          "Tonga Trench"
        ],
        "correct": 0,
        "difficulty": "Medium",
        "hint": "Located in the western Pacific Ocean within the Mariana Trench.",
        "explanation": "Challenger Deep sits at the southern end of the Mariana Trench at an approximate depth of nearly 11,000 meters (36,000 feet)."
      },
      {
        "id": "wg-6",
        "question": "Which country is home to the historic ancient rock city of Petra?",
        "options": [
          "Egypt",
          "Jordan",
          "Lebanon",
          "Morocco"
        ],
        "correct": 1,
        "difficulty": "Easy",
        "hint": "A Middle Eastern kingdom bordered by Israel, Syria, Iraq, and Saudi Arabia.",
        "explanation": "Petra, carved into vibrant red-rose sandstone cliffs, was the capital of the Nabataean Kingdom in southern Jordan."
      },
      {
        "id": "wg-7",
        "question": "What is the deepest known oceanic trench on planet Earth?",
        "options": [
          "Mariana Trench (Challenger Deep)",
          "Puerto Rico Trench",
          "Java Trench",
          "Tonga Trench"
        ],
        "correct": 0,
        "difficulty": "Easy",
        "hint": "Located in the western Pacific Ocean, reaching roughly 11,000 meters down.",
        "explanation": "Challenger Deep in the Mariana Trench plunges nearly 11,000 meters (36,000 feet) below sea level."
      },
      {
        "id": "wg-8",
        "question": "Which African country is entirely enclaved (surrounded) by South Africa?",
        "options": [
          "Lesotho",
          "Swaziland (Eswatini)",
          "Botswana",
          "Namibia"
        ],
        "correct": 0,
        "difficulty": "Medium",
        "hint": "A kingdom perched high in the Maloti Mountains, completely enclosed within South Africa.",
        "explanation": "The Kingdom of Lesotho is an independent enclave country completely surrounded by the territory of South Africa."
      },
      {
        "id": "wg-9",
        "question": "Which sea is situated at the lowest land-based elevation on Earth (-430 meters below sea level)?",
        "options": [
          "The Dead Sea",
          "The Caspian Sea",
          "The Aral Sea",
          "The Red Sea"
        ],
        "correct": 0,
        "difficulty": "Medium",
        "hint": "Hypersaline lake bordered by Jordan and Israel, famous for extreme buoyancy.",
        "explanation": "The surface and shores of the Dead Sea sit at 430+ meters below sea level, the lowest land elevation on Earth."
      },
      {
        "id": "wg-10",
        "question": "What is the only continent on Earth that contains no active volcanic activity on land?",
        "options": [
          "Australia",
          "Antarctica",
          "South America",
          "Africa"
        ],
        "correct": 0,
        "difficulty": "Hard",
        "hint": "The continent lies entirely within a stable tectonic plate away from boundaries.",
        "explanation": "Mainland Australia contains no active volcanoes because it sits stably in the interior of the Indo-Australian tectonic plate."
      }
    ]
  },
  {
    "id": "history-civilization",
    "title": "History & Civilization",
    "description": "Journey through ancient empires, pivotal revolutions, and historical milestones.",
    "category": "History",
    "icon": "🏛️",
    "timePerQuestion": 25,
    "questions": [
      {
        "id": "hc-1",
        "question": "In what year did the Apollo 11 mission land the first humans on the Moon?",
        "options": [
          "1965",
          "1969",
          "1972",
          "1967"
        ],
        "correct": 1,
        "difficulty": "Easy",
        "hint": "It took place in the summer of the famous Woodstock festival year.",
        "explanation": "Neil Armstrong and Buzz Aldrin stepped onto the lunar surface on July 20, 1969."
      },
      {
        "id": "hc-2",
        "question": "Who was the first Emperor of a unified China and commissioned the Terracotta Army?",
        "options": [
          "Kublai Khan",
          "Qin Shi Huang",
          "Sun Tzu",
          "Emperor Wu of Han"
        ],
        "correct": 1,
        "difficulty": "Medium",
        "hint": "His dynasty gave the modern name to 'China'.",
        "explanation": "Qin Shi Huang unified the Warring States in 221 BC and founded the Qin dynasty, building the Terracotta Army to guard his mausoleum."
      },
      {
        "id": "hc-3",
        "question": "What ancient trade network connected East Asia with the Mediterranean for centuries?",
        "options": [
          "The Amber Road",
          "The Silk Road",
          "The Spice Route",
          "The Royal Road"
        ],
        "correct": 1,
        "difficulty": "Easy",
        "hint": "Named after the prized lustrous fabric exported from China.",
        "explanation": "The Silk Road was an expansive network of Eurasian trade routes active from the Han dynasty through the Middle Ages."
      },
      {
        "id": "hc-4",
        "question": "The Rosetta Stone was crucial for deciphering which ancient script?",
        "options": [
          "Cuneiform",
          "Linear B",
          "Egyptian Hieroglyphs",
          "Sanskrit"
        ],
        "correct": 2,
        "difficulty": "Easy",
        "hint": "The pictorial script written on papyrus and inside Egyptian tombs.",
        "explanation": "Discovered in 1799, the Rosetta Stone contained the same decree in hieroglyphs, Demotic, and Ancient Greek, unlocking Egyptian hieroglyphs."
      },
      {
        "id": "hc-5",
        "question": "Which invention by Johannes Gutenberg in the 1440s sparked an information revolution in Europe?",
        "options": [
          "The Steam Engine",
          "Movable Type Printing Press",
          "The Astrolabe",
          "The Mechanical Clock"
        ],
        "correct": 1,
        "difficulty": "Easy",
        "hint": "Enabled mass production of books, notably the Gutenberg Bible.",
        "explanation": "Gutenberg's movable type printing press enabled rapid, affordable dissemination of knowledge across the Western world."
      },
      {
        "id": "hc-6",
        "question": "Which Roman general crossed the Rubicon River in 49 BC, igniting a civil war and leading to the fall of the Republic?",
        "options": [
          "Julius Caesar",
          "Mark Antony",
          "Scipio Africanus",
          "Pompey the Great"
        ],
        "correct": 0,
        "difficulty": "Easy",
        "hint": "He uttered \"Alea iacta est\" (The die is cast).",
        "explanation": "Julius Caesar's defiance in crossing the Rubicon into Italy precipitated the Roman civil war and his rise as dictator."
      },
      {
        "id": "hc-7",
        "question": "The Rosetta Stone was pivotal in deciphering which ancient writing system?",
        "options": [
          "Egyptian Hieroglyphics",
          "Babylonian Cuneiform",
          "Linear A",
          "Minoan Script"
        ],
        "correct": 0,
        "difficulty": "Medium",
        "hint": "Contains decree inscriptions in hieroglyphic, Demotic, and ancient Greek.",
        "explanation": "Discovered in 1799, the Rosetta Stone enabled Jean-François Champollion to unlock ancient Egyptian hieroglyphic text."
      },
      {
        "id": "hc-8",
        "question": "In what year was the Magna Carta signed by King John of England at Runnymede?",
        "options": [
          "1215",
          "1066",
          "1348",
          "1492"
        ],
        "correct": 0,
        "difficulty": "Medium",
        "hint": "Early 13th century, establishing the principle that everyone—even the monarch—is subject to law.",
        "explanation": "The Magna Carta was signed in June 1215, laying foundations for constitutional governance and individual rights."
      },
      {
        "id": "hc-9",
        "question": "Which ancient Mesopotamian code of laws is famous for the doctrine of \"an eye for an eye\"?",
        "options": [
          "Code of Hammurabi",
          "Code of Justinian",
          "Twelve Tables",
          "Edict of Milan"
        ],
        "correct": 0,
        "difficulty": "Easy",
        "hint": "Babylonian king who inscribed laws onto a giant black diorite stele.",
        "explanation": "The Code of Hammurabi (c. 1754 BC) is one of the earliest preserved legal codes, renowned for lex talionis (retaliation)."
      },
      {
        "id": "hc-10",
        "question": "Who was the first emperor of a unified China, commissioned the Terracotta Army, and standardized coins and measurements?",
        "options": [
          "Qin Shi Huang",
          "Han Wudi",
          "Kublai Khan",
          "Tang Taizong"
        ],
        "correct": 0,
        "difficulty": "Hard",
        "hint": "Founder of the Qin Dynasty whose tomb is guarded by thousands of clay soldiers in Xi'an.",
        "explanation": "Qin Shi Huang unified the warring states of China in 221 BC, initiating the imperial era and building the first Great Wall sections."
      }
    ]
  },
  {
    "id": "computer-science",
    "title": "Computer Science & Logic",
    "description": "Data structures, algorithms, cryptography, and computing milestones.",
    "category": "Technology",
    "icon": "💻",
    "timePerQuestion": 25,
    "questions": [
      {
        "id": "cs-1",
        "question": "Which data structure operates on a Last-In, First-Out (LIFO) order?",
        "options": [
          "Queue",
          "Stack",
          "Binary Search Tree",
          "Linked List"
        ],
        "correct": 1,
        "difficulty": "Easy",
        "hint": "Think of a stack of plates in a cafeteria; you take the one from the top.",
        "explanation": "A Stack pushes elements on top and pops them from the top, following the Last-In, First-Out (LIFO) principle."
      },
      {
        "id": "cs-2",
        "question": "What is the worst-case time complexity of standard QuickSort?",
        "options": [
          "O(n log n)",
          "O(n)",
          "O(n²)",
          "O(2ⁿ)"
        ],
        "correct": 2,
        "difficulty": "Medium",
        "hint": "Quadratic time occurs when pivot selection repeatedly splits array into size 0 and n-1.",
        "explanation": "When an unbalanced pivot is chosen repeatedly (such as on an already sorted array with poor pivot selection), QuickSort degrades to O(n²)."
      },
      {
        "id": "cs-3",
        "question": "Who is widely recognized as the world's first computer programmer for writing an algorithm for the Analytical Engine?",
        "options": [
          "Grace Hopper",
          "Ada Lovelace",
          "Alan Turing",
          "Charles Babbage"
        ],
        "correct": 1,
        "difficulty": "Easy",
        "hint": "Daughter of Lord Byron, she collaborated with Charles Babbage.",
        "explanation": "Ada Lovelace published the first algorithm intended to be processed by Charles Babbage's mechanical general-purpose computer."
      },
      {
        "id": "cs-4",
        "question": "In asymmetric (public-key) cryptography, which key is used to decrypt a message encrypted with a public key?",
        "options": [
          "The recipient's private key",
          "The sender's public key",
          "The shared symmetric key",
          "The certificate authority key"
        ],
        "correct": 0,
        "difficulty": "Medium",
        "hint": "Only the recipient holds this secret counterpart key.",
        "explanation": "Data encrypted with the recipient's public key can only be decrypted by the corresponding private key owned exclusively by the recipient."
      },
      {
        "id": "cs-5",
        "question": "Which algorithm is commonly used to find the shortest path in a weighted graph with non-negative edge weights?",
        "options": [
          "Floyd-Warshall",
          "Dijkstra's Algorithm",
          "Bellman-Ford",
          "Kruskal's Algorithm"
        ],
        "correct": 1,
        "difficulty": "Medium",
        "hint": "Dutch computer scientist Edsger W. Dijkstra formulated this greedy approach.",
        "explanation": "Dijkstra's Algorithm greedily explores nearest vertices to compute the shortest path from a single source in non-negative weighted graphs."
      },
      {
        "id": "cs-6",
        "question": "What is the time complexity of searching for an element in a balanced Binary Search Tree (like an AVL or Red-Black tree)?",
        "options": [
          "O(log n)",
          "O(1)",
          "O(n)",
          "O(n²)"
        ],
        "correct": 0,
        "difficulty": "Easy",
        "hint": "Each comparison discards approximately half of the remaining subtrees.",
        "explanation": "In a balanced binary search tree with n nodes, the maximum height is bounded by O(log n), providing logarithmic search time."
      },
      {
        "id": "cs-7",
        "question": "In relational databases, what does ACID stand for regarding transactions?",
        "options": [
          "Atomicity, Consistency, Isolation, Durability",
          "Authentication, Caching, Indexing, Decoupling",
          "Asynchronous, Concurrency, Integrity, Delivery",
          "Automatic, Compatible, Incremental, Deterministic"
        ],
        "correct": 0,
        "difficulty": "Medium",
        "hint": "Key guarantees for database transactions to remain reliable even in system failures.",
        "explanation": "ACID guarantees that database transactions are processed reliably: Atomicity, Consistency, Isolation, and Durability."
      },
      {
        "id": "cs-8",
        "question": "Which sorting algorithm is asymptotically optimal with O(n log n) worst-case time complexity while also being stable?",
        "options": [
          "Merge Sort",
          "QuickSort",
          "HeapSort",
          "Selection Sort"
        ],
        "correct": 0,
        "difficulty": "Medium",
        "hint": "Divides the list in half recursively, sorts each, then blends them back together.",
        "explanation": "Merge Sort guarantees O(n log n) in all cases (best, average, and worst) and preserves relative order of duplicate elements (stability)."
      },
      {
        "id": "cs-9",
        "question": "What consensus algorithm is famously used in Bitcoin to secure the distributed ledger without a central authority?",
        "options": [
          "Proof of Work (PoW / SHA-256)",
          "Proof of Stake (PoS)",
          "Raft Consensus",
          "Paxos"
        ],
        "correct": 0,
        "difficulty": "Medium",
        "hint": "Miners expend computational energy solving cryptographic hashing puzzles.",
        "explanation": "Bitcoin uses Nakamoto consensus based on Proof of Work (PoW) with SHA-256 hashing to secure transaction blocks."
      },
      {
        "id": "cs-10",
        "question": "Which famous theoretical computer science problem asks whether every problem whose solution can be verified quickly can also be solved quickly?",
        "options": [
          "P versus NP problem",
          "Halting Problem",
          "Traveling Salesperson Problem",
          "Collatz Conjecture"
        ],
        "correct": 0,
        "difficulty": "Hard",
        "hint": "One of the seven Millennium Prize Problems in mathematics with a $1,000,000 prize.",
        "explanation": "P vs NP is a major unsolved question asking if polynomial-time verification (NP) implies polynomial-time solvability (P)."
      }
    ]
  },
  {
    "id": "general-trivia",
    "title": "Pop Culture & General Trivia",
    "description": "Fun, mind-bending trivia spanning cinema, music, arts, and records.",
    "category": "Trivia",
    "icon": "⚡",
    "timePerQuestion": 20,
    "questions": [
      {
        "id": "gt-1",
        "question": "Which film won the first Academy Award for Best Animated Feature in 2002?",
        "options": [
          "Monsters, Inc.",
          "Shrek",
          "Ice Age",
          "Finding Nemo"
        ],
        "correct": 1,
        "difficulty": "Easy",
        "hint": "Features an ogre, a talking donkey, and a swamp.",
        "explanation": "DreamWorks Animation's 'Shrek' won the inaugural Best Animated Feature Oscar at the 74th Academy Awards."
      },
      {
        "id": "gt-2",
        "question": "How many squares are there on a standard tournament chessboard?",
        "options": [
          "64",
          "49",
          "81",
          "100"
        ],
        "correct": 0,
        "difficulty": "Easy",
        "hint": "An 8 by 8 grid of alternating squares.",
        "explanation": "A standard chessboard has an 8x8 grid of alternating dark and light squares, totaling 64 squares."
      },
      {
        "id": "gt-3",
        "question": "What was the first music video broadcast on MTV upon its launch in 1981?",
        "options": [
          "'Video Killed the Radio Star' by The Buggles",
          "'Thriller' by Michael Jackson",
          "'Take On Me' by A-ha",
          "'Bohemian Rhapsody' by Queen"
        ],
        "correct": 0,
        "difficulty": "Medium",
        "hint": "The title speaks literally about video killing radio.",
        "explanation": "MTV debuted on August 1, 1981, playing 'Video Killed the Radio Star' as its symbolic first music video."
      },
      {
        "id": "gt-4",
        "question": "Which mythical creature is the national animal and symbol of Scotland?",
        "options": [
          "Dragon",
          "Unicorn",
          "Phoenix",
          "Griffin"
        ],
        "correct": 1,
        "difficulty": "Medium",
        "hint": "A legendary horse-like creature with a single spiraling horn on its forehead.",
        "explanation": "The unicorn has been an emblem of Scotland since the 12th century, prized for its chivalric power and purity."
      },
      {
        "id": "gt-5",
        "question": "Which artist painted \"The Starry Night\" while staying at the Saint-Paul-de-Mausole asylum in France?",
        "options": [
          "Vincent van Gogh",
          "Claude Monet",
          "Pablo Picasso",
          "Salvador Dalí"
        ],
        "correct": 0,
        "difficulty": "Easy",
        "hint": "Post-Impressionist Dutch master known for expressive swirling brushstrokes and sunflowers.",
        "explanation": "Vincent van Gogh painted The Starry Night in June 1889 depicting the view from his asylum room window at Saint-Rémy-de-Provence."
      },
      {
        "id": "gt-6",
        "question": "What is the rarest blood type in the human ABO and Rh blood group systems?",
        "options": [
          "AB-negative (AB-)",
          "O-positive (O+)",
          "A-positive (A+)",
          "B-negative (B-)"
        ],
        "correct": 0,
        "difficulty": "Medium",
        "hint": "Less than 1% of the global population has this specific Rh-negative combination.",
        "explanation": "AB-negative is considered the rarest standard blood type, occurring in less than 1% of people worldwide."
      },
      {
        "id": "gt-7",
        "question": "Which world-renowned scientist refused the presidency of Israel in 1952?",
        "options": [
          "Albert Einstein",
          "Niels Bohr",
          "J. Robert Oppenheimer",
          "Marie Curie"
        ],
        "correct": 0,
        "difficulty": "Medium",
        "hint": "Theoretical physicist who formulated the theory of General Relativity.",
        "explanation": "Albert Einstein was offered the presidency of Israel after the death of Chaim Weizmann in 1952, but politely declined."
      },
      {
        "id": "gt-8",
        "question": "In literature, what is the fictional surname of the three detective brothers Sherlock, Mycroft, and Eurus?",
        "options": [
          "Holmes",
          "Watson",
          "Poirot",
          "Moriarty"
        ],
        "correct": 0,
        "difficulty": "Easy",
        "hint": "Created by Sir Arthur Conan Doyle, residing at 221B Baker Street.",
        "explanation": "Sherlock Holmes and his elder brother Mycroft Holmes are the famous creations of Arthur Conan Doyle."
      },
      {
        "id": "gt-9",
        "question": "What is the oldest known musical instrument discovered by archaeologists?",
        "options": [
          "Divje Babe Bone Flute (40,000+ years old)",
          "Bronze Bell",
          "Wooden Lyre",
          "Clay Drum"
        ],
        "correct": 0,
        "difficulty": "Hard",
        "hint": "Carved from cave bear femur with spaced finger holes discovered in Slovenia.",
        "explanation": "Paleolithic bone flutes, such as the Divje Babe flute (43,000+ years old) and Hohle Fels flute, are the earliest confirmed musical instruments."
      },
      {
        "id": "gt-10",
        "question": "Which chemical element has the highest melting point of all known metals (3,422 °C)?",
        "options": [
          "Tungsten (Wolfram)",
          "Titanium",
          "Platinum",
          "Osmium"
        ],
        "correct": 0,
        "difficulty": "Hard",
        "hint": "Symbol W, historically used as incandescence lamp filament.",
        "explanation": "Tungsten (W, atomic number 74) has the highest melting point among all metals at 3,422 °C (6,192 °F)."
      }
    ]
  }
];

  const DEFAULT_SCORES = [
  {
    "id": "sc-1791446752900-518e79",
    "quizId": "daily-2026-10-08",
    "quizTitle": "Daily Challenge",
    "userName": "SpeedDemon",
    "userAvatar": "?",
    "score": 5,
    "total": 5,
    "percentage": 100,
    "earnedPoints": 950,
    "maxStreak": 5,
    "difficulty": "Medium",
    "timeTakenSeconds": 18,
    "date": "2026-10-08T08:05:52.901Z"
  },
  {
    "id": "score-1",
    "quizId": "web-dev",
    "quizTitle": "Modern Web & JavaScript",
    "userName": "Alex Dev",
    "score": 10,
    "total": 10,
    "percentage": 100,
    "timeTakenSeconds": 78,
    "date": "2026-09-28T14:20:00.000Z"
  },
  {
    "id": "score-2",
    "quizId": "science-nature",
    "quizTitle": "Science & The Universe",
    "userName": "Dr. Nova",
    "score": 7,
    "total": 8,
    "percentage": 88,
    "timeTakenSeconds": 85,
    "date": "2026-09-29T10:15:00.000Z"
  },
  {
    "id": "score-3",
    "quizId": "world-geography",
    "quizTitle": "World Geography & Wonders",
    "userName": "Atlas_Explorer",
    "score": 6,
    "total": 6,
    "percentage": 100,
    "timeTakenSeconds": 45,
    "date": "2026-09-29T16:45:00.000Z"
  },
  {
    "id": "score-4",
    "quizId": "computer-science",
    "quizTitle": "Computer Science & Logic",
    "userName": "CodeNinja",
    "score": 4,
    "total": 5,
    "percentage": 80,
    "timeTakenSeconds": 52,
    "date": "2026-09-30T09:30:00.000Z"
  }
];

  function loadSavedCustomQuizzes() {
    try {
      const saved = localStorage.getItem('quiz_custom_quizzes');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  }

  function loadSavedScores() {
    try {
      const saved = localStorage.getItem('quiz_scores');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [...DEFAULT_SCORES];
  }



  function loadSavedInventory() {
    try {
      const saved = localStorage.getItem('quiz_powerups_inventory');
      if (saved) return { ...DEFAULT_INVENTORY, ...JSON.parse(saved) };
    } catch {}
    return { ...DEFAULT_INVENTORY };
  }

  function loadSavedAchievements() {
    try {
      const saved = localStorage.getItem('quiz_unlocked_achievements');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  }

  const state = {
    currentView: 'home',
    quizzes: [...DEFAULT_QUIZZES, ...loadSavedCustomQuizzes()],
    pendingQuizId: null,
    selectedGameMode: 'standard', // 'standard', 'speed', 'survival', 'zen'
    selectedDifficultyFilter: 'All', // 'All', 'Easy', 'Medium', 'Hard'
    shuffleQuestions: true,
    activeQuiz: null,
    currentQuestionIndex: 0,
    score: 0,
    earnedPoints: 0,
    coinsEarnedSession: 0,
    streak: 0,
    maxStreak: 0,
    comboMultiplier: 1.0,
    userAnswers: [],
    timerSecondsLeft: 0,
    timerMaxSeconds: 20,
    timerInterval: null,
    totalTimeTaken: 0,
    quizStartTime: 0,

    // Modifiers on active question
    isTimerFrozen: false,
    freezeTimeout: null,
    isDoublePointsActive: false,
    isHintUsedOnCurrentQ: false,
    powerupsUsedCount: 0,

    // Persistent User Profile & Wallet
    userProfile: {
      name: localStorage.getItem('quiz_player_name') || 'CyberExplorer',
      avatar: localStorage.getItem('quiz_player_avatar') || '🚀',
      xp: parseInt(localStorage.getItem('quiz_player_xp'), 10) || 120,
      coins: parseInt(localStorage.getItem('quiz_player_coins'), 10) || 250,
      totalCorrect: parseInt(localStorage.getItem('quiz_player_total_correct'), 10) || 0,
      dailyStreak: parseInt(localStorage.getItem('quiz_daily_streak'), 10) || 0,
      lastDailyDate: localStorage.getItem('quiz_last_daily_date') || ''
    },

    inventory: loadSavedInventory(),
    unlockedAchievements: loadSavedAchievements(),

    activeCategory: 'All',
    searchQuery: ''
  };

  // Level Progression Calculation
  function getLevelInfo(xp) {
    const thresholds = [
      { level: 1, title: 'Rookie Quizzer', min: 0, max: 250 },
      { level: 2, title: 'Trivia Explorer', min: 250, max: 600 },
      { level: 3, title: 'Knowledge Adept', min: 600, max: 1200 },
      { level: 4, title: 'Grand Scholar', min: 1200, max: 2500 },
      { level: 5, title: 'QuizSphere Legend', min: 2500, max: 5000 }
    ];

    for (let i = 0; i < thresholds.length; i++) {
      if (xp < thresholds[i].max || i === thresholds.length - 1) {
        const cur = thresholds[i];
        const span = cur.max - cur.min;
        const progress = Math.min(100, Math.max(0, ((xp - cur.min) / span) * 100));
        return {
          level: cur.level,
          title: cur.title,
          progress: Math.round(progress),
          nextXp: cur.max
        };
      }
    }
  }

  // ==========================================================================
  // 4. DOM Elements Cache
  // ==========================================================================
  const el = {
    // Views
    viewHome: document.getElementById('view-home'),
    viewPlay: document.getElementById('view-quiz-play'),
    viewResults: document.getElementById('view-results'),
    viewLeaderboard: document.getElementById('view-leaderboard'),

    // Nav & Header
    navHome: document.getElementById('nav-home'),
    navLeaderboard: document.getElementById('nav-leaderboard'),
    navAchievements: document.getElementById('nav-achievements'),
    navInventory: document.getElementById('nav-inventory'),
    brandLogo: document.getElementById('brand-logo'),
    btnSoundToggle: document.getElementById('btn-sound-toggle'),
    soundIndicator: document.getElementById('sound-indicator'),
    btnThemeToggle: document.getElementById('btn-theme-toggle'),
    themeIndicator: document.getElementById('theme-indicator'),
    playerCoinsChip: document.getElementById('player-coins-chip'),
    displayPlayerCoins: document.getElementById('display-player-coins'),
    playerChip: document.getElementById('player-profile-chip'),
    displayPlayerName: document.getElementById('display-player-name'),
    playerAvatar: document.getElementById('player-avatar'),
    playerXpContainer: document.getElementById('player-xp-container'),
    displayPlayerLevel: document.getElementById('display-player-level'),
    displayXpFill: document.getElementById('display-xp-fill'),
    displayXpText: document.getElementById('display-xp-text'),

    // Explore View & Daily Challenge
    btnHeroDailyChallenge: document.getElementById('btn-hero-daily-challenge'),
    btnHeroRandomQuiz: document.getElementById('btn-hero-random-quiz'),
    dailyChallengeBanner: document.getElementById('daily-challenge-banner'),
    dailyBannerDate: document.getElementById('daily-banner-date'),
    dailyBannerTitle: document.getElementById('daily-banner-title'),
    dailyStreakDisplay: document.getElementById('daily-streak-display'),
    dailyStatusIndicator: document.getElementById('daily-status-indicator'),
    btnStartDailyChallenge: document.getElementById('btn-start-daily-challenge'),

    quizGrid: document.getElementById('quizzes-container'),
    categoryPills: document.getElementById('category-pills'),
    selectDifficultyFilter: document.getElementById('select-difficulty-filter'),
    searchInput: document.getElementById('quiz-search-input'),
    btnClearSearch: document.getElementById('btn-clear-search'),
    statTotalQuizzes: document.getElementById('stat-total-quizzes'),
    statTotalQuestions: document.getElementById('stat-total-questions'),
    statGamesPlayed: document.getElementById('stat-games-played'),
    statAvgScore: document.getElementById('stat-avg-score'),

    // Active Quiz View
    btnExitQuiz: document.getElementById('btn-exit-quiz'),
    playQuizIcon: document.getElementById('play-quiz-icon'),
    playQuizTitle: document.getElementById('play-quiz-title'),
    playModePill: document.getElementById('play-mode-pill'),
    btnTtsRead: document.getElementById('btn-tts-read'),
    btnQuickOpenShop: document.getElementById('btn-quick-open-shop'),

    // 8 Power-Up Buttons & Counts
    btnLifeline5050: document.getElementById('btn-lifeline-5050'),
    lifeline5050Count: document.getElementById('lifeline-5050-count'),
    btnLifelineSkip: document.getElementById('btn-lifeline-skip'),
    lifelineSkipCount: document.getElementById('lifeline-skip-count'),
    btnLifelineHint: document.getElementById('btn-lifeline-hint'),
    lifelineHintCount: document.getElementById('lifeline-hint-count'),
    btnLifelineFreeze: document.getElementById('btn-lifeline-freeze'),
    lifelineFreezeCount: document.getElementById('lifeline-freeze-count'),
    btnLifelineDouble: document.getElementById('btn-lifeline-double'),
    lifelineDoubleCount: document.getElementById('lifeline-double-count'),
    btnLifelineExtraTime: document.getElementById('btn-lifeline-extratime'),
    lifelineExtraTimeCount: document.getElementById('lifeline-extratime-count'),
    btnLifelinePoll: document.getElementById('btn-lifeline-poll'),
    lifelinePollCount: document.getElementById('lifeline-poll-count'),
    btnLifelineFriend: document.getElementById('btn-lifeline-friend'),
    lifelineFriendCount: document.getElementById('lifeline-friend-count'),

    // Metrics Dashboard
    playCurrentQ: document.getElementById('play-current-q'),
    playTotalQ: document.getElementById('play-total-q'),
    timerBox: document.getElementById('timer-box'),
    playTimer: document.getElementById('play-timer'),
    timerCirclePath: document.getElementById('timer-circle-path'),
    timerUnitLabel: document.getElementById('timer-unit-label'),
    frozenOverlayBadge: document.getElementById('frozen-overlay-badge'),
    playStreakDisplay: document.getElementById('play-streak-display'),
    playScoreDisplay: document.getElementById('play-score-display'),
    playCoinsSession: document.getElementById('play-coins-session'),
    playProgressFill: document.getElementById('play-progress-fill'),

    // Question Card
    doublePointsBanner: document.getElementById('double-points-banner'),
    freezeActiveBanner: document.getElementById('freeze-active-banner'),
    playDifficultyTag: document.getElementById('play-difficulty-tag'),
    playPointsBadge: document.getElementById('play-points-badge'),
    playCoinsBadge: document.getElementById('play-coins-badge'),
    playQuestionText: document.getElementById('play-question-text'),
    hintBanner: document.getElementById('hint-banner'),
    hintBannerText: document.getElementById('hint-banner-text'),
    optionsContainer: document.getElementById('options-container'),
    explanationBox: document.getElementById('explanation-box'),
    explanationTitle: document.getElementById('explanation-title'),
    explanationText: document.getElementById('explanation-text'),
    explanationIcon: document.getElementById('explanation-icon'),
    actionStatusMsg: document.getElementById('action-status-msg'),
    btnNextQuestion: document.getElementById('btn-next-question'),

    // Results View
    resultsTitle: document.getElementById('results-title'),
    resultsSubtitle: document.getElementById('results-subtitle'),
    resultsPercentage: document.getElementById('results-percentage'),
    resultsGrade: document.getElementById('results-grade'),
    resultsScoreFraction: document.getElementById('results-score-fraction'),
    resultsTimeTaken: document.getElementById('results-time-taken'),
    resultsMaxStreak: document.getElementById('results-max-streak'),
    resultsCoinsEarned: document.getElementById('results-coins-earned'),
    resultsXpEarned: document.getElementById('results-xp-earned'),
    resultsAvgSpeed: document.getElementById('results-avg-speed'),
    resultsBadgesRow: document.getElementById('results-badges-row'),
    certificateOfferBox: document.getElementById('certificate-offer-box'),
    btnOpenCertificate: document.getElementById('btn-open-certificate'),
    btnToggleReview: document.getElementById('btn-toggle-review'),
    btnRetryQuiz: document.getElementById('btn-retry-quiz'),
    btnHomeFromResults: document.getElementById('btn-home-from-results'),
    reviewPanel: document.getElementById('review-panel'),
    reviewSummaryTag: document.getElementById('review-summary-tag'),
    reviewListContainer: document.getElementById('review-list-container'),

    // Leaderboard
    leaderboardTbody: document.getElementById('leaderboard-tbody'),
    leaderboardQuizFilter: document.getElementById('leaderboard-quiz-filter'),
    btnRefreshLeaderboard: document.getElementById('btn-refresh-leaderboard'),
    leaderboardEmpty: document.getElementById('leaderboard-empty'),

    // Modals
    dialogAudiencePoll: document.getElementById('dialog-audience-poll'),
    pollBarsContainer: document.getElementById('poll-bars-container'),
    btnDismissPoll: document.getElementById('btn-dismiss-poll'),

    dialogAskFriend: document.getElementById('dialog-ask-friend'),
    friendModalBody: document.getElementById('friend-modal-body'),
    btnDismissFriend: document.getElementById('btn-dismiss-friend'),

    dialogInventoryShop: document.getElementById('dialog-inventory-shop'),
    shopWalletCoins: document.getElementById('shop-wallet-coins'),
    shopItemsGrid: document.getElementById('shop-items-grid'),
    btnDoneShop: document.getElementById('btn-done-shop'),

    dialogAchievements: document.getElementById('dialog-achievements'),
    achieveUnlockedCount: document.getElementById('achieve-unlocked-count'),
    achieveCardsGrid: document.getElementById('achieve-cards-grid'),
    btnDoneAchieve: document.getElementById('btn-done-achieve'),

    dialogGameMode: document.getElementById('dialog-game-mode'),
    modalSelectedQuizTitle: document.getElementById('modal-selected-quiz-title'),
    chkShuffleQuestions: document.getElementById('chk-shuffle-questions'),
    btnCloseModeDialog: document.getElementById('btn-close-mode-dialog'),
    btnCancelMode: document.getElementById('btn-cancel-mode'),
    btnConfirmStartMode: document.getElementById('btn-confirm-start-mode'),

    dialogCertificate: document.getElementById('dialog-certificate'),
    certCanvas: document.getElementById('cert-canvas'),
    btnCloseCertDialog: document.getElementById('btn-close-cert-dialog'),
    btnDownloadCertificate: document.getElementById('btn-download-certificate'),
    btnPrintCertificate: document.getElementById('btn-print-certificate'),

    dialogCreateQuiz: document.getElementById('dialog-create-quiz'),
    btnOpenCreator: document.getElementById('btn-open-creator'),
    btnCloseCreatorDialog: document.getElementById('btn-close-creator-dialog'),
    btnCancelCreator: document.getElementById('btn-cancel-creator'),
    createQuizForm: document.getElementById('create-quiz-form'),
    cqQuestionsContainer: document.getElementById('cq-questions-container'),
    cqQuestionsCount: document.getElementById('cq-questions-count'),
    btnAddQuestionItem: document.getElementById('btn-add-question-item'),
    btnExportTemplate: document.getElementById('btn-export-template'),
    btnImportJsonTrigger: document.getElementById('btn-import-json-trigger'),
    jsonFileInput: document.getElementById('json-file-input'),
    btnExportCsv: document.getElementById('btn-export-csv'),
    btnImportCsvTrigger: document.getElementById('btn-import-csv-trigger'),
    csvFileInput: document.getElementById('csv-file-input'),

    dialogPlayerName: document.getElementById('dialog-player-name'),
    modalProfileAvatar: document.getElementById('modal-profile-avatar'),
    modalProfileName: document.getElementById('modal-profile-name'),
    modalProfileTier: document.getElementById('modal-profile-tier'),
    modalProfileCoins: document.getElementById('modal-profile-coins'),
    btnClosePlayerDialog: document.getElementById('btn-close-player-dialog'),
    playerNameForm: document.getElementById('player-name-form'),
    inputPlayerName: document.getElementById('input-player-name'),
    avatarChoicesGrid: document.getElementById('avatar-choices-grid')
  };

  // ==========================================================================
  // 5. Navigation & View Routing
  // ==========================================================================
  function switchView(viewName) {
    state.currentView = viewName;

    // Reset speech and audio if user navigates away
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    clearInterval(state.timerInterval);

    [el.viewHome, el.viewPlay, el.viewResults, el.viewLeaderboard].forEach(v => {
      if (v) {
        v.hidden = true;
        v.classList.remove('active');
      }
    });

    [el.navHome, el.navLeaderboard].forEach(btn => btn?.classList.remove('active'));

    if (viewName === 'home') {
      el.viewHome.hidden = false;
      el.viewHome.classList.add('active');
      el.navHome?.classList.add('active');
      fetchQuizzes();
      fetchPlatformStats();
      updateDailyChallengeBanner();
    } else if (viewName === 'play') {
      el.viewPlay.hidden = false;
      el.viewPlay.classList.add('active');
    } else if (viewName === 'results') {
      el.viewResults.hidden = false;
      el.viewResults.classList.add('active');
    } else if (viewName === 'leaderboard') {
      el.viewLeaderboard.hidden = false;
      el.viewLeaderboard.classList.add('active');
      el.navLeaderboard?.classList.add('active');
      loadLeaderboard();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================================================
  // 6. User Profile, Wallet, Inventory & Achievements Sync
  // ==========================================================================
  function syncUserProfileUI() {
    if (el.displayPlayerName) el.displayPlayerName.textContent = state.userProfile.name;
    if (el.playerAvatar) el.playerAvatar.textContent = state.userProfile.avatar;
    if (el.inputPlayerName) el.inputPlayerName.value = state.userProfile.name;
    if (el.displayPlayerCoins) el.displayPlayerCoins.textContent = state.userProfile.coins;
    if (el.shopWalletCoins) el.shopWalletCoins.textContent = `${state.userProfile.coins} Coins`;

    const lvl = getLevelInfo(state.userProfile.xp);
    if (el.displayPlayerLevel) el.displayPlayerLevel.textContent = `LVL ${lvl.level}`;
    if (el.displayXpFill) el.displayXpFill.style.width = `${lvl.progress}%`;
    if (el.displayXpText) el.displayXpText.textContent = `${state.userProfile.xp} XP`;

    if (el.modalProfileAvatar) el.modalProfileAvatar.textContent = state.userProfile.avatar;
    if (el.modalProfileName) el.modalProfileName.textContent = state.userProfile.name;
    if (el.modalProfileTier) el.modalProfileTier.textContent = `Level ${lvl.level} • ${lvl.title} (${state.userProfile.xp} XP)`;
    if (el.modalProfileCoins) el.modalProfileCoins.textContent = `🪙 ${state.userProfile.coins} Coins`;

    if (el.avatarChoicesGrid) {
      el.avatarChoicesGrid.querySelectorAll('.avatar-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.avatar === state.userProfile.avatar);
      });
    }

    updateLifelineButtons();
    checkLevelAchievement(lvl.level);
  }

  function addPlayerCoins(delta, reason = '') {
    state.userProfile.coins += delta;
    localStorage.setItem('quiz_player_coins', state.userProfile.coins);
    sound.playCoin();
    syncUserProfileUI();

    if (delta > 0 && reason) {
      showToast('🪙', `+${delta} Coins Earned!`, reason);
    }

    if (state.userProfile.coins >= 300) {
      unlockAchievement('coin_collector');
    }
  }

  function addPlayerXP(xpDelta) {
    const oldLvl = getLevelInfo(state.userProfile.xp).level;
    state.userProfile.xp += xpDelta;
    localStorage.setItem('quiz_player_xp', state.userProfile.xp);
    const newLvl = getLevelInfo(state.userProfile.xp).level;

    if (newLvl > oldLvl) {
      sound.playFanfare();
      launchConfetti();
      showToast('🎉', `Level Up! Level ${newLvl}`, 'You earned +1 of all power-ups as a promotion gift!');
      // Level up promotion gift: give 1 of each powerup!
      Object.keys(state.inventory).forEach(k => state.inventory[k]++);
      saveInventory();
      addPlayerCoins(50, 'Level-up milestone bonus');
    }

    syncUserProfileUI();
  }

  function saveInventory() {
    localStorage.setItem('quiz_powerups_inventory', JSON.stringify(state.inventory));
    updateLifelineButtons();
  }

  function updateLifelineButtons() {
    const inv = state.inventory;
    const isZen = state.selectedGameMode === 'zen';

    const updateBtn = (btn, badge, count, extraDisabled = false) => {
      if (btn && badge) {
        badge.textContent = count;
        badge.classList.toggle('zero', count <= 0);
        btn.disabled = count <= 0 || extraDisabled;
      }
    };

    updateBtn(el.btnLifeline5050, el.lifeline5050Count, inv.fiftyFifty);
    updateBtn(el.btnLifelineSkip, el.lifelineSkipCount, inv.skip);
    updateBtn(el.btnLifelineHint, el.lifelineHintCount, inv.hint);
    updateBtn(el.btnLifelineFreeze, el.lifelineFreezeCount, inv.freeze, isZen);
    updateBtn(el.btnLifelineDouble, el.lifelineDoubleCount, inv.doublePoints);
    updateBtn(el.btnLifelineExtraTime, el.lifelineExtraTimeCount, inv.extraTime, isZen);
    updateBtn(el.btnLifelinePoll, el.lifelinePollCount, inv.audiencePoll);
    updateBtn(el.btnLifelineFriend, el.lifelineFriendCount, inv.askFriend);
  }

  // Achievement Engine
  function unlockAchievement(id) {
    if (state.unlockedAchievements.includes(id)) return;
    const ach = ACHIEVEMENTS_CATALOG.find(a => a.id === id);
    if (!ach) return;

    state.unlockedAchievements.push(id);
    localStorage.setItem('quiz_unlocked_achievements', JSON.stringify(state.unlockedAchievements));

    sound.playFanfare();
    launchConfetti(45);
    showToast(ach.icon, `Achievement Unlocked: ${ach.title}`, `${ach.desc} (+${ach.rewardCoins} 🪙)`);
    addPlayerCoins(ach.rewardCoins, `Achievement: ${ach.title}`);
  }

  function checkLevelAchievement(level) {
    if (level >= 3) {
      unlockAchievement('grand_scholar');
    }
  }

  // ==========================================================================
  // 7. Modals: Shop, Achievements, Audience Poll, Ask a Friend
  // ==========================================================================
  function openShopModal() {
    sound.playClick();
    if (!el.shopItemsGrid) return;
    el.shopItemsGrid.innerHTML = '';
    if (el.shopWalletCoins) el.shopWalletCoins.textContent = `${state.userProfile.coins} Coins`;

    POWERUPS_CATALOG.forEach(p => {
      const card = document.createElement('div');
      card.className = 'shop-card';
      const count = state.inventory[p.id] || 0;

      card.innerHTML = `
        <div class="shop-card-top">
          <span class="shop-card-icon">${p.icon}</span>
          <span class="shop-card-owned font-mono">Owned: ${count}</span>
        </div>
        <h4 class="shop-card-title">${escapeHTML(p.name)}</h4>
        <p class="shop-card-desc">${escapeHTML(p.desc)}</p>
        <div class="shop-card-actions">
          <button class="btn btn-secondary btn-buy-powerup" data-buy-single="${p.id}" ${state.userProfile.coins < p.costSingle ? 'disabled' : ''}>
            Buy 1 (${p.costSingle} 🪙)
          </button>
          <button class="btn btn-primary btn-buy-powerup" data-buy-bundle="${p.id}" ${state.userProfile.coins < p.costBundle ? 'disabled' : ''}>
            Buy 3x (${p.costBundle} 🪙)
          </button>
        </div>
      `;
      el.shopItemsGrid.appendChild(card);
    });

    el.dialogInventoryShop?.showModal();
  }

  function handleShopPurchase(e) {
    const singleBtn = e.target.closest('[data-buy-single]');
    if (singleBtn) {
      const pid = singleBtn.dataset.buySingle;
      const meta = POWERUPS_CATALOG.find(p => p.id === pid);
      if (meta && state.userProfile.coins >= meta.costSingle) {
        state.userProfile.coins -= meta.costSingle;
        localStorage.setItem('quiz_player_coins', state.userProfile.coins);
        state.inventory[pid] = (state.inventory[pid] || 0) + 1;
        saveInventory();
        sound.playCoin();
        showToast(meta.icon, `Purchased 1x ${meta.name}!`, `Remaining coins: ${state.userProfile.coins}`);
        openShopModal();
      }
      return;
    }

    const bundleBtn = e.target.closest('[data-buy-bundle]');
    if (bundleBtn) {
      const pid = bundleBtn.dataset.buyBundle;
      const meta = POWERUPS_CATALOG.find(p => p.id === pid);
      if (meta && state.userProfile.coins >= meta.costBundle) {
        state.userProfile.coins -= meta.costBundle;
        localStorage.setItem('quiz_player_coins', state.userProfile.coins);
        state.inventory[pid] = (state.inventory[pid] || 0) + meta.bundleQty;
        saveInventory();
        sound.playCoin();
        showToast(meta.icon, `Purchased 3x ${meta.name}!`, `Remaining coins: ${state.userProfile.coins}`);
        openShopModal();
      }
    }
  }

  function openAchievementsModal() {
    sound.playClick();
    if (!el.achieveCardsGrid) return;
    el.achieveCardsGrid.innerHTML = '';

    const total = ACHIEVEMENTS_CATALOG.length;
    const unlocked = state.unlockedAchievements.length;
    if (el.achieveUnlockedCount) el.achieveUnlockedCount.textContent = `${unlocked} / ${total} Unlocked`;

    ACHIEVEMENTS_CATALOG.forEach(a => {
      const isUnlocked = state.unlockedAchievements.includes(a.id);
      const card = document.createElement('div');
      card.className = `achieve-card ${isUnlocked ? 'unlocked' : 'locked'}`;

      card.innerHTML = `
        <div class="achieve-icon-wrap">${a.icon}</div>
        <div class="achieve-details">
          <h4 class="achieve-card-title">${escapeHTML(a.title)}</h4>
          <p class="achieve-card-desc">${escapeHTML(a.desc)}</p>
          <div class="achieve-reward-tag">${isUnlocked ? '✔ Unlocked (+🪙 Claimed)' : `Reward: +${a.rewardCoins} Coins`}</div>
        </div>
      `;
      el.achieveCardsGrid.appendChild(card);
    });

    el.dialogAchievements?.showModal();
  }

  // ==========================================================================
  // 8. Daily Challenge Engine
  // ==========================================================================
  function getTodayDateString() {
    return new Date().toISOString().slice(0, 10);
  }

  function updateDailyChallengeBanner() {
    const today = getTodayDateString();
    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    if (el.dailyBannerDate) el.dailyBannerDate.textContent = formattedDate;

    const streak = state.userProfile.dailyStreak;
    if (el.dailyStreakDisplay) el.dailyStreakDisplay.textContent = `🔥 ${streak}-Day Streak`;

    const isCompletedToday = state.userProfile.lastDailyDate === today;

    if (el.dailyStatusIndicator) {
      if (isCompletedToday) {
        el.dailyStatusIndicator.innerHTML = `<span style="color:var(--success)">✔ Completed Today (+100 🪙 Claimed)</span>`;
      } else {
        el.dailyStatusIndicator.innerHTML = `<span class="pulse-dot"></span> Ready to Play`;
      }
    }

    if (el.btnStartDailyChallenge) {
      el.btnStartDailyChallenge.innerHTML = isCompletedToday 
        ? `<span>🔄</span> Replay Daily Challenge`
        : `<span>🚀</span> Launch Daily Challenge`;
    }
  }

  async function launchDailyChallenge() {
    sound.playClick();
    try {
      const res = await fetch('/api/daily-challenge');
      if (res.ok) {
        const quiz = await res.json();
        startQuizWithMode(quiz.id, 'standard', quiz);
        return;
      }
    } catch {}

    // Fallback: Pick 5 deterministic questions locally if offline
    const allQ = [];
    state.quizzes.forEach(q => (q.questions || []).forEach(item => allQ.push(item)));
    if (allQ.length === 0) return;

    const selected = allQ.slice(0, 5);
    const dailyQuiz = {
      id: `daily-${getTodayDateString()}`,
      title: `Daily Challenge (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
      category: 'Daily Quest',
      icon: '🌟',
      isDaily: true,
      timePerQuestion: 20,
      questions: selected
    };
    startQuizWithMode(dailyQuiz.id, 'standard', dailyQuiz);
  }

  // ==========================================================================
  // 9. Random Question Mode & Category Selection
  // ==========================================================================
  async function launchRandomQuiz() {
    sound.playClick();
    const diff = state.selectedDifficultyFilter || 'All';
    try {
      const res = await fetch(`/api/random-quiz?count=10&difficulty=${diff}`);
      if (res.ok) {
        const randomQuiz = await res.json();
        startQuizWithMode(randomQuiz.id, 'standard', randomQuiz);
        return;
      }
    } catch {}

    // Fallback local shuffle
    const pool = [];
    state.quizzes.forEach(q => {
      (q.questions || []).forEach(item => {
        if (diff === 'All' || item.difficulty === diff) pool.push(item);
      });
    });

    if (pool.length === 0) {
      state.quizzes.forEach(q => pool.push(...(q.questions || [])));
    }

    pool.sort(() => Math.random() - 0.5);
    const selected = pool.slice(0, 10);

    const localRandomQuiz = {
      id: 'random-' + Date.now(),
      title: diff !== 'All' ? `Random Quiz (${diff} Tier)` : 'Random Multi-Topic Quiz',
      category: 'Random Mix',
      icon: '🎲',
      isRandom: true,
      timePerQuestion: 20,
      questions: selected
    };
    startQuizWithMode(localRandomQuiz.id, 'standard', localRandomQuiz);
  }

  // Shuffle array helper
  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // ==========================================================================
  // 10. Quizzes Explorer & Grid Rendering
  // ==========================================================================
  async function fetchQuizzes() {
    try {
      const res = await fetch('/api/quizzes');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const custom = loadSavedCustomQuizzes();
          state.quizzes = [...data, ...custom.filter(c => !data.some(d => d.id === c.id))];
        }
      }
    } catch (err) {
      // Static host mode / offline: state.quizzes is already populated from DEFAULT_QUIZZES
    }
    renderQuizGrid();
    populateLeaderboardFilter();
  }

  async function fetchPlatformStats() {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) return;
      const stats = await res.json();
      if (el.statTotalQuizzes) el.statTotalQuizzes.textContent = stats.totalQuizzes;
      if (el.statTotalQuestions) el.statTotalQuestions.textContent = stats.totalQuestions;
      if (el.statGamesPlayed) el.statGamesPlayed.textContent = stats.totalGamesPlayed;
      if (el.statAvgScore) el.statAvgScore.textContent = `${stats.averageScorePercent}%`;
    } catch {}
  }

  function renderQuizGrid() {
    if (!el.quizGrid) return;
    el.quizGrid.innerHTML = '';

    const query = state.searchQuery.toLowerCase().trim();
    const category = state.activeCategory;

    const filtered = state.quizzes.filter(q => {
      const matchCat = (category === 'All') || (category === 'Custom' && q.isCustom) || (q.category === category);
      const matchSearch = !query || q.title.toLowerCase().includes(query) || (q.description && q.description.toLowerCase().includes(query));
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      el.quizGrid.innerHTML = `
        <div class="loading-state">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
          <h3>No quizzes match your search</h3>
          <p>Try searching for different terms or create your own custom quiz!</p>
        </div>
      `;
      return;
    }

    filtered.forEach(q => {
      const card = document.createElement('div');
      card.className = 'quiz-card';
      card.innerHTML = `
        <div>
          <div class="card-top">
            <div class="card-icon">${q.icon || '📝'}</div>
            <span class="card-category-tag">${q.category || 'General'}</span>
          </div>
          <h3 class="quiz-card-title">${escapeHTML(q.title)}</h3>
          <p class="quiz-card-desc">${escapeHTML(q.description || 'Test your knowledge on this topic.')}</p>
        </div>
        <div>
          <div class="card-metadata">
            <div class="meta-item">
              <span>❓</span>
              <span><strong>${q.questionCount || (q.questions ? q.questions.length : 10)}</strong> questions</span>
            </div>
            <div class="meta-item">
              <span>⏱️</span>
              <span><strong>${q.timePerQuestion || 20}s</strong></span>
            </div>
          </div>
          <div class="card-actions-row">
            <button class="btn btn-primary btn-start" data-quiz-id="${q.id}">
              <span>Start Quiz</span> <span>⚡</span>
            </button>
            ${q.isCustom ? `
              <button class="btn-delete-card" data-delete-id="${q.id}" title="Delete Custom Quiz">
                🗑️
              </button>
            ` : ''}
          </div>
        </div>
      `;
      el.quizGrid.appendChild(card);
    });
  }

  // ==========================================================================
  // 11. Game Mode Selector & Quiz Launch
  // ==========================================================================
  function promptGameMode(quizId) {
    sound.playClick();
    state.pendingQuizId = quizId;
    const quiz = state.quizzes.find(q => q.id === quizId);
    if (el.modalSelectedQuizTitle) el.modalSelectedQuizTitle.textContent = quiz ? quiz.title : 'Quiz';

    state.selectedGameMode = 'standard';
    el.dialogGameMode?.querySelectorAll('.mode-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.mode === 'standard');
    });

    el.dialogGameMode?.showModal();
  }

  function setupGameModeEvents() {
    el.dialogGameMode?.querySelectorAll('.mode-card').forEach(card => {
      card.addEventListener('click', () => {
        el.dialogGameMode.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        state.selectedGameMode = card.dataset.mode || 'standard';
        sound.playClick();
      });
    });

    el.btnCloseModeDialog?.addEventListener('click', () => el.dialogGameMode?.close());
    el.btnCancelMode?.addEventListener('click', () => el.dialogGameMode?.close());

    el.btnConfirmStartMode?.addEventListener('click', () => {
      el.dialogGameMode?.close();
      state.shuffleQuestions = el.chkShuffleQuestions ? el.chkShuffleQuestions.checked : true;
      if (state.pendingQuizId) {
        startQuizWithMode(state.pendingQuizId, state.selectedGameMode);
      }
    });
  }

  // ==========================================================================
  // 12. Active Quiz Engine: Lifecycle & Scoring
  // ==========================================================================
  async function startQuizWithMode(quizId, mode, preloadedQuiz = null) {
    let quizData = preloadedQuiz;
    if (!quizData) {
      try {
        const res = await fetch(`/api/quizzes/${quizId}`);
        if (res.ok) quizData = await res.json();
      } catch {}
    }

    if (!quizData) {
      quizData = state.quizzes.find(q => q.id === quizId);
    }

    if (!quizData || !quizData.questions || quizData.questions.length === 0) {
      alert('This quiz has no questions available.');
      return;
    }

    // Clone questions so we don't mutate original
    let questions = JSON.parse(JSON.stringify(quizData.questions));

    // Filter by difficulty if user selected a tier and not a Daily Challenge
    const diffFilter = state.selectedDifficultyFilter;
    if (!quizData.isDaily && diffFilter && diffFilter !== 'All') {
      const tiered = questions.filter(q => q.difficulty === diffFilter);
      if (tiered.length >= 3) {
        questions = tiered;
      }
    }

    // Shuffle question order and randomize options if enabled
    if (state.shuffleQuestions || quizData.isRandom) {
      questions = shuffleArray(questions);
      // Also randomize option order while maintaining correct index
      questions = questions.map(q => {
        const originalCorrectText = q.options[q.correct];
        const shuffledOpts = shuffleArray(q.options);
        const newCorrectIdx = shuffledOpts.indexOf(originalCorrectText);
        return {
          ...q,
          options: shuffledOpts,
          correct: newCorrectIdx
        };
      });
    }

    state.activeQuiz = { ...quizData, questions };
    state.selectedGameMode = mode;
    state.currentQuestionIndex = 0;
    state.score = 0;
    state.earnedPoints = 0;
    state.coinsEarnedSession = 0;
    state.streak = 0;
    state.maxStreak = 0;
    state.comboMultiplier = 1.0;
    state.powerupsUsedCount = 0;
    state.userAnswers = [];
    state.quizStartTime = Date.now();

    // Mode labels
    let modeLabel = '🎯 Standard';
    if (mode === 'speed') modeLabel = '⚡ Speed Blitz (10s)';
    else if (mode === 'survival') modeLabel = '💀 Sudden Death (1 Life)';
    else if (mode === 'zen') modeLabel = '🧘 Zen Study (Untimed)';

    if (el.playQuizIcon) el.playQuizIcon.textContent = quizData.icon || '📝';
    if (el.playQuizTitle) el.playQuizTitle.textContent = quizData.title;
    if (el.playModePill) el.playModePill.textContent = modeLabel;
    if (el.playTotalQ) el.playTotalQ.textContent = questions.length;
    if (el.playScoreDisplay) el.playScoreDisplay.textContent = '0 pts';
    if (el.playCoinsSession) el.playCoinsSession.textContent = '🪙 +0';
    if (el.playStreakDisplay) el.playStreakDisplay.textContent = '🔥 0 (1.0x)';

    updateLifelineButtons();
    switchView('play');
    renderQuestion(0);
  }

  function renderQuestion(index) {
    clearInterval(state.timerInterval);
    clearTimeout(state.freezeTimeout);
    state.isTimerFrozen = false;
    state.isDoublePointsActive = false;
    state.isHintUsedOnCurrentQ = false;

    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const questions = state.activeQuiz.questions;
    if (index >= questions.length) {
      finishQuiz();
      return;
    }

    const q = questions[index];
    state.currentQuestionIndex = index;

    // Difficulty base values
    const diff = q.difficulty || 'Medium';
    let basePts = 125;
    let baseCoins = 20;

    if (diff === 'Easy') {
      basePts = 75;
      baseCoins = 10;
    } else if (diff === 'Hard') {
      basePts = 200;
      baseCoins = 35;
    }

    if (state.selectedGameMode === 'speed') {
      basePts = Math.round(basePts * 1.5);
    }
    if (state.activeQuiz.isDaily) {
      baseCoins = Math.round(baseCoins * 2);
    }

    if (el.playCurrentQ) el.playCurrentQ.textContent = index + 1;
    if (el.playDifficultyTag) {
      el.playDifficultyTag.textContent = diff;
      el.playDifficultyTag.className = `difficulty-tag ${diff}`;
    }
    if (el.playPointsBadge) el.playPointsBadge.textContent = `+${basePts} pts`;
    if (el.playCoinsBadge) el.playCoinsBadge.textContent = `+${baseCoins} 🪙`;
    if (el.playQuestionText) el.playQuestionText.textContent = q.question;

    // Hide banners
    if (el.doublePointsBanner) el.doublePointsBanner.hidden = true;
    if (el.freezeActiveBanner) el.freezeActiveBanner.hidden = true;
    if (el.frozenOverlayBadge) el.frozenOverlayBadge.hidden = true;
    if (el.hintBanner) el.hintBanner.hidden = true;
    if (el.explanationBox) el.explanationBox.hidden = true;

    // Progress bar
    const progressPercent = (index / questions.length) * 100;
    if (el.playProgressFill) el.playProgressFill.style.width = `${progressPercent}%`;

    // Next button
    if (el.btnNextQuestion) {
      el.btnNextQuestion.disabled = true;
      el.btnNextQuestion.innerHTML = (index === questions.length - 1)
        ? `Finish Quiz <span class="arrow">🏆</span>`
        : `Next Question <span class="arrow">→</span>`;
    }
    if (el.actionStatusMsg) el.actionStatusMsg.textContent = 'Select an answer above';

    // Render Options
    if (el.optionsContainer) {
      el.optionsContainer.innerHTML = '';
      const keyShortcuts = ['1', '2', '3', '4'];

      q.options.forEach((optText, optIdx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.dataset.index = optIdx;
        btn.setAttribute('role', 'button');
        btn.setAttribute('aria-label', `Option ${optIdx + 1}: ${optText}`);

        btn.innerHTML = `
          <span class="option-key-badge">${keyShortcuts[optIdx]}</span>
          <span class="option-text">${escapeHTML(optText)}</span>
          <span class="option-icon-indicator" aria-hidden="true">✔</span>
        `;

        btn.addEventListener('click', () => handleOptionSelected(optIdx));
        el.optionsContainer.appendChild(btn);
      });
    }

    // Configure Timer
    if (state.selectedGameMode === 'zen') {
      if (el.playTimer) el.playTimer.textContent = '∞';
      if (el.timerCirclePath) el.timerCirclePath.setAttribute('stroke-dasharray', '100, 100');
      if (el.timerUnitLabel) el.timerUnitLabel.textContent = 'untimed';
    } else {
      let duration = state.activeQuiz.timePerQuestion || 20;
      if (state.selectedGameMode === 'speed') duration = 10;
      startQuestionTimer(duration);
    }

    updateLifelineButtons();
  }

  function startQuestionTimer(durationSeconds) {
    clearInterval(state.timerInterval);
    state.timerSecondsLeft = durationSeconds;
    state.timerMaxSeconds = durationSeconds;
    if (el.timerUnitLabel) el.timerUnitLabel.textContent = 'seconds';
    updateTimerDisplay(durationSeconds, durationSeconds);

    state.timerInterval = setInterval(() => {
      if (state.isTimerFrozen) return; // Paused during Time Freeze!

      state.timerSecondsLeft--;

      if (state.timerSecondsLeft <= 5 && state.timerSecondsLeft > 0) {
        sound.playTick();
      }

      updateTimerDisplay(state.timerSecondsLeft, state.timerMaxSeconds);

      if (state.timerSecondsLeft <= 0) {
        clearInterval(state.timerInterval);
        handleTimeExpired();
      }
    }, 1000);
  }

  function updateTimerDisplay(current, max) {
    if (el.playTimer) el.playTimer.textContent = current;
    if (el.timerCirclePath) {
      const pct = Math.max(0, (current / max) * 100);
      el.timerCirclePath.setAttribute('stroke-dasharray', `${pct}, 100`);

      if (current <= 5) el.timerCirclePath.style.stroke = 'var(--error)';
      else if (current <= 10) el.timerCirclePath.style.stroke = 'var(--warning)';
      else el.timerCirclePath.style.stroke = 'var(--accent-primary)';
    }
  }

  // Answer Evaluation
  function handleOptionSelected(selectedIndex) {
    clearInterval(state.timerInterval);
    clearTimeout(state.freezeTimeout);
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const q = state.activeQuiz.questions[state.currentQuestionIndex];
    const isCorrect = selectedIndex === q.correct;
    const optionButtons = el.optionsContainer.querySelectorAll('.option-btn');

    optionButtons.forEach(btn => {
      btn.disabled = true;
      btn.style.cursor = 'default';
    });

    optionButtons.forEach((btn, idx) => {
      const icon = btn.querySelector('.option-icon-indicator');
      if (idx === q.correct) {
        btn.classList.add('correct');
        if (icon) icon.textContent = '✔';
      }
      if (idx === selectedIndex && !isCorrect) {
        btn.classList.add('wrong');
        if (icon) icon.textContent = '✖';
      }
    });

    if (isCorrect) {
      sound.playCorrect();
      state.score++;
      state.streak++;
      if (state.streak > state.maxStreak) state.maxStreak = state.streak;

      // Combo Multiplier System:
      // Streak 1: 1.0x
      // Streak 2: 1.2x (+20 bonus pts)
      // Streak 3: 1.5x (+40 bonus pts)
      // Streak 4: 1.7x (+60 bonus pts)
      // Streak 5+: 2.0x (+100 bonus pts)
      // Streak 7+: 2.5x (+150 bonus pts)
      let streakBonusPts = 0;
      if (state.streak === 1) state.comboMultiplier = 1.0;
      else if (state.streak === 2) { state.comboMultiplier = 1.2; streakBonusPts = 20; }
      else if (state.streak === 3) { state.comboMultiplier = 1.5; streakBonusPts = 40; }
      else if (state.streak === 4) { state.comboMultiplier = 1.7; streakBonusPts = 60; }
      else if (state.streak >= 5 && state.streak < 7) { state.comboMultiplier = 2.0; streakBonusPts = 100; }
      else if (state.streak >= 7) { state.comboMultiplier = 2.5; streakBonusPts = 150; }

      // Check streak achievements
      if (state.streak >= 5) unlockAchievement('streak_master');
      if (state.streak >= 8) unlockAchievement('untouchable');

      // Base point calculation
      let basePts = 125;
      let baseCoins = 20;
      if (q.difficulty === 'Easy') { basePts = 75; baseCoins = 10; }
      if (q.difficulty === 'Hard') { basePts = 200; baseCoins = 35; }
      if (state.selectedGameMode === 'speed') basePts = Math.round(basePts * 1.5);

      // Hint penalty: -20 pts deduction if hint was used
      if (state.isHintUsedOnCurrentQ) {
        basePts = Math.max(25, basePts - 20);
      }

      // Double Points calculation
      let totalEarned = Math.round((basePts + streakBonusPts) * state.comboMultiplier);
      if (state.isDoublePointsActive) {
        totalEarned *= 2;
        baseCoins *= 2;
      }

      state.earnedPoints += totalEarned;
      state.coinsEarnedSession += baseCoins;
      addPlayerCoins(baseCoins);

      state.userProfile.totalCorrect++;
      localStorage.setItem('quiz_player_total_correct', state.userProfile.totalCorrect);
      if (state.userProfile.totalCorrect >= 10) unlockAchievement('ten_correct');

      if (el.actionStatusMsg) {
        let msg = `✨ <strong style="color:var(--success)">Correct! +${totalEarned} pts (${state.comboMultiplier.toFixed(1)}x Combo) +${baseCoins} 🪙</strong>`;
        if (state.isDoublePointsActive) msg += ` <span style="color:#f59e0b; font-weight:800;">(2× DOUBLE BONUS!)</span>`;
        el.actionStatusMsg.innerHTML = msg;
      }
    } else {
      sound.playWrong();
      state.streak = 0;
      state.comboMultiplier = 1.0;

      // Double Points risk penalty: -50 pts
      if (state.isDoublePointsActive) {
        state.earnedPoints = Math.max(0, state.earnedPoints - 50);
        if (el.actionStatusMsg) {
          el.actionStatusMsg.innerHTML = `❌ <strong style="color:var(--error)">Incorrect! -50 pts Double Risk Penalty applied!</strong>`;
        }
      } else {
        if (el.actionStatusMsg) {
          el.actionStatusMsg.innerHTML = `❌ <strong style="color:var(--error)">Incorrect. See explanation below.</strong>`;
        }
      }

      // SUDDEN DEATH CHECK: 1 mistake = instant game over
      if (state.selectedGameMode === 'survival') {
        setTimeout(() => {
          alert('💀 Sudden Death Game Over! One mistake ends the run.');
          finishQuiz();
        }, 1200);
        return;
      }
    }

    if (el.playScoreDisplay) el.playScoreDisplay.textContent = `${state.earnedPoints} pts`;
    if (el.playCoinsSession) el.playCoinsSession.textContent = `🪙 +${state.coinsEarnedSession}`;
    if (el.playStreakDisplay) el.playStreakDisplay.textContent = `🔥 ${state.streak} (${state.comboMultiplier.toFixed(1)}x)`;

    state.userAnswers.push({
      questionId: q.id,
      questionText: q.question,
      options: q.options,
      selected: selectedIndex,
      correct: q.correct,
      isCorrect,
      isSkipped: false,
      difficulty: q.difficulty,
      explanation: q.explanation || 'No explanation provided.'
    });

    if (el.explanationBox && q.explanation) {
      el.explanationBox.hidden = false;
      el.explanationTitle.textContent = isCorrect ? 'Insight' : 'Review Insight:';
      el.explanationIcon.textContent = isCorrect ? '🎉' : '💡';
      el.explanationText.textContent = q.explanation;
    }

    if (el.btnNextQuestion) el.btnNextQuestion.disabled = false;
  }

  function handleTimeExpired() {
    sound.playWrong();
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const q = state.activeQuiz.questions[state.currentQuestionIndex];
    const optionButtons = el.optionsContainer.querySelectorAll('.option-btn');

    optionButtons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correct) btn.classList.add('correct');
    });

    state.streak = 0;
    state.comboMultiplier = 1.0;
    if (el.playStreakDisplay) el.playStreakDisplay.textContent = `🔥 0 (1.0x)`;
    if (el.actionStatusMsg) el.actionStatusMsg.innerHTML = '⏱️ <strong style="color:var(--error)">Time Expired!</strong>';

    state.userAnswers.push({
      questionId: q.id,
      questionText: q.question,
      options: q.options,
      selected: -1,
      correct: q.correct,
      isCorrect: false,
      isSkipped: false,
      difficulty: q.difficulty,
      explanation: q.explanation || 'Time ran out on this question.'
    });

    if (el.explanationBox && q.explanation) {
      el.explanationBox.hidden = false;
      el.explanationTitle.textContent = 'Time Up — Correct Answer:';
      el.explanationIcon.textContent = '⏱️';
      el.explanationText.textContent = q.explanation;
    }

    if (state.selectedGameMode === 'survival') {
      setTimeout(() => {
        alert('💀 Sudden Death Game Over! Time ran out.');
        finishQuiz();
      }, 1200);
      return;
    }

    if (el.btnNextQuestion) el.btnNextQuestion.disabled = false;
  }

  // ==========================================================================
  // 13. The 8 Power-Ups / Lifelines Implementation
  // ==========================================================================

  // 1. 50-50 Lifeline
  function useLifeline5050() {
    if (state.inventory.fiftyFifty <= 0) {
      promptBuyPowerup('fiftyFifty');
      return;
    }

    const q = state.activeQuiz.questions[state.currentQuestionIndex];
    const optionButtons = Array.from(el.optionsContainer.querySelectorAll('.option-btn'));

    const incorrectIndices = [0, 1, 2, 3].filter(idx => idx !== q.correct && idx < q.options.length);
    incorrectIndices.sort(() => Math.random() - 0.5);
    const toDisable = incorrectIndices.slice(0, 2);

    toDisable.forEach(idx => {
      if (optionButtons[idx]) {
        optionButtons[idx].classList.add('lifeline-disabled');
        optionButtons[idx].disabled = true;
      }
    });

    state.inventory.fiftyFifty--;
    state.powerupsUsedCount++;
    saveInventory();
    sound.playClick();
    showToast('🪄', '50:50 Lifeline Activated', '2 incorrect options eliminated!');
  }

  // 2. Skip Question
  function useLifelineSkip() {
    if (state.inventory.skip <= 0) {
      promptBuyPowerup('skip');
      return;
    }

    clearInterval(state.timerInterval);
    const q = state.activeQuiz.questions[state.currentQuestionIndex];

    state.inventory.skip--;
    state.powerupsUsedCount++;
    saveInventory();
    sound.playBoost();

    state.userAnswers.push({
      questionId: q.id,
      questionText: q.question,
      options: q.options,
      selected: -1,
      correct: q.correct,
      isCorrect: true, // marked harmlessly
      isSkipped: true,
      difficulty: q.difficulty,
      explanation: q.explanation || 'Question skipped with power-up.'
    });

    showToast('⏭️', 'Question Skipped!', 'Advancing without losing points or resetting your streak!');
    renderQuestion(state.currentQuestionIndex + 1);
  }

  // 3. Hint Lifeline
  function useLifelineHint() {
    if (state.inventory.hint <= 0) {
      promptBuyPowerup('hint');
      return;
    }

    const q = state.activeQuiz.questions[state.currentQuestionIndex];
    const hint = q.hint || "Carefully eliminate the options that contradict core principles.";

    state.isHintUsedOnCurrentQ = true;
    if (el.hintBanner && el.hintBannerText) {
      el.hintBannerText.textContent = hint;
      el.hintBanner.hidden = false;
    }

    state.inventory.hint--;
    state.powerupsUsedCount++;
    saveInventory();
    sound.playClick();
    showToast('💡', 'Smart Clue Revealed', 'A clue is displayed (-20 pts deduction if answered correctly).');
  }

  // 4. Time Freeze (7 seconds)
  function useLifelineFreeze() {
    if (state.inventory.freeze <= 0 || state.selectedGameMode === 'zen') {
      if (state.inventory.freeze <= 0) promptBuyPowerup('freeze');
      return;
    }

    if (state.isTimerFrozen) return;

    state.isTimerFrozen = true;
    state.inventory.freeze--;
    state.powerupsUsedCount++;
    saveInventory();
    sound.playFreeze();

    if (el.freezeActiveBanner) el.freezeActiveBanner.hidden = false;
    if (el.frozenOverlayBadge) el.frozenOverlayBadge.hidden = false;
    if (el.timerCirclePath) el.timerCirclePath.style.stroke = '#38bdf8';

    showToast('❄️', 'Time Frozen!', 'Countdown is suspended for 7 seconds!');

    state.freezeTimeout = setTimeout(() => {
      state.isTimerFrozen = false;
      if (el.freezeActiveBanner) el.freezeActiveBanner.hidden = true;
      if (el.frozenOverlayBadge) el.frozenOverlayBadge.hidden = true;
      sound.playBoost();
      showToast('⏳', 'Timer Resumed', 'Time is ticking again!');
    }, 7000);
  }

  // 5. Double Points (2× Risk)
  function useLifelineDouble() {
    if (state.inventory.doublePoints <= 0) {
      promptBuyPowerup('doublePoints');
      return;
    }

    if (state.isDoublePointsActive) return;

    state.isDoublePointsActive = true;
    state.inventory.doublePoints--;
    state.powerupsUsedCount++;
    saveInventory();
    sound.playBoost();

    if (el.doublePointsBanner) el.doublePointsBanner.hidden = false;
    showToast('2️⃣', 'Double or Nothing Active!', 'Get 2× points and XP if correct, or -50 pts if wrong!');
  }

  // 6. Extra Time (+15s)
  function useLifelineExtraTime() {
    if (state.inventory.extraTime <= 0 || state.selectedGameMode === 'zen') {
      if (state.inventory.extraTime <= 0) promptBuyPowerup('extraTime');
      return;
    }

    state.timerSecondsLeft += 15;
    state.timerMaxSeconds = Math.max(state.timerMaxSeconds, state.timerSecondsLeft);
    updateTimerDisplay(state.timerSecondsLeft, state.timerMaxSeconds);

    state.inventory.extraTime--;
    state.powerupsUsedCount++;
    saveInventory();
    sound.playBoost();
    showToast('⏳', '+15 Seconds Added!', 'Extra breathing room added to the clock.');
  }

  // 7. Audience Poll
  function useLifelinePoll() {
    if (state.inventory.audiencePoll <= 0) {
      promptBuyPowerup('audiencePoll');
      return;
    }

    const q = state.activeQuiz.questions[state.currentQuestionIndex];
    state.inventory.audiencePoll--;
    state.powerupsUsedCount++;
    saveInventory();
    sound.playCrowd();

    // Generate realistic audience distribution biased towards correct answer
    const diff = q.difficulty || 'Medium';
    let correctPct = 65;
    if (diff === 'Easy') correctPct = 70 + Math.floor(Math.random() * 15); // 70-85%
    else if (diff === 'Medium') correctPct = 50 + Math.floor(Math.random() * 20); // 50-70%
    else if (diff === 'Hard') correctPct = 38 + Math.floor(Math.random() * 18); // 38-56%

    let remainingPct = 100 - correctPct;
    const wrongCount = q.options.length - 1;
    const wrongPcts = [];
    for (let i = 0; i < wrongCount - 1; i++) {
      const share = Math.floor(Math.random() * (remainingPct / 2));
      wrongPcts.push(share);
      remainingPct -= share;
    }
    wrongPcts.push(remainingPct);
    wrongPcts.sort(() => Math.random() - 0.5);

    const letterKeys = ['A', 'B', 'C', 'D'];
    if (el.pollBarsContainer) {
      el.pollBarsContainer.innerHTML = '';
      let wrongIdx = 0;

      q.options.forEach((optText, idx) => {
        const isCor = idx === q.correct;
        const pct = isCor ? correctPct : wrongPcts[wrongIdx++];

        const row = document.createElement('div');
        row.className = 'poll-row';
        row.innerHTML = `
          <div class="poll-row-label">
            <span><strong>${letterKeys[idx]}:</strong> ${escapeHTML(optText)}</span>
            <span class="font-mono">${pct}%</span>
          </div>
          <div class="poll-bar-track">
            <div class="poll-bar-fill ${isCor ? 'highest' : ''}" style="width: 0%;">
              ${pct}%
            </div>
          </div>
        `;
        el.pollBarsContainer.appendChild(row);

        // Animate fill bar after render
        setTimeout(() => {
          const fill = row.querySelector('.poll-bar-fill');
          if (fill) fill.style.width = `${pct}%`;
        }, 100);
      });
    }

    el.dialogAudiencePoll?.showModal();
  }

  // 8. Ask a Friend
  function useLifelineFriend() {
    if (state.inventory.askFriend <= 0) {
      promptBuyPowerup('askFriend');
      return;
    }

    const q = state.activeQuiz.questions[state.currentQuestionIndex];
    state.inventory.askFriend--;
    state.powerupsUsedCount++;
    saveInventory();
    sound.playBoost();

    // Select virtual friend persona
    const personas = [
      { name: 'Dr. Elena Vance', title: 'Astrophysicist & Quantum Researcher', avatar: '👩‍🔬' },
      { name: 'Sam Chen', title: 'Senior Software Architect', avatar: '👨‍💻' },
      { name: 'Marco Rossi', title: 'National Geographic Explorer', avatar: '🧭' },
      { name: 'Maya Patel', title: 'Grand Trivia Champion', avatar: '🦉' }
    ];
    const friend = personas[Math.floor(Math.random() * personas.length)];
    const correctLetter = ['A', 'B', 'C', 'D'][q.correct];
    const correctText = q.options[q.correct];
    const confidence = 75 + Math.floor(Math.random() * 20); // 75-95%

    const dialogue = `“Hey ${state.userProfile.name}! Looking at the options, Option ${correctLetter} ('${correctText}') is definitely the right answer. I remember studying this exact concept recently — go with ${correctLetter}!”`;

    if (el.friendModalBody) {
      el.friendModalBody.innerHTML = `
        <div class="friend-profile-card">
          <div class="friend-avatar-circle">${friend.avatar}</div>
          <div>
            <h4 class="friend-name">${friend.name}</h4>
            <div class="friend-title">${friend.title}</div>
          </div>
        </div>
        <div class="friend-speech-bubble">
          ${escapeHTML(dialogue)}
        </div>
        <div class="friend-confidence-wrap">
          <div class="confidence-header">
            <span>FRIEND CONFIDENCE LEVEL:</span>
            <span class="font-mono" style="color:var(--success)">${confidence}%</span>
          </div>
          <div class="confidence-track">
            <div class="confidence-fill" style="width: 0%;"></div>
          </div>
        </div>
      `;

      setTimeout(() => {
        const fill = el.friendModalBody.querySelector('.confidence-fill');
        if (fill) fill.style.width = `${confidence}%`;
      }, 100);
    }

    el.dialogAskFriend?.showModal();
  }

  function promptBuyPowerup(pid) {
    const meta = POWERUPS_CATALOG.find(p => p.id === pid);
    if (!meta) return;
    if (confirm(`You have 0 uses of ${meta.name}. Would you like to open the Shop to get more?`)) {
      openShopModal();
    }
  }

  // Text-To-Speech (SpeechSynthesis)
  function speakQuestionAloud() {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported by your browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const q = state.activeQuiz.questions[state.currentQuestionIndex];
    const fullText = `${q.question}. Option 1: ${q.options[0]}. Option 2: ${q.options[1]}. Option 3: ${q.options[2]}. Option 4: ${q.options[3]}.`;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
    sound.playClick();
  }

  // ==========================================================================
  // 14. Results, Badges, and Certificate Generation
  // ==========================================================================
  async function finishQuiz() {
    clearInterval(state.timerInterval);
    clearTimeout(state.freezeTimeout);
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const totalQ = state.activeQuiz.questions.length;
    const totalSeconds = Math.max(1, Math.round((Date.now() - state.quizStartTime) / 1000));
    state.totalTimeTaken = totalSeconds;
    const percentage = Math.round((state.score / totalQ) * 100);

    // XP calculation
    let xpGained = state.score * 50 + (state.maxStreak * 15) + (percentage === 100 ? 150 : 0);
    if (state.activeQuiz.isDaily) xpGained += 150;
    addPlayerXP(xpGained);

    // Finish quiz bonus coins
    let finishCoins = 30;
    if (percentage === 100) finishCoins += 50;
    if (state.activeQuiz.isDaily) finishCoins += 100;
    addPlayerCoins(finishCoins, 'Quiz completion reward');

    // Daily Challenge completion tracking
    if (state.activeQuiz.isDaily) {
      const today = getTodayDateString();
      if (state.userProfile.lastDailyDate !== today) {
        state.userProfile.lastDailyDate = today;
        state.userProfile.dailyStreak = (state.userProfile.dailyStreak || 0) + 1;
        localStorage.setItem('quiz_last_daily_date', today);
        localStorage.setItem('quiz_daily_streak', state.userProfile.dailyStreak);
        unlockAchievement('daily_victor');
      }
    }

    // Check quiz achievements
    unlockAchievement('first_victory');
    if (percentage === 100) unlockAchievement('perfect_round');
    if ((totalSeconds / totalQ) < 5) unlockAchievement('speed_demon');
    if (state.powerupsUsedCount >= 3) unlockAchievement('power_player');

    // Audio & Confetti
    if (percentage >= 70) {
      sound.playFanfare();
      launchConfetti();
    } else {
      sound.playCorrect();
    }

    // Populate Results View
    if (el.resultsPercentage) el.resultsPercentage.textContent = `${percentage}%`;
    if (el.resultsScoreFraction) el.resultsScoreFraction.textContent = `${state.score} / ${totalQ}`;
    if (el.resultsTimeTaken) el.resultsTimeTaken.textContent = `${totalSeconds}s`;
    if (el.resultsMaxStreak) el.resultsMaxStreak.textContent = `${state.maxStreak}`;
    if (el.resultsCoinsEarned) el.resultsCoinsEarned.textContent = `+${state.coinsEarnedSession + finishCoins} 🪙`;
    if (el.resultsXpEarned) el.resultsXpEarned.textContent = `+${xpGained} XP`;
    if (el.resultsAvgSpeed) el.resultsAvgSpeed.textContent = `${(totalSeconds / totalQ).toFixed(1)}s`;

    // Grade Text
    let grade = 'Keep Practicing!';
    if (percentage === 100) grade = 'Flawless Master!';
    else if (percentage >= 80) grade = 'Outstanding!';
    else if (percentage >= 70) grade = 'Certified Scholar!';
    else if (percentage >= 50) grade = 'Good Effort!';
    if (el.resultsGrade) el.resultsGrade.textContent = grade;

    if (el.certificateOfferBox) {
      el.certificateOfferBox.hidden = percentage < 70;
    }

    renderEarnedBadges(percentage, totalSeconds, totalQ);
    saveScoreToBackend(percentage, totalSeconds, totalQ);
    renderReviewList();

    switchView('results');
  }

  function renderEarnedBadges(percentage, totalSeconds, totalQ) {
    if (!el.resultsBadgesRow) return;
    el.resultsBadgesRow.innerHTML = '';

    const badges = [];
    if (percentage === 100) badges.push({ icon: '👑', label: 'Flawless 100%' });
    if (percentage >= 70) badges.push({ icon: '📜', label: 'Certified Scholar' });
    if (state.maxStreak >= 5) badges.push({ icon: '🔥', label: `Streak Master (${state.maxStreak}x)` });
    if ((totalSeconds / totalQ) < 5) badges.push({ icon: '⚡', label: 'Speed Demon' });
    if (state.activeQuiz.isDaily) badges.push({ icon: '🌟', label: 'Daily Quest Master' });
    badges.push({ icon: '⭐', label: 'Knowledge Champion' });

    badges.forEach(b => {
      const span = document.createElement('span');
      span.className = 'earned-badge';
      span.innerHTML = `<span>${b.icon}</span> <span>${b.label}</span>`;
      el.resultsBadgesRow.appendChild(span);
    });
  }

  async function saveScoreToBackend(percentage, totalSeconds, totalQ) {
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: state.activeQuiz.id,
          quizTitle: `${state.activeQuiz.title} (${state.selectedGameMode.toUpperCase()})`,
          userName: state.userProfile.name,
          userAvatar: state.userProfile.avatar,
          score: state.score,
          total: totalQ,
          percentage,
          earnedPoints: state.earnedPoints,
          maxStreak: state.maxStreak,
          difficulty: state.selectedDifficultyFilter || 'Medium',
          timeTakenSeconds: totalSeconds
        })
      });
    } catch {}
  }

  function renderReviewList() {
    if (!el.reviewListContainer) return;
    el.reviewListContainer.innerHTML = '';

    if (el.reviewSummaryTag) {
      el.reviewSummaryTag.textContent = `${state.score} of ${state.userAnswers.length} Correct`;
    }

    state.userAnswers.forEach((ans, idx) => {
      const item = document.createElement('div');
      item.className = `review-item ${ans.isCorrect ? 'item-correct' : 'item-wrong'}`;

      let userChoiceText = '(Timed out / Skipped)';
      if (ans.selected >= 0 && ans.options[ans.selected]) {
        userChoiceText = ans.options[ans.selected];
      } else if (ans.isSkipped) {
        userChoiceText = '⏭️ Skipped with Power-up (No penalty)';
      }

      const correctChoiceText = ans.options[ans.correct];

      item.innerHTML = `
        <div class="review-item-header">
          <span style="font-weight:700; color:var(--text-muted); font-size:0.85rem;">Question ${idx + 1} (${ans.difficulty || 'Medium'})</span>
          <span class="difficulty-tag ${ans.isCorrect ? 'Easy' : 'Hard'}">
            ${ans.isCorrect ? '✔ Correct' : '✖ Incorrect'}
          </span>
        </div>
        <h4 class="review-q-title">${escapeHTML(ans.questionText)}</h4>
        <div class="review-answers-grid">
          ${!ans.isCorrect || ans.isSkipped ? `
            <div class="review-ans-pill selected-wrong">
              <strong>Your action:</strong> ${escapeHTML(userChoiceText)}
            </div>
          ` : ''}
          <div class="review-ans-pill actual-correct">
            <strong>${ans.isCorrect ? 'Your Answer (Correct):' : 'Correct Answer:'}</strong> ${escapeHTML(correctChoiceText)}
          </div>
        </div>
        <div class="review-item-explanation">
          <strong>💡 Insight:</strong> ${escapeHTML(ans.explanation)}
        </div>
      `;
      el.reviewListContainer.appendChild(item);
    });
  }

  // ==========================================================================
  // 15. Canvas Certificate Generator
  // ==========================================================================
  function generateCertificate() {
    const canvas = el.certCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Background gradient (Parchment Luxury)
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Double Gold Border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    const drawCorner = (x, y) => {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x - 6, y - 6, 12, 12);
    };
    drawCorner(30, 30);
    drawCorner(w - 30, 30);
    drawCorner(30, h - 30);
    drawCorner(w - 30, h - 30);

    // Header Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.fillText('QUIZSPHERE GLOBAL ACADEMY OF EXCELLENCE', w / 2, 75);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 36px "Plus Jakarta Sans", serif';
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', w / 2, 125);

    // Subtitle
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('This official credential certifies that', w / 2, 175);

    // Recipient Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(state.userProfile.name, w / 2, 230);

    // Underline
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 180, 245);
    ctx.lineTo(w / 2 + 180, 245);
    ctx.stroke();

    // Body text
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('has successfully mastered and demonstrated excellence in the assessment', w / 2, 285);

    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(state.activeQuiz ? state.activeQuiz.title : 'Quiz Assessment', w / 2, 325);

    const percentage = Math.round((state.score / (state.activeQuiz ? state.activeQuiz.questions.length : 1)) * 100);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.fillText(`Final Accuracy: ${percentage}%  •  Rank: Certified Scholar`, w / 2, 365);

    const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Left: Date
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Issued: ${dateStr}`, 80, 480);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(80, 460);
    ctx.lineTo(240, 460);
    ctx.stroke();

    // Center Gold Seal
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f59e0b';
    ctx.font = '48px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('🌟', w / 2, 475);
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillText('VERIFIED CREDENTIAL', w / 2, 495);

    // Right: Signature
    ctx.textAlign = 'right';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('QuizSphere Board', w - 80, 480);
    ctx.beginPath();
    ctx.moveTo(w - 240, 460);
    ctx.lineTo(w - 80, 460);
    ctx.stroke();

    el.dialogCertificate?.showModal();
  }

  function downloadCertificate() {
    const canvas = el.certCanvas;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `QuizSphere-Certificate-${state.userProfile.name}.png`;
    a.click();
  }

  function printCertificate() {
    const canvas = el.certCanvas;
    if (!canvas) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head><title>Print Certificate</title></head>
        <body style="margin:0; display:flex; align-items:center; justify-content:center; min-height:100vh; background:#111;">
          <img src="${canvas.toDataURL('image/png')}" style="max-width:90%; height:auto;" onload="window.print(); window.close();"/>
        </body>
      </html>
    `);
    win.document.close();
  }

  // ==========================================================================
  // 16. Leaderboard Engine
  // ==========================================================================
  async function loadLeaderboard() {
    if (!el.leaderboardTbody) return;
    el.leaderboardTbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding: 2rem;">Loading leaderboard...</td>
      </tr>
    `;

    let scores = [];
    try {
      const res = await fetch('/api/scores');
      if (res.ok) scores = await res.json();
    } catch {
      scores = [];
    }

    const filterVal = el.leaderboardQuizFilter ? el.leaderboardQuizFilter.value : 'all';
    if (filterVal !== 'all') {
      scores = scores.filter(s => s.quizId === filterVal);
    }

    el.leaderboardTbody.innerHTML = '';
    if (scores.length === 0) {
      if (el.leaderboardEmpty) el.leaderboardEmpty.hidden = false;
      return;
    }
    if (el.leaderboardEmpty) el.leaderboardEmpty.hidden = true;

    scores.forEach((s, idx) => {
      const row = document.createElement('tr');
      const rankNum = idx + 1;
      let rankDisplay = `<span class="rank-pill font-mono">${rankNum}</span>`;
      if (rankNum === 1) rankDisplay = `<span class="rank-pill rank-1 font-mono">🥇 1</span>`;
      else if (rankNum === 2) rankDisplay = `<span class="rank-pill rank-2 font-mono">🥈 2</span>`;
      else if (rankNum === 3) rankDisplay = `<span class="rank-pill rank-3 font-mono">🥉 3</span>`;

      const formattedDate = s.date ? new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent';

      row.innerHTML = `
        <td class="col-rank">${rankDisplay}</td>
        <td class="col-player">
          <span style="margin-right:0.35rem;">${s.userAvatar || '👤'}</span>
          <strong>${escapeHTML(s.userName || 'Player')}</strong>
        </td>
        <td class="col-quiz">${escapeHTML(s.quizTitle || 'Quiz')}</td>
        <td class="col-score font-mono">${s.score} / ${s.total}</td>
        <td class="col-pct"><span style="color:var(--success); font-weight:700;">${s.percentage}%</span></td>
        <td class="col-time font-mono">${s.timeTakenSeconds || 0}s</td>
        <td class="col-date" style="color:var(--text-muted); font-size:0.85rem;">${formattedDate}</td>
      `;
      el.leaderboardTbody.appendChild(row);
    });
  }

  function populateLeaderboardFilter() {
    if (!el.leaderboardQuizFilter) return;
    const currentVal = el.leaderboardQuizFilter.value;
    el.leaderboardQuizFilter.innerHTML = '<option value="all">All Quizzes</option>';

    state.quizzes.forEach(q => {
      const opt = document.createElement('option');
      opt.value = q.id;
      opt.textContent = q.title;
      el.leaderboardQuizFilter.appendChild(opt);
    });

    el.leaderboardQuizFilter.value = currentVal || 'all';
  }

  // ==========================================================================
  // 17. Quiz Creator (JSON + CSV Import/Export)
  // ==========================================================================
  let customQuestionCounter = 0;

  function resetCreatorForm() {
    if (el.createQuizForm) el.createQuizForm.reset();
    if (el.cqQuestionsContainer) el.cqQuestionsContainer.innerHTML = '';
    customQuestionCounter = 0;
    addQuestionItemToCreator();
    addQuestionItemToCreator();
  }

  function addQuestionItemToCreator(initialData = null) {
    customQuestionCounter++;
    const qIndex = customQuestionCounter;

    const card = document.createElement('div');
    card.className = 'creator-q-card';
    card.dataset.cardIndex = qIndex;

    const defaultQ = initialData || {
      question: '',
      options: ['', '', '', ''],
      correct: 0,
      difficulty: 'Medium',
      hint: '',
      explanation: ''
    };

    card.innerHTML = `
      <div class="creator-q-top">
        <span class="cq-index-title">Question #${qIndex}</span>
        <button type="button" class="btn-remove-q" title="Remove question">✕ Delete</button>
      </div>

      <div class="form-group">
        <label>Question Prompt *</label>
        <input type="text" class="form-input cq-q-text" required placeholder="e.g. What is the output of 2 + 2 in JS?" value="${escapeHTML(defaultQ.question)}">
      </div>

      <div class="form-group">
        <label>Difficulty</label>
        <select class="form-select cq-difficulty">
          <option value="Easy" ${defaultQ.difficulty === 'Easy' ? 'selected' : ''}>Easy</option>
          <option value="Medium" ${defaultQ.difficulty === 'Medium' ? 'selected' : ''}>Medium</option>
          <option value="Hard" ${defaultQ.difficulty === 'Hard' ? 'selected' : ''}>Hard</option>
        </select>
      </div>

      <label style="font-size:0.85rem; font-weight:600; color:var(--text-muted); margin-top:0.35rem;">
        Choices & Correct Selection (Radio = Correct Answer)
      </label>

      <div class="cq-options-builder">
        ${[0, 1, 2, 3].map(optI => `
          <div class="cq-option-row">
            <input type="radio" name="cq-correct-${qIndex}" class="cq-correct-radio" value="${optI}" ${defaultQ.correct === optI ? 'checked' : ''} title="Mark as correct answer">
            <input type="text" class="form-input cq-opt-text" required placeholder="Option ${optI + 1}" value="${escapeHTML(defaultQ.options[optI] || '')}">
          </div>
        `).join('')}
      </div>

      <div class="form-group" style="margin-top:0.5rem;">
        <label>Hint (Clue for Smart Hint Lifeline)</label>
        <input type="text" class="form-input cq-hint" placeholder="Helpful clue without giving away the direct answer" value="${escapeHTML(defaultQ.hint || '')}">
      </div>

      <div class="form-group">
        <label>Educational Explanation</label>
        <input type="text" class="form-input cq-explanation" placeholder="Why is this answer correct?" value="${escapeHTML(defaultQ.explanation || '')}">
      </div>
    `;

    card.querySelector('.btn-remove-q').addEventListener('click', () => {
      const total = el.cqQuestionsContainer.querySelectorAll('.creator-q-card').length;
      if (total <= 1) {
        alert('A quiz must contain at least one question.');
        return;
      }
      card.remove();
      updateCreatorQCount();
    });

    el.cqQuestionsContainer.appendChild(card);
    updateCreatorQCount();
  }

  function updateCreatorQCount() {
    const total = el.cqQuestionsContainer.querySelectorAll('.creator-q-card').length;
    if (el.cqQuestionsCount) el.cqQuestionsCount.textContent = total;
  }

  async function handleCreatorSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('cq-title').value.trim();
    const category = document.getElementById('cq-category').value;
    const icon = document.getElementById('cq-icon').value;
    const description = document.getElementById('cq-desc').value.trim();
    const timePerQuestion = parseInt(document.getElementById('cq-time').value, 10) || 20;

    const cards = el.cqQuestionsContainer.querySelectorAll('.creator-q-card');
    const questions = [];

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const qText = card.querySelector('.cq-q-text').value.trim();
      const difficulty = card.querySelector('.cq-difficulty').value;
      const hint = card.querySelector('.cq-hint').value.trim();
      const explanation = card.querySelector('.cq-explanation').value.trim();
      const optInputs = card.querySelectorAll('.cq-opt-text');
      const options = Array.from(optInputs).map(inp => inp.value.trim());

      const radio = card.querySelector('.cq-correct-radio:checked');
      const correctIndex = radio ? parseInt(radio.value, 10) : 0;

      if (!qText) {
        alert(`Question #${i + 1} needs a question text.`);
        return;
      }
      if (options.some(opt => !opt)) {
        alert(`Please fill in all 4 options for Question #${i + 1}.`);
        return;
      }

      questions.push({
        question: qText,
        options,
        correct: correctIndex,
        difficulty,
        hint,
        explanation
      });
    }

    const payload = {
      title,
      category,
      icon,
      description,
      timePerQuestion,
      questions
    };

    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Server error');

      el.dialogCreateQuiz.close();
      await fetchQuizzes();
      sound.playFanfare();
      alert(`🎉 Quiz "${title}" published successfully!`);
    } catch (err) {
      alert(`Saved locally for this session.`);
      payload.id = 'local-' + Date.now();
      payload.isCustom = true;
      payload.questionCount = questions.length;
      state.quizzes.unshift(payload);
      el.dialogCreateQuiz.close();
      renderQuizGrid();
    }
  }

  function exportSampleJSON() {
    const template = {
      title: "Sample Quiz Export",
      category: "Technology",
      icon: "💡",
      description: "Sample exported quiz ready for QuizSphere import",
      timePerQuestion: 20,
      questions: [
        {
          question: "What does HTML stand for?",
          options: [
            "Hyper Text Markup Language",
            "High Tech Modern Language",
            "Hyperlinks and Text Markup Language",
            "Home Tool Markup Language"
          ],
          correct: 0,
          difficulty: "Easy",
          hint: "The fundamental markup structure of the World Wide Web.",
          explanation: "HTML is the standard markup language used to structure web documents."
        }
      ]
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'quiz-template.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function handleJSONImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (!imported.questions || !Array.isArray(imported.questions)) {
          throw new Error('Invalid format. Expected a "questions" array.');
        }

        if (document.getElementById('cq-title')) document.getElementById('cq-title').value = imported.title || 'Imported Quiz';
        if (document.getElementById('cq-category')) document.getElementById('cq-category').value = imported.category || 'Custom';
        if (document.getElementById('cq-icon')) document.getElementById('cq-icon').value = imported.icon || '✨';
        if (document.getElementById('cq-desc')) document.getElementById('cq-desc').value = imported.description || '';
        if (document.getElementById('cq-time')) document.getElementById('cq-time').value = imported.timePerQuestion || 20;

        el.cqQuestionsContainer.innerHTML = '';
        customQuestionCounter = 0;
        imported.questions.forEach(q => addQuestionItemToCreator(q));

        alert(`Successfully imported ${imported.questions.length} questions from JSON!`);
      } catch (err) {
        alert(`Failed to import JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function exportSampleCSV() {
    const header = "Question,Option1,Option2,Option3,Option4,CorrectIndex(0-3),Difficulty,Hint,Explanation\n";
    const sample = '"What does CSS stand for?","Cascading Style Sheets","Computer Style Sheets","Creative Styling Sheet","Color Style Selector",0,"Easy","Used for web styling","CSS defines colors, layout, and visual presentation on the web."\n';
    
    const blob = new Blob([header + sample], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'quizzes-template.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function handleCSVImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length <= 1) throw new Error('CSV is empty or missing data rows.');

        const rows = lines.slice(1);
        el.cqQuestionsContainer.innerHTML = '';
        customQuestionCounter = 0;

        rows.forEach(row => {
          const cols = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || row.split(',');
          const cleaned = cols.map(c => c.replace(/^"|"$/g, '').trim());

          if (cleaned.length >= 6) {
            addQuestionItemToCreator({
              question: cleaned[0],
              options: [cleaned[1], cleaned[2], cleaned[3], cleaned[4]],
              correct: parseInt(cleaned[5], 10) || 0,
              difficulty: cleaned[6] || 'Medium',
              hint: cleaned[7] || '',
              explanation: cleaned[8] || ''
            });
          }
        });

        alert(`Successfully imported questions from CSV!`);
      } catch (err) {
        alert(`Failed to import CSV: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // ==========================================================================
  // 18. Global Event Setup & Handlers
  // ==========================================================================
  function setupPreferenceEvents() {
    el.btnSoundToggle?.addEventListener('click', () => {
      const isEnabled = sound.toggle();
      if (el.soundIndicator) el.soundIndicator.textContent = isEnabled ? '🔊' : '🔇';
    });

    const savedTheme = localStorage.getItem('quiz_theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    const updateThemeUI = (theme) => {
      if (el.themeIndicator) el.themeIndicator.textContent = theme === 'dark' ? '🌙' : '☀️';
    };
    updateThemeUI(savedTheme);

    el.btnThemeToggle?.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', nextTheme);
      localStorage.setItem('quiz_theme', nextTheme);
      updateThemeUI(nextTheme);
    });
  }

  function setupProfileEvents() {
    const openProfile = () => {
      syncUserProfileUI();
      el.dialogPlayerName?.showModal();
    };

    el.playerChip?.addEventListener('click', openProfile);
    el.playerXpContainer?.addEventListener('click', openProfile);
    el.playerCoinsChip?.addEventListener('click', openShopModal);

    el.btnClosePlayerDialog?.addEventListener('click', () => el.dialogPlayerName?.close());

    el.avatarChoicesGrid?.addEventListener('click', (e) => {
      const opt = e.target.closest('.avatar-option');
      if (!opt) return;
      el.avatarChoicesGrid.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });

    el.playerNameForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = el.inputPlayerName.value.trim();
      const selectedAvatar = el.avatarChoicesGrid.querySelector('.avatar-option.selected')?.dataset.avatar || '👤';

      if (newName) {
        state.userProfile.name = newName;
        state.userProfile.avatar = selectedAvatar;
        localStorage.setItem('quiz_player_name', newName);
        localStorage.setItem('quiz_player_avatar', selectedAvatar);
        syncUserProfileUI();
        el.dialogPlayerName?.close();
        sound.playClick();
      }
    });
  }

  function setupEventListeners() {
    // Nav links
    el.navHome?.addEventListener('click', () => switchView('home'));
    el.navLeaderboard?.addEventListener('click', () => switchView('leaderboard'));
    el.navAchievements?.addEventListener('click', openAchievementsModal);
    el.navInventory?.addEventListener('click', openShopModal);
    el.btnQuickOpenShop?.addEventListener('click', openShopModal);
    el.brandLogo?.addEventListener('click', () => switchView('home'));

    // Hero quick launches
    el.btnHeroDailyChallenge?.addEventListener('click', launchDailyChallenge);
    el.btnStartDailyChallenge?.addEventListener('click', launchDailyChallenge);
    el.btnHeroRandomQuiz?.addEventListener('click', launchRandomQuiz);

    // Search and filters
    el.searchInput?.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (el.btnClearSearch) el.btnClearSearch.hidden = !state.searchQuery;
      renderQuizGrid();
    });

    el.btnClearSearch?.addEventListener('click', () => {
      if (el.searchInput) el.searchInput.value = '';
      state.searchQuery = '';
      el.btnClearSearch.hidden = true;
      renderQuizGrid();
    });

    el.categoryPills?.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill');
      if (!pill) return;
      el.categoryPills.querySelectorAll('.filter-pill').forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
      state.activeCategory = pill.dataset.category || 'All';
      renderQuizGrid();
    });

    el.selectDifficultyFilter?.addEventListener('change', (e) => {
      state.selectedDifficultyFilter = e.target.value;
    });

    // Quiz Grid start button
    el.quizGrid?.addEventListener('click', async (e) => {
      const startBtn = e.target.closest('.btn-start');
      if (startBtn) {
        const quizId = startBtn.dataset.quizId;
        promptGameMode(quizId);
        return;
      }

      const deleteBtn = e.target.closest('.btn-delete-card');
      if (deleteBtn) {
        const quizId = deleteBtn.dataset.deleteId;
        if (confirm('Delete this custom quiz?')) {
          try {
            await fetch(`/api/quizzes/${quizId}`, { method: 'DELETE' });
            fetchQuizzes();
          } catch {
            state.quizzes = state.quizzes.filter(q => q.id !== quizId);
            renderQuizGrid();
          }
        }
      }
    });

    // Active Play View Controls
    el.btnExitQuiz?.addEventListener('click', () => {
      if (confirm('Are you sure you want to exit? Your progress in this round will be lost.')) {
        clearInterval(state.timerInterval);
        clearTimeout(state.freezeTimeout);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        switchView('home');
      }
    });

    el.btnNextQuestion?.addEventListener('click', () => {
      sound.playClick();
      renderQuestion(state.currentQuestionIndex + 1);
    });

    // All 8 Power-Up button click handlers
    el.btnLifeline5050?.addEventListener('click', useLifeline5050);
    el.btnLifelineSkip?.addEventListener('click', useLifelineSkip);
    el.btnLifelineHint?.addEventListener('click', useLifelineHint);
    el.btnLifelineFreeze?.addEventListener('click', useLifelineFreeze);
    el.btnLifelineDouble?.addEventListener('click', useLifelineDouble);
    el.btnLifelineExtraTime?.addEventListener('click', useLifelineExtraTime);
    el.btnLifelinePoll?.addEventListener('click', useLifelinePoll);
    el.btnLifelineFriend?.addEventListener('click', useLifelineFriend);
    el.btnTtsRead?.addEventListener('click', speakQuestionAloud);

    // Modals Dismiss Handlers
    el.btnDismissPoll?.addEventListener('click', () => el.dialogAudiencePoll?.close());
    el.btnDismissFriend?.addEventListener('click', () => el.dialogAskFriend?.close());
    el.btnDoneShop?.addEventListener('click', () => el.dialogInventoryShop?.close());
    el.btnDoneAchieve?.addEventListener('click', () => el.dialogAchievements?.close());

    // Shop purchase delegate
    el.shopItemsGrid?.addEventListener('click', handleShopPurchase);

    // Results Actions
    el.btnToggleReview?.addEventListener('click', () => {
      sound.playClick();
      if (el.reviewPanel) {
        el.reviewPanel.hidden = !el.reviewPanel.hidden;
        if (!el.reviewPanel.hidden) {
          el.reviewPanel.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });

    el.btnRetryQuiz?.addEventListener('click', () => {
      if (state.activeQuiz) {
        promptGameMode(state.activeQuiz.id);
      } else {
        switchView('home');
      }
    });

    el.btnHomeFromResults?.addEventListener('click', () => switchView('home'));
    el.btnOpenCertificate?.addEventListener('click', generateCertificate);
    el.btnCloseCertDialog?.addEventListener('click', () => el.dialogCertificate?.close());
    el.btnDownloadCertificate?.addEventListener('click', downloadCertificate);
    el.btnPrintCertificate?.addEventListener('click', printCertificate);

    // Leaderboard controls
    el.leaderboardQuizFilter?.addEventListener('change', () => loadLeaderboard());
    el.btnRefreshLeaderboard?.addEventListener('click', () => loadLeaderboard());

    // Creator Modal
    el.btnOpenCreator?.addEventListener('click', () => {
      sound.playClick();
      resetCreatorForm();
      el.dialogCreateQuiz?.showModal();
    });

    el.btnCloseCreatorDialog?.addEventListener('click', () => el.dialogCreateQuiz?.close());
    el.btnCancelCreator?.addEventListener('click', () => el.dialogCreateQuiz?.close());
    el.btnAddQuestionItem?.addEventListener('click', () => addQuestionItemToCreator());
    el.createQuizForm?.addEventListener('submit', handleCreatorSubmit);

    // JSON & CSV Export / Import
    el.btnExportTemplate?.addEventListener('click', exportSampleJSON);
    el.btnImportJsonTrigger?.addEventListener('click', () => el.jsonFileInput?.click());
    el.jsonFileInput?.addEventListener('change', handleJSONImport);

    el.btnExportCsv?.addEventListener('click', exportSampleCSV);
    el.btnImportCsvTrigger?.addEventListener('click', () => el.csvFileInput?.click());
    el.csvFileInput?.addEventListener('change', handleCSVImport);

    // Keyboard Shortcuts
    window.addEventListener('keydown', handleGlobalKeydown);
  }

  function handleGlobalKeydown(e) {
    if (state.currentView === 'play' && !e.repeat) {
      const key = e.key;

      const numMap = { '1': 0, '2': 1, '3': 2, '4': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
      if (numMap[key] !== undefined) {
        const optionButtons = el.optionsContainer?.querySelectorAll('.option-btn');
        const targetBtn = optionButtons ? optionButtons[numMap[key]] : null;
        if (targetBtn && !targetBtn.disabled) {
          handleOptionSelected(numMap[key]);
        }
      }

      if ((key === 'Enter' || key === ' ') && el.btnNextQuestion && !el.btnNextQuestion.disabled) {
        e.preventDefault();
        el.btnNextQuestion.click();
      }
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ==========================================================================
  // 19. Application Initialization
  // ==========================================================================
  function init() {
    setupPreferenceEvents();
    setupProfileEvents();
    setupGameModeEvents();
    setupEventListeners();
    syncUserProfileUI();
    switchView('home');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
