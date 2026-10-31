const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const PUBLIC_DIR = fs.existsSync(path.join(ROOT_DIR, 'index.html'))
  ? ROOT_DIR
  : (fs.existsSync(path.join(ROOT_DIR, 'public', 'index.html')) ? path.join(ROOT_DIR, 'public') : ROOT_DIR);

const QUIZZES_FILE = fs.existsSync(path.join(ROOT_DIR, 'quizzes.json'))
  ? path.join(ROOT_DIR, 'quizzes.json')
  : (fs.existsSync(path.join(ROOT_DIR, 'data', 'quizzes.json')) ? path.join(ROOT_DIR, 'data', 'quizzes.json') : path.join(ROOT_DIR, 'quizzes.json'));

const SCORES_FILE = fs.existsSync(path.join(ROOT_DIR, 'scores.json'))
  ? path.join(ROOT_DIR, 'scores.json')
  : (fs.existsSync(path.join(ROOT_DIR, 'data', 'scores.json')) ? path.join(ROOT_DIR, 'data', 'scores.json') : path.join(ROOT_DIR, 'scores.json'));

function readJSON(file, fallback = []) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const content = fs.readFileSync(file, 'utf8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return fallback;
  }
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
    return false;
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // --- API Routes ---
  if (pathname.startsWith('/api/')) {
    try {
      // 1. GET /api/quizzes - list all quizzes (summarized)
      if (pathname === '/api/quizzes' && method === 'GET') {
        const quizzes = readJSON(QUIZZES_FILE);
        const summaries = quizzes.map(q => ({
          id: q.id,
          title: q.title,
          description: q.description,
          category: q.category || 'General',
          icon: q.icon || '📝',
          timePerQuestion: q.timePerQuestion || 20,
          questionCount: (q.questions || []).length,
          isCustom: !!q.isCustom
        }));
        return sendJSON(res, 200, summaries);
      }

      // 1b. GET /api/daily-challenge - deterministic daily challenge
      if (pathname === '/api/daily-challenge' && method === 'GET') {
        const quizzes = readJSON(QUIZZES_FILE);
        const allQuestions = [];
        quizzes.forEach(q => {
          (q.questions || []).forEach(item => {
            allQuestions.push({ ...item, category: q.category });
          });
        });

        const todayStr = new Date().toISOString().slice(0, 10);
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

        return sendJSON(res, 200, {
          id: `daily-${todayStr}`,
          date: todayStr,
          title: `Daily Challenge (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`,
          description: 'Special 5-question multi-topic daily quest. Earn 2× Coins and Bonus XP!',
          category: 'Daily Quest',
          icon: '🌟',
          timePerQuestion: 20,
          isDaily: true,
          bonusCoins: 100,
          bonusXP: 150,
          questions: selected
        });
      }

      // 1c. GET /api/random-quiz - randomized question set across categories
      if (pathname === '/api/random-quiz' && method === 'GET') {
        const query = parsedUrl.query || {};
        const count = Math.min(20, Math.max(5, parseInt(query.count, 10) || 10));
        const requestedCategories = query.categories ? query.categories.split(',').map(c => c.trim()) : null;
        const requestedDifficulty = query.difficulty || null;

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

        return sendJSON(res, 200, {
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
        });
      }

      // 2. GET /api/quizzes/:id - get specific quiz with full questions
      const quizMatch = pathname.match(/^\/api\/quizzes\/([^/]+)$/);
      if (quizMatch && method === 'GET') {
        const quizId = quizMatch[1];
        const quizzes = readJSON(QUIZZES_FILE);
        const found = quizzes.find(q => q.id === quizId);
        if (!found) {
          return sendJSON(res, 404, { error: 'Quiz not found' });
        }
        return sendJSON(res, 200, found);
      }

      // 3. POST /api/quizzes - create custom quiz
      if (pathname === '/api/quizzes' && method === 'POST') {
        const payload = await parseBody(req);
        if (!payload.title || !Array.isArray(payload.questions) || payload.questions.length === 0) {
          return sendJSON(res, 400, { error: 'Title and at least one question are required.' });
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
            explanation: q.explanation ? q.explanation.trim() : 'Correct answer verified.'
          }))
        };

        quizzes.unshift(newQuiz);
        writeJSON(QUIZZES_FILE, quizzes);
        return sendJSON(res, 201, { message: 'Quiz created successfully', quiz: newQuiz });
      }

      // 4. DELETE /api/quizzes/:id - delete custom quiz
      if (quizMatch && method === 'DELETE') {
        const quizId = quizMatch[1];
        const quizzes = readJSON(QUIZZES_FILE);
        const index = quizzes.findIndex(q => q.id === quizId);
        if (index === -1) {
          return sendJSON(res, 404, { error: 'Quiz not found' });
        }
        const removed = quizzes.splice(index, 1);
        writeJSON(QUIZZES_FILE, quizzes);
        return sendJSON(res, 200, { message: 'Quiz deleted', removed: removed[0] });
      }

      // 5. GET /api/scores - retrieve scores / leaderboard
      if (pathname === '/api/scores' && method === 'GET') {
        const scores = readJSON(SCORES_FILE);
        // Sort by percentage desc, then timeTaken asc
        scores.sort((a, b) => (b.percentage - a.percentage) || (a.timeTakenSeconds - b.timeTakenSeconds));
        return sendJSON(res, 200, scores.slice(0, 50));
      }

      // 6. POST /api/scores - record new score
      if (pathname === '/api/scores' && method === 'POST') {
        const payload = await parseBody(req);
        if (!payload.quizId || payload.score === undefined || !payload.total) {
          return sendJSON(res, 400, { error: 'quizId, score, and total are required' });
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
        return sendJSON(res, 201, { message: 'Score saved', score: newScore });
      }

      // 7. GET /api/stats - aggregate platform stats
      if (pathname === '/api/stats' && method === 'GET') {
        const quizzes = readJSON(QUIZZES_FILE);
        const scores = readJSON(SCORES_FILE);
        const totalQuestions = quizzes.reduce((sum, q) => sum + (q.questions ? q.questions.length : 0), 0);
        const avgPercentage = scores.length > 0 
          ? Math.round(scores.reduce((sum, s) => sum + s.percentage, 0) / scores.length) 
          : 0;

        return sendJSON(res, 200, {
          totalQuizzes: quizzes.length,
          totalQuestions,
          totalGamesPlayed: scores.length,
          averageScorePercent: avgPercentage
        });
      }

      return sendJSON(res, 404, { error: 'API route not found' });
    } catch (apiErr) {
      console.error('API Error:', apiErr);
      return sendJSON(res, 500, { error: 'Internal Server Error', details: apiErr.message });
    }
  }

  // --- Static Files Serving ---
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);

  // Security check: ensure filePath is within PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Return index.html for SPA fallback if file not found
      const fallbackPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(fallbackPath, (fbErr, content) => {
        if (fbErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading file');
        return;
      }
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 QuizSphere Server running at http://localhost:${PORT}`);
  console.log(`Ready for quizzes, scores, and custom quiz builder!`);
  console.log(`===============================================`);
});
