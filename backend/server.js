/**
 * QuizSphere Backend API Server
 * Zero-dependency Node.js REST API server.
 * Connects directly to the Database layer (../database/db.js)
 * and serves the Frontend client (../frontend).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Connect to Database Module
const db = require('../database/db');

const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

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

  // ==========================================================================
  // REST API Routes (Delegated to Database layer)
  // ==========================================================================
  if (pathname.startsWith('/api/')) {
    try {
      // 1. GET /api/quizzes - list all quizzes (summarized)
      if (pathname === '/api/quizzes' && method === 'GET') {
        const summaries = db.getAllQuizzes(true);
        return sendJSON(res, 200, summaries);
      }

      // 1b. GET /api/daily-challenge - deterministic 5-question daily quest
      if (pathname === '/api/daily-challenge' && method === 'GET') {
        const dailyQuiz = db.getDailyChallenge();
        return sendJSON(res, 200, dailyQuiz);
      }

      // 1c. GET /api/random-quiz - randomized question set across categories & difficulty
      if (pathname === '/api/random-quiz' && method === 'GET') {
        const randomQuiz = db.getRandomQuiz(parsedUrl.query || {});
        return sendJSON(res, 200, randomQuiz);
      }

      // 2. GET /api/quizzes/:id - get specific quiz with full questions
      const quizMatch = pathname.match(/^\/api\/quizzes\/([^/]+)$/);
      if (quizMatch && method === 'GET') {
        const quizId = quizMatch[1];
        const found = db.getQuizById(quizId);
        if (!found) {
          return sendJSON(res, 404, { error: 'Quiz not found' });
        }
        return sendJSON(res, 200, found);
      }

      // 3. POST /api/quizzes - create custom quiz
      if (pathname === '/api/quizzes' && method === 'POST') {
        const payload = await parseBody(req);
        const newQuiz = db.createQuiz(payload);
        return sendJSON(res, 201, { message: 'Quiz created successfully', quiz: newQuiz });
      }

      // 4. DELETE /api/quizzes/:id - delete custom quiz
      if (quizMatch && method === 'DELETE') {
        const quizId = quizMatch[1];
        const removed = db.deleteQuiz(quizId);
        if (!removed) {
          return sendJSON(res, 404, { error: 'Quiz not found' });
        }
        return sendJSON(res, 200, { message: 'Quiz deleted', removed });
      }

      // 5. GET /api/scores - retrieve leaderboard
      if (pathname === '/api/scores' && method === 'GET') {
        const scores = db.getScores(50);
        return sendJSON(res, 200, scores);
      }

      // 6. POST /api/scores - record new score
      if (pathname === '/api/scores' && method === 'POST') {
        const payload = await parseBody(req);
        const newScore = db.saveScore(payload);
        return sendJSON(res, 201, { message: 'Score saved', score: newScore });
      }

      // 7. GET /api/stats - aggregate platform stats
      if (pathname === '/api/stats' && method === 'GET') {
        const stats = db.getStats();
        return sendJSON(res, 200, stats);
      }

      return sendJSON(res, 404, { error: 'API route not found' });
    } catch (apiErr) {
      console.error('[API Error]:', apiErr);
      const statusCode = apiErr.message && apiErr.message.includes('required') ? 400 : 500;
      return sendJSON(res, statusCode, { error: apiErr.message });
    }
  }

  // ==========================================================================
  // Static Frontend File Serving (from ../frontend)
  // ==========================================================================
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(FRONTEND_DIR, safePath);

  // Security check: ensure filePath is within FRONTEND_DIR
  if (!filePath.startsWith(FRONTEND_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routing
      const fallbackPath = path.join(FRONTEND_DIR, 'index.html');
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

let currentPort = PORT;

function startServer(port) {
  server.listen(port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 QuizSphere Backend Server running at http://localhost:${port}`);
    console.log(`📂 Serving Frontend from: ${FRONTEND_DIR}`);
    console.log(`💾 Connected to Database at: ${db.QUIZZES_FILE}`);
    console.log(`=======================================================`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[Port in use] Port ${currentPort} is busy, automatically switching to port ${currentPort + 1}...`);
    currentPort++;
    setTimeout(() => {
      startServer(currentPort);
    }, 400);
  } else {
    console.error('[Server Error]:', err);
  }
});

startServer(currentPort);

module.exports = server;
