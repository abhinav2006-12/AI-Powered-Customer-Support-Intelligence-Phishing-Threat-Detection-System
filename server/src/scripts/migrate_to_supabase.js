import dotenv from 'dotenv';
import db from '../db/database.js';
import { supabase, isSupabaseConfigured } from '../db/supabase.js';

dotenv.config();

async function migrate() {
  console.log('🚀 Starting SQLite to Supabase Migration...\n');

  if (!isSupabaseConfigured || !supabase) {
    console.error('❌ Error: Supabase credentials not configured in server/.env');
    console.log('Please set SUPABASE_URL and SUPABASE_KEY in server/.env before running migration.');
    process.exit(1);
  }

  try {
    // 1. Fetch all records from SQLite
    const conversations = db.prepare('SELECT * FROM conversations').all();
    console.log(`📦 Found ${conversations.length} conversations in SQLite.`);

    if (conversations.length === 0) {
      console.log('No records to migrate. Exiting.');
      return;
    }

    const analyses = db.prepare('SELECT * FROM analyses').all();
    const threats = db.prepare('SELECT * FROM threats').all();
    const urls = db.prepare('SELECT * FROM urls').all();
    const emails = db.prepare('SELECT * FROM emails').all();

    console.log(`- Analyses: ${analyses.length}`);
    console.log(`- Threats: ${threats.length}`);
    console.log(`- URLs: ${urls.length}`);
    console.log(`- Emails: ${emails.length}\n`);

    // 2. Insert into Supabase
    console.log('⬆️ Syncing conversations to Supabase...');
    const { error: convErr } = await supabase.from('conversations').upsert(conversations, { onConflict: 'id' });
    if (convErr) throw new Error('Conversations sync error: ' + convErr.message);

    if (analyses.length > 0) {
      console.log('⬆️ Syncing analyses to Supabase...');
      const { error: anaErr } = await supabase.from('analyses').upsert(analyses, { onConflict: 'id' });
      if (anaErr) throw new Error('Analyses sync error: ' + anaErr.message);
    }

    if (threats.length > 0) {
      console.log('⬆️ Syncing threats to Supabase...');
      const { error: thrErr } = await supabase.from('threats').upsert(threats, { onConflict: 'id' });
      if (thrErr) throw new Error('Threats sync error: ' + thrErr.message);
    }

    if (urls.length > 0) {
      console.log('⬆️ Syncing URLs to Supabase...');
      const { error: urlErr } = await supabase.from('urls').upsert(urls, { onConflict: 'id' });
      if (urlErr) throw new Error('URLs sync error: ' + urlErr.message);
    }

    if (emails.length > 0) {
      console.log('⬆️ Syncing emails to Supabase...');
      const { error: emlErr } = await supabase.from('emails').upsert(emails, { onConflict: 'id' });
      if (emlErr) throw new Error('Emails sync error: ' + emlErr.message);
    }

    console.log('\n✅ Migration completed successfully! All records are now in Supabase PostgreSQL.');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
  }
}

migrate();
