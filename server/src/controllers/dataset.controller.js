import db from '../db/database.js';
import { seedDatabase } from '../services/seed.service.js';
import { analyzeConversationWithAI } from '../services/ai.service.js';
import { syncAllToSupabase, supabase, isSupabaseConfigured } from '../db/supabase.js';

export function getDatasetInfo(req, res) {
  try {
    const totalConversations = db.prepare('SELECT COUNT(*) as count FROM conversations').get().count;
    const totalAnalyses = db.prepare('SELECT COUNT(*) as count FROM analyses').get().count;
    const totalThreats = db.prepare('SELECT COUNT(*) as count FROM threats').get().count;
    const totalUrls = db.prepare('SELECT COUNT(*) as count FROM urls').get().count;
    const totalEmails = db.prepare('SELECT COUNT(*) as count FROM emails').get().count;

    const sampleRecords = db.prepare(`
      SELECT c.id, c.external_id, c.customer_name, c.customer_email, c.channel, c.message, a.category, a.sentiment, t.risk_level
      FROM conversations c
      LEFT JOIN analyses a ON c.id = a.conversation_id
      LEFT JOIN threats t ON c.id = t.conversation_id
      ORDER BY c.created_at DESC
      LIMIT 10
    `).all();

    return res.json({
      summary: {
        totalConversations,
        totalAnalyses,
        totalThreats,
        totalUrls,
        totalEmails
      },
      sampleRecords
    });
  } catch (err) {
    console.error('Error fetching dataset info:', err);
    return res.status(500).json({ error: 'Failed to fetch dataset info' });
  }
}

export async function importDataset(req, res) {
  try {
    const { items = [] } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Provide a valid array of conversation items to import' });
    }

    let importedCount = 0;
    for (const item of items) {
      const message = item.message || item.text || item.content || '';
      if (!message.trim()) continue;

      const customer_name = item.customer_name || item.name || 'Imported Customer';
      const customer_email = item.customer_email || item.email || '';
      const channel = item.channel || 'Email';
      const conversation_history = item.conversation_history || item.history || '';

      await analyzeConversationWithAI({
        message,
        conversationHistory: conversation_history,
        channel,
        customerName: customer_name,
        customerEmail: customer_email
      });

      importedCount++;
    }

    // Auto-sync entire imported dataset to Supabase
    syncAllToSupabase(db);

    return res.json({
      message: `Successfully imported and analyzed ${importedCount} dataset records`,
      count: importedCount
    });
  } catch (err) {
    console.error('Error importing dataset:', err);
    return res.status(500).json({ error: 'Dataset import failed' });
  }
}

export async function clearDataset(req, res) {
  try {
    db.prepare('DELETE FROM emails').run();
    db.prepare('DELETE FROM urls').run();
    db.prepare('DELETE FROM threats').run();
    db.prepare('DELETE FROM analyses').run();
    db.prepare('DELETE FROM conversations').run();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('emails').delete().neq('id', 0);
        await supabase.from('urls').delete().neq('id', 0);
        await supabase.from('threats').delete().neq('id', 0);
        await supabase.from('analyses').delete().neq('id', 0);
        await supabase.from('conversations').delete().neq('id', 0);
        console.log('⚡ [Auto-Sync] Cleared Supabase tables in sync with SQLite.');
      } catch (sbErr) {
        console.warn('⚠️ Supabase clear error:', sbErr.message);
      }
    }

    return res.json({ message: 'Dataset cleared successfully across local SQLite and Supabase PostgreSQL' });
  } catch (err) {
    console.error('Error clearing dataset:', err);
    return res.status(500).json({ error: 'Failed to clear dataset' });
  }
}

export async function seedDemoData(req, res) {
  try {
    const { count = 60 } = req.body || {};
    const result = seedDatabase(parseInt(count));

    // Auto-sync all seeded data to Supabase in background
    syncAllToSupabase(db);

    return res.json({
      message: `Successfully seeded database with ${result.seededCount} realistic conversations, analyses, threats, and extracted URLs/emails (Auto-synced to Supabase)`,
      count: result.seededCount
    });
  } catch (err) {
    console.error('Error seeding demo dataset:', err);
    return res.status(500).json({ error: 'Failed to seed demo dataset' });
  }
}
