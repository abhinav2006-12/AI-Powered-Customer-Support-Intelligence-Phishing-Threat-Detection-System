import db from '../db/database.js';
import { analyzeConversationWithAI } from '../services/ai.service.js';
import { syncRecordToSupabase } from '../db/supabase.js';

export async function analyzeNewConversation(req, res) {
  try {
    const { 
      message, 
      conversation_history = '', 
      customer_name = 'Anonymous Customer', 
      customer_email = '', 
      channel = 'Email',
      save = true
    } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message text is required for analysis' });
    }

    const VALID_CHANNELS = ['Email', 'Chat', 'Support Ticket', 'Contact Form', 'Social Media'];
    const validChannel = VALID_CHANNELS.includes(channel) ? channel : 'Email';

    const aiResult = await analyzeConversationWithAI({
      message,
      conversationHistory: conversation_history,
      channel: validChannel,
      customerName: customer_name,
      customerEmail: customer_email
    });

    let convId = null;

    if (save) {
      const extId = `CONV-${Date.now()}`;
      const dateStr = new Date().toISOString();

      const convInfo = db.prepare(`
        INSERT INTO conversations (external_id, customer_name, customer_email, channel, message, conversation_history, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'Open', ?, ?)
      `).run(extId, customer_name, customer_email, validChannel, message, conversation_history, dateStr, dateStr);

      convId = convInfo.lastInsertRowid;

      // Insert Analysis
      db.prepare(`
        INSERT INTO analyses (conversation_id, category, issue, sentiment, emotion, urgency, priority, customer_request, summary, resolution_status, recommended_action, confidence, keywords, entities, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        convId,
        aiResult.category,
        aiResult.issue,
        aiResult.sentiment,
        aiResult.emotion,
        aiResult.urgency,
        aiResult.priority,
        aiResult.customer_request,
        aiResult.summary,
        aiResult.resolution_status,
        aiResult.recommended_action,
        0.96,
        JSON.stringify(aiResult.keywords || []),
        JSON.stringify(aiResult.entities || []),
        dateStr
      );

      // Insert Threat
      const sec = aiResult.security || {};
      db.prepare(`
        INSERT INTO threats (conversation_id, threat_detected, threat_type, risk_level, risk_score, social_engineering, social_engineering_techniques, credential_request, otp_request, suspicious_message, reason, recommended_action, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        convId,
        sec.threat_detected ? 1 : 0,
        sec.threat_type || 'None',
        sec.risk_level || 'LOW',
        sec.risk_score || 0,
        sec.social_engineering ? 1 : 0,
        JSON.stringify(sec.techniques || []),
        sec.credential_request ? 1 : 0,
        sec.otp_request ? 1 : 0,
        sec.suspicious_message ? 1 : 0,
        sec.reason || '',
        aiResult.recommended_action,
        dateStr
      );

      // Insert URLs
      if (aiResult.urls && Array.isArray(aiResult.urls)) {
        const urlStmt = db.prepare(`
          INSERT INTO urls (conversation_id, url, domain, subdomain, protocol, url_length, uses_ip, https, suspicious_characters, shortened, lookalike, risk_score, risk_reason, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        aiResult.urls.forEach(u => {
          urlStmt.run(convId, u.url, u.domain, u.subdomain, u.protocol, u.url_length, u.uses_ip, u.https, u.suspicious_characters, u.shortened, u.lookalike, u.risk_score, u.risk_reason, dateStr);
        });
      }

      // Insert Emails
      if (aiResult.emails && Array.isArray(aiResult.emails)) {
        const emailStmt = db.prepare(`
          INSERT INTO emails (conversation_id, email, domain, display_name, domain_mismatch, lookalike, free_mail, risk_score, risk_reason, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        aiResult.emails.forEach(e => {
          emailStmt.run(convId, e.email, e.domain, e.display_name, e.domain_mismatch, e.lookalike, e.free_mail, e.risk_score, e.risk_reason, dateStr);
        });
      }
      // Auto-sync the newly saved record to Supabase
      syncRecordToSupabase({
        conversation: {
          id: convId,
          external_id: extId,
          customer_name,
          customer_email,
          channel,
          message,
          conversation_history,
          status: 'Open',
          created_at: dateStr,
          updated_at: dateStr
        },
        analysis: {
          conversation_id: convId,
          category: aiResult.category,
          issue: aiResult.issue,
          sentiment: aiResult.sentiment,
          emotion: aiResult.emotion,
          urgency: aiResult.urgency,
          priority: aiResult.priority,
          customer_request: aiResult.customer_request,
          summary: aiResult.summary,
          resolution_status: aiResult.resolution_status,
          recommended_action: aiResult.recommended_action,
          confidence: 0.96,
          keywords: JSON.stringify(aiResult.keywords || []),
          entities: JSON.stringify(aiResult.entities || []),
          created_at: dateStr
        },
        threat: {
          conversation_id: convId,
          threat_detected: sec.threat_detected ? 1 : 0,
          threat_type: sec.threat_type || 'None',
          risk_level: sec.risk_level || 'LOW',
          risk_score: sec.risk_score || 0,
          social_engineering: sec.social_engineering ? 1 : 0,
          social_engineering_techniques: JSON.stringify(sec.techniques || []),
          credential_request: sec.credential_request ? 1 : 0,
          otp_request: sec.otp_request ? 1 : 0,
          suspicious_message: sec.suspicious_message ? 1 : 0,
          reason: sec.reason || '',
          recommended_action: aiResult.recommended_action,
          created_at: dateStr
        }
      });
    }

    return res.json({
      conversation_id: convId,
      analysis: aiResult
    });
  } catch (err) {
    console.error('Error analyzing conversation:', err);
    return res.status(500).json({ error: 'Analysis failed' });
  }
}

export async function reanalyzeConversation(req, res) {
  try {
    const { id } = req.params;
    const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const aiResult = await analyzeConversationWithAI({
      message: conversation.message,
      conversationHistory: conversation.conversation_history,
      channel: conversation.channel,
      customerName: conversation.customer_name,
      customerEmail: conversation.customer_email
    });

    const dateStr = new Date().toISOString();

    // Delete existing analysis details
    db.prepare('DELETE FROM analyses WHERE conversation_id = ?').run(id);
    db.prepare('DELETE FROM threats WHERE conversation_id = ?').run(id);
    db.prepare('DELETE FROM urls WHERE conversation_id = ?').run(id);
    db.prepare('DELETE FROM emails WHERE conversation_id = ?').run(id);

    // Re-insert Analysis
    db.prepare(`
      INSERT INTO analyses (conversation_id, category, issue, sentiment, emotion, urgency, priority, customer_request, summary, resolution_status, recommended_action, confidence, keywords, entities, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      aiResult.category,
      aiResult.issue,
      aiResult.sentiment,
      aiResult.emotion,
      aiResult.urgency,
      aiResult.priority,
      aiResult.customer_request,
      aiResult.summary,
      aiResult.resolution_status,
      aiResult.recommended_action,
      0.96,
      JSON.stringify(aiResult.keywords || []),
      JSON.stringify(aiResult.entities || []),
      dateStr
    );

    // Re-insert Threat
    const sec = aiResult.security || {};
    db.prepare(`
      INSERT INTO threats (conversation_id, threat_detected, threat_type, risk_level, risk_score, social_engineering, social_engineering_techniques, credential_request, otp_request, suspicious_message, reason, recommended_action, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      sec.threat_detected ? 1 : 0,
      sec.threat_type || 'None',
      sec.risk_level || 'LOW',
      sec.risk_score || 0,
      sec.social_engineering ? 1 : 0,
      JSON.stringify(sec.techniques || []),
      sec.credential_request ? 1 : 0,
      sec.otp_request ? 1 : 0,
      sec.suspicious_message ? 1 : 0,
      sec.reason || '',
      aiResult.recommended_action,
      dateStr
    );

    // Re-insert URLs
    if (aiResult.urls && Array.isArray(aiResult.urls)) {
      const urlStmt = db.prepare(`
        INSERT INTO urls (conversation_id, url, domain, subdomain, protocol, url_length, uses_ip, https, suspicious_characters, shortened, lookalike, risk_score, risk_reason, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      aiResult.urls.forEach(u => {
        urlStmt.run(id, u.url, u.domain, u.subdomain, u.protocol, u.url_length, u.uses_ip, u.https, u.suspicious_characters, u.shortened, u.lookalike, u.risk_score, u.risk_reason, dateStr);
      });
    }

    // Re-insert Emails
    if (aiResult.emails && Array.isArray(aiResult.emails)) {
      const emailStmt = db.prepare(`
        INSERT INTO emails (conversation_id, email, domain, display_name, domain_mismatch, lookalike, free_mail, risk_score, risk_reason, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      aiResult.emails.forEach(e => {
        emailStmt.run(id, e.email, e.domain, e.display_name, e.domain_mismatch, e.lookalike, e.free_mail, e.risk_score, e.risk_reason, dateStr);
      });
    }

    return res.json({
      conversation_id: id,
      message: 'Conversation re-analyzed successfully',
      analysis: aiResult
    });
  } catch (err) {
    console.error('Error re-analyzing conversation:', err);
    return res.status(500).json({ error: 'Re-analysis failed' });
  }
}
