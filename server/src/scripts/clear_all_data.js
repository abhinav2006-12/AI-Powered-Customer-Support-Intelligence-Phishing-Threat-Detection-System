import db from '../db/database.js';
import { supabase, isSupabaseConfigured } from '../db/supabase.js';

async function clearAll() {
  console.log('Clearing local SQLite database tables...');
  try {
    db.prepare('DELETE FROM emails').run();
    db.prepare('DELETE FROM urls').run();
    db.prepare('DELETE FROM threats').run();
    db.prepare('DELETE FROM analyses').run();
    db.prepare('DELETE FROM conversations').run();
    console.log('✅ SQLite database cleared (0 records).');
  } catch (err) {
    console.error('Error clearing SQLite database:', err.message);
  }

  if (isSupabaseConfigured && supabase) {
    console.log('Clearing remote Supabase PostgreSQL tables...');
    try {
      await supabase.from('emails').delete().neq('id', 0);
      await supabase.from('urls').delete().neq('id', 0);
      await supabase.from('threats').delete().neq('id', 0);
      await supabase.from('analyses').delete().neq('id', 0);
      await supabase.from('conversations').delete().neq('id', 0);
      console.log('✅ Supabase PostgreSQL tables cleared.');
    } catch (err) {
      console.error('Error clearing Supabase tables:', err.message);
    }
  }

  console.log('🎉 All dataset and incident records have been completely purged.');
}

clearAll();
