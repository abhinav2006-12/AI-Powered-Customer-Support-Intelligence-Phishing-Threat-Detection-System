import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey && supabaseUrl.trim() !== '' && supabaseKey.trim() !== '');

export let supabase = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log('⚡ Supabase Client initialized successfully with URL:', supabaseUrl);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ Supabase not configured in .env. Using SQLite as active primary database.');
}

/**
 * Diagnostic health check for Supabase connection
 */
export async function testSupabaseConnection() {
  if (!supabase) {
    return {
      connected: false,
      configured: false,
      message: 'Supabase URL or Key not set in server/.env'
    };
  }

  try {
    const { data, error } = await supabase.from('conversations').select('id').limit(1);
    if (error) throw error;

    return {
      connected: true,
      configured: true,
      message: 'Successfully connected to Supabase PostgreSQL database'
    };
  } catch (err) {
    return {
      connected: false,
      configured: true,
      error: err.message,
      message: 'Failed to connect to Supabase: ' + err.message
    };
  }
}

/**
 * Automatically sync all local SQLite data to Supabase PostgreSQL
 */
export async function syncAllToSupabase(db) {
  if (!isSupabaseConfigured || !supabase || !db) return { synced: false, reason: 'Supabase not configured' };

  try {
    const conversations = db.prepare('SELECT * FROM conversations').all();
    if (conversations.length === 0) return { synced: true, count: 0 };

    const analyses = db.prepare('SELECT * FROM analyses').all();
    const threats = db.prepare('SELECT * FROM threats').all();
    const urls = db.prepare('SELECT * FROM urls').all();
    const emails = db.prepare('SELECT * FROM emails').all();

    await supabase.from('conversations').upsert(conversations, { onConflict: 'id' });
    if (analyses.length > 0) await supabase.from('analyses').upsert(analyses, { onConflict: 'id' });
    if (threats.length > 0) await supabase.from('threats').upsert(threats, { onConflict: 'id' });
    if (urls.length > 0) await supabase.from('urls').upsert(urls, { onConflict: 'id' });
    if (emails.length > 0) await supabase.from('emails').upsert(emails, { onConflict: 'id' });

    console.log(`⚡ [Auto-Sync] Successfully synchronized ${conversations.length} records to Supabase PostgreSQL.`);
    return { synced: true, count: conversations.length };
  } catch (err) {
    console.error('⚠️ [Auto-Sync] Background sync to Supabase failed:', err.message);
    return { synced: false, error: err.message };
  }
}

/**
 * Automatically sync a single newly created conversation bundle to Supabase
 */
export async function syncRecordToSupabase({ conversation, analysis, threat, urls = [], emails = [] }) {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    if (conversation) await supabase.from('conversations').upsert([conversation], { onConflict: 'id' });
    if (analysis) await supabase.from('analyses').upsert([analysis], { onConflict: 'id' });
    if (threat) await supabase.from('threats').upsert([threat], { onConflict: 'id' });
    if (urls.length > 0) await supabase.from('urls').upsert(urls, { onConflict: 'id' });
    if (emails.length > 0) await supabase.from('emails').upsert(emails, { onConflict: 'id' });
    console.log(`⚡ [Auto-Sync] Real-time synced conversation #${conversation?.id || conversation?.external_id} to Supabase`);
  } catch (err) {
    console.error('⚠️ [Auto-Sync] Failed to sync new record to Supabase:', err.message);
  }
}

export default supabase;
