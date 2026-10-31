/**
 * QuizSphere Database Layer
 * Handles JSON persistence, querying, deterministic daily quests,
 * randomized quizzes, scores, and platform statistics.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_DIR = __dirname;
const QUIZZES_FILE = path.join(DB_DIR, 'quizzes.json');
const SCORES_FILE = path.join(DB_DIR, 'scores.json');

// Ensure database files exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function readJSON(file, fallback = []) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const content = fs.readFileSync(file, 'utf8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error(`[Database] Error reading ${file}:`, err);
    return fallback;
  }
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`[Database] Error writing ${file}:`, err);
    return false;
  }
}

const db = {
  QUIZZES_FILE,
  SCORES_FILE,

  // 1. Quizzes
  getAllQuizzes(summarized = true) {
    const quizzes = readJSON(QUIZZES_FILE);
    if (!summarized) return quizzes;

    return quizzes.map(q => ({
      id: q.id,
      title: q.title,
      description: q.description,
      category: q.category || 'General',
      icon: q.icon || '📝',
      timePerQuestion: q.timePerQuestion || 20,
      questionCount: (q.questions || []).length,
      isCustom: !!q.isCustom
    }));
  },

  getQuizById(id) {
    const quizzes = readJSON(QUIZZES_FILE);
    return quizzes.find(q => q.id === id) || null;
  },

  createQuiz(payload) {
    if (!payload.title || !Array.isArray(payload.questions) || payload.questions.length === 0) {
      throw new Error('Title and at least one question are required.');
    }

    const quizzes = readJSON(QUIZZES_FILE);
    const newQuiz = {
      id: 'custom-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex'),
      title: payload.title.trim(),
      description: payload.description ? payload.description.trim() : 'User created quiz',
      category: payload.category ? payload.category.trim() : 'Custom',
      icon: payload.icon || '✨',
      timePerQuestion: parseInt(payload.timePerQuestion, 10) || 20,
      isCustom: true,
      createdAt: new Date().toISOString(),
      questions: payload.questions.map((q, idx) => ({
        id: `q-${idx + 1}-${Date.now()}`,
        question: q.question.trim(),
        options: Array.isArray(q.options) ? q.options.map(o => String(o).trim()) : [],
        correct: parseInt(q.correct, 10) || 0,
        difficulty: q.difficulty || 'Medium',
        hint: q.hint ? q.hint.trim() : '',
        explanation: q.explanation ? q.explanation.trim() : 'Correct answer verified.'
      }))
    };

    quizzes.unshift(newQuiz);
    writeJSON(QUIZZES_FILE, quizzes);
    return newQuiz;
  },

  deleteQuiz(id) {
    const quizzes = readJSON(QUIZZES_FILE);
    const index = quizzes.findIndex(q => q.id === id);
    if (index === -1) return null;

    const removed = quizzes.splice(index, 1);
    writeJSON(QUIZZES_FILE, quizzes);
    return removed[0];
  },

  // 2. Daily Challenge (Deterministic 5-question quest per calendar day)
  getDailyChallenge(date = new Date()) {
    const quizzes = readJSON(QUIZZES_FILE);
    const allQuestions = [];
    quizzes.forEach(q => {
      (q.questions || []).forEach(item => {
        allQuestions.push({ ...item, category: q.category });
      });
    });

    const todayStr = date.toISOString().slice(0, 10);
    let seed = 0;
    for (let i = 0; i < todayStr.length; i++) {
      seed = (seed * 31 + todayStr.charCodeAt(i)) >>> 0;
    }
    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const shuffled = [...allQuestions].sort(() => seededRandom() - 0.5);
    const selected = shuffled.slice(0, 5);

    return {
      id: `daily-${todayStr}`,
      date: todayStr,
      title: `Daily Challenge (${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`,
      description: 'Special 5-question multi-topic daily quest. Earn 2× Coins and Bonus XP!',
      category: 'Daily Quest',
      icon: '🌟',
      timePerQuestion: 20,
      isDaily: true,
      bonusCoins: 100,
      bonusXP: 150,
      questions: selected
    };
  },

  // 3. Random Multi-topic Quiz Generator
  getRandomQuiz(options = {}) {
    const count = Math.min(20, Math.max(5, parseInt(options.count, 10) || 10));
    const requestedCategories = options.categories ? options.categories.split(',').map(c => c.trim()) : null;
    const requestedDifficulty = options.difficulty || null;

    const quizzes = readJSON(QUIZZES_FILE);
    let pool = [];
    quizzes.forEach(q => {
      if (!requestedCategories || requestedCategories.includes(q.category) || requestedCategories.includes('All')) {
        (q.questions || []).forEach(item => {
          if (!requestedDifficulty || requestedDifficulty === 'All' || item.difficulty === requestedDifficulty) {
            pool.push({ ...item, category: q.category });
          }
        });
      }
    });

    if (pool.length === 0) {
      quizzes.forEach(q => pool.push(...(q.questions || [])));
    }

    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const selected = pool.slice(0, count);

    return {
      id: 'random-' + Date.now(),
      title: requestedDifficulty && requestedDifficulty !== 'All' 
        ? `Random Quiz (${requestedDifficulty} Tier)` 
        : 'Random Multi-Topic Quiz',
      description: 'Dynamic mix of shuffled questions across categories for ultimate replayability.',
      category: requestedCategories && requestedCategories.length === 1 ? requestedCategories[0] : 'Random Mix',
      icon: '🎲',
      timePerQuestion: 20,
      isRandom: true,
      questions: selected
    };
  },

  // 4. Scores & Leaderboard
  getScores(limit = 50) {
    const scores = readJSON(SCORES_FILE);
    scores.sort((a, b) => (b.percentage - a.percentage) || (a.timeTakenSeconds - b.timeTakenSeconds));
    return scores.slice(0, limit);
  },

  saveScore(payload) {
    if (!payload.quizId || payload.score === undefined || !payload.total) {
      throw new Error('quizId, score, and total are required');
    }

    const scores = readJSON(SCORES_FILE);
    const newScore = {
      id: 'sc-' + Date.now() + '-' + crypto.randomBytes(3).toString('hex'),
      quizId: payload.quizId,
      quizTitle: payload.quizTitle || 'Quiz',
      userName: (payload.userName && payload.userName.trim()) || 'Player',
      userAvatar: payload.userAvatar || '👤',
      score: Number(payload.score),
      total: Number(payload.total),
      percentage: Math.round((Number(payload.score) / Number(payload.total)) * 100),
      earnedPoints: Number(payload.earnedPoints) || 0,
      maxStreak: Number(payload.maxStreak) || 0,
      difficulty: payload.difficulty || 'Medium',
      timeTakenSeconds: Number(payload.timeTakenSeconds) || 0,
      date: new Date().toISOString()
    };

    scores.unshift(newScore);
    writeJSON(SCORES_FILE, scores);
    return newScore;
  },

  // 5. Aggregate Platform Stats
  getStats() {
    const quizzes = readJSON(QUIZZES_FILE);
    const scores = readJSON(SCORES_FILE);
    const totalQuestions = quizzes.reduce((sum, q) => sum + (q.questions ? q.questions.length : 0), 0);
    const avgPercentage = scores.length > 0 
      ? Math.round(scores.reduce((sum, s) => sum + s.percentage, 0) / scores.length) 
      : 0;

    return {
      totalQuizzes: quizzes.length,
      totalQuestions,
      totalGamesPlayed: scores.length,
      averageScorePercent: avgPercentage
    };
  }
};

module.exports = db;
