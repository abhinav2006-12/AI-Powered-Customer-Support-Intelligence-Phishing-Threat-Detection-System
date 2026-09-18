import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH 
  ? path.resolve(process.env.DATABASE_PATH) 
  : path.join(__dirname, '../../data/app.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let dbInstance = null;

// Prefer built-in node:sqlite (native in Node 22+) for 0-dependency robustness
try {
  const { DatabaseSync } = await import('node:sqlite');
  dbInstance = new DatabaseSync(dbPath);
  dbInstance.pragma = function(clause) {
    try {
      dbInstance.exec(`PRAGMA ${clause};`);
    } catch (e) {}
  };
  console.log('⚡ Connected to SQLite using built-in node:sqlite engine');
} catch (nodeSqliteErr) {
  try {
    const BetterSqlite3 = (await import('better-sqlite3')).default;
    dbInstance = new BetterSqlite3(dbPath);
  } catch (err) {
    console.warn('SQLite engine initialization fallback warning:', err.message);
  }
}

const db = dbInstance;

// Enable Foreign Keys & Write-Ahead Logging for concurrency
if (db && typeof db.pragma === 'function') {
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
}

// Initialize SQL Tables
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      external_id TEXT UNIQUE,
      customer_name TEXT,
      customer_email TEXT,
      channel TEXT CHECK(channel IN ('Email', 'Chat', 'Support Ticket', 'Contact Form', 'Social Media')),
      message TEXT NOT NULL,
      conversation_history TEXT,
      status TEXT DEFAULT 'Open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      category TEXT,
      issue TEXT,
      sentiment TEXT CHECK(sentiment IN ('Positive', 'Neutral', 'Negative')),
      emotion TEXT,
      urgency TEXT CHECK(urgency IN ('Low', 'Medium', 'High', 'Critical')),
      priority TEXT CHECK(priority IN ('Low', 'Medium', 'High', 'Critical')),
      customer_request TEXT,
      summary TEXT,
      resolution_status TEXT CHECK(resolution_status IN ('Resolved', 'Unresolved', 'Pending', 'Unknown')),
      recommended_action TEXT,
      confidence REAL DEFAULT 0.95,
      keywords TEXT,
      entities TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS threats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      threat_detected INTEGER DEFAULT 0,
      threat_type TEXT,
      risk_level TEXT CHECK(risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
      risk_score INTEGER DEFAULT 0,
      social_engineering INTEGER DEFAULT 0,
      social_engineering_techniques TEXT,
      credential_request INTEGER DEFAULT 0,
      otp_request INTEGER DEFAULT 0,
      suspicious_message INTEGER DEFAULT 0,
      reason TEXT,
      recommended_action TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      domain TEXT,
      subdomain TEXT,
      protocol TEXT,
      url_length INTEGER,
      uses_ip INTEGER DEFAULT 0,
      https INTEGER DEFAULT 1,
      suspicious_characters INTEGER DEFAULT 0,
      shortened INTEGER DEFAULT 0,
      lookalike INTEGER DEFAULT 0,
      risk_score INTEGER DEFAULT 0,
      risk_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      domain TEXT,
      display_name TEXT,
      domain_mismatch INTEGER DEFAULT 0,
      lookalike INTEGER DEFAULT 0,
      free_mail INTEGER DEFAULT 0,
      risk_score INTEGER DEFAULT 0,
      risk_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(channel);
    CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at);
    CREATE INDEX IF NOT EXISTS idx_analyses_category ON analyses(category);
    CREATE INDEX IF NOT EXISTS idx_analyses_sentiment ON analyses(sentiment);
    CREATE INDEX IF NOT EXISTS idx_analyses_priority ON analyses(priority);
    CREATE INDEX IF NOT EXISTS idx_analyses_resolution ON analyses(resolution_status);
    CREATE INDEX IF NOT EXISTS idx_threats_risk_level ON threats(risk_level);
    CREATE INDEX IF NOT EXISTS idx_threats_threat_detected ON threats(threat_detected);
  `);

  console.log('Database initialized successfully at:', dbPath);
}

export default db;
