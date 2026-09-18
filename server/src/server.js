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
import chatRoutes from './routes/chat.routes.js';
import { isSupabaseConfigured, testSupabaseConnection } from './db/supabase.js';

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

// API Routes
app.use('/api/conversations', conversationsRoutes);
app.use('/api/analyze', analysisRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/threats', threatsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dataset', datasetRoutes);
app.use('/api/chat', chatRoutes);
app.post('/api/demo/seed', (req, res, next) => {
  req.url = '/seed';
  datasetRoutes(req, res, next);
});

// Health check endpoint with deep connection diagnostics
app.get('/api/health', async (req, res) => {
  const startTime = Date.now();
  let supabaseTest = { connected: false, configured: false, message: 'Not configured in server/.env' };

  if (isSupabaseConfigured) {
    try {
      const sbStart = Date.now();
      const resTest = await testSupabaseConnection();
      supabaseTest = {
        ...resTest,
        latencyMs: Date.now() - sbStart
      };
    } catch (e) {
      supabaseTest = { connected: false, configured: true, error: e.message, message: 'Connection check failed' };
    }
  }

  let sqliteHealthy = true;
  try {
    db.prepare('SELECT 1').get();
  } catch (e) {
    sqliteHealthy = false;
  }

  const geminiConfigured = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  const anthropicConfigured = !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim() !== '');
  const totalResponseTime = Date.now() - startTime;

  return res.json({
    status: 'online',
    system: 'KAAVALX AI Support & Phishing Threat Detection System',
    backend: {
      status: 'online',
      uptime: Math.floor(process.uptime()),
      port: PORT,
      timestamp: new Date().toISOString(),
      responseTimeMs: totalResponseTime
    },
    database: {
      primary: isSupabaseConfigured && supabaseTest.connected ? 'Supabase PostgreSQL' : 'SQLite (better-sqlite3)',
      sqlite: {
        healthy: sqliteHealthy,
        driver: 'better-sqlite3'
      },
      supabase: {
        configured: isSupabaseConfigured,
        connected: !!supabaseTest.connected,
        latencyMs: supabaseTest.latencyMs || null,
        message: supabaseTest.message || (isSupabaseConfigured ? 'Configured' : 'Not configured in server/.env (using SQLite)'),
        error: supabaseTest.error || null
      }
    },
    apis: {
      gemini: {
        configured: geminiConfigured,
        model: 'gemini-2.5-flash',
        status: geminiConfigured ? 'active' : 'fallback',
        label: 'Google Gemini 2.5 Flash'
      },
      anthropic: {
        configured: anthropicConfigured,
        model: 'claude-sonnet-4-6',
        status: anthropicConfigured ? 'active' : 'fallback_heuristics',
        label: 'Anthropic Claude Sonnet 4.6'
      }
    },
    // Backwards compatibility
    database_name: isSupabaseConfigured ? 'Supabase PostgreSQL' : 'SQLite (better-sqlite3)',
    supabaseConfigured: isSupabaseConfigured,
    geminiConfigured: geminiConfigured,
    anthropicConfigured: anthropicConfigured,
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
  console.log(`Primary Database: ${isSupabaseConfigured ? 'Supabase PostgreSQL' : 'SQLite (Local)'}`);
  console.log(`Gemini API Key configured: ${process.env.GEMINI_API_KEY ? 'YES' : 'NO (Using fallback assistant)'}`);
  console.log(`Anthropic API Key configured: ${process.env.ANTHROPIC_API_KEY ? 'YES' : 'NO (Using fallback engine)'}`);
});
