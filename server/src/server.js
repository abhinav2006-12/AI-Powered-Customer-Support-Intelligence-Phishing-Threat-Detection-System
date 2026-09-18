import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import db, { initDB } from './db/database.js';
import { seedDatabase } from './services/seed.service.js';

import conversationsRoutes from './routes/conversations.routes.js';
import analysisRoutes from './routes/analysis.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import threatsRoutes from './routes/threats.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import datasetRoutes from './routes/dataset.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Cors Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize SQLite database
initDB();

// Auto-seed database if completely empty
try {
  const count = db.prepare('SELECT COUNT(*) as count FROM conversations').get().count;
  if (count === 0) {
    console.log('Database empty. Performing automatic initial seeding with 60 realistic records...');
    seedDatabase(60);
  }
} catch (e) {
  console.error('Initial auto-seed check error:', e.message);
}

// API Routes
app.use('/api/conversations', conversationsRoutes);
app.use('/api/analyze', analysisRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/threats', threatsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dataset', datasetRoutes);
app.post('/api/demo/seed', (req, res, next) => {
  req.url = '/seed';
  datasetRoutes(req, res, next);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  return res.json({
    status: 'online',
    system: 'AI Support Intelligence & Phishing Threat Detection System',
    timestamp: new Date().toISOString()
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ error: `API Endpoint ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Anthropic API Key configured: ${process.env.ANTHROPIC_API_KEY ? 'YES' : 'NO (Using fallback engine)'}`);
});
