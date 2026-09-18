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

export default supabase;
