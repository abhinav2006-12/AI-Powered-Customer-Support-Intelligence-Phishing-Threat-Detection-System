import db from '../db/database.js';
import { analyzeConversationWithAI } from '../services/ai.service.js';

export function getConversations(req, res) {
  try {
    const { 
      search = '', 
      category = '', 
      priority = '', 
      sentiment = '', 
      security = '', 
      resolution = '',
      page = 1,
      limit = 20
    } = req.query;

    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const params = [];
    let whereConditions = [];

    if (search.trim()) {
      whereConditions.push('(c.customer_name LIKE ? OR c.customer_email LIKE ? OR c.message LIKE ? OR a.issue LIKE ?)');
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      whereConditions.push('a.category = ?');
      params.push(category);
    }

    if (priority) {
      whereConditions.push('a.priority = ?');
      params.push(priority);
    }

    if (sentiment) {
      whereConditions.push('a.sentiment = ?');
      params.push(sentiment);
    }

    if (security) {
      if (security === 'Threat') {
        whereConditions.push('t.threat_detected = 1');
      } else if (security === 'Clean') {
        whereConditions.push('t.threat_detected = 0');
      } else {
        whereConditions.push('t.risk_level = ?');
        params.push(security.toUpperCase());
      }
    }

    if (resolution) {
      whereConditions.push('a.resolution_status = ?');
      params.push(resolution);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM conversations c
      LEFT JOIN analyses a ON c.id = a.conversation_id
      LEFT JOIN threats t ON c.id = t.conversation_id
      ${whereClause}
    `;
    const totalRow = db.prepare(countQuery).get(...params);
    const total = totalRow ? totalRow.total : 0;

    const query = `
      SELECT 
        c.id,
        c.external_id,
        c.customer_name,
        c.customer_email,
        c.channel,
        c.message,
        c.status,
        c.created_at,
        a.category,
        a.issue,
        a.sentiment,
        a.priority,
        a.resolution_status,
        t.threat_detected,
        t.threat_type,
        t.risk_level,
        t.risk_score
      FROM conversations c
      LEFT JOIN analyses a ON c.id = a.conversation_id
      LEFT JOIN threats t ON c.id = t.conversation_id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const items = db.prepare(query).all(...params, parseInt(limit), offset);

    return res.json({
      items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    return res.status(500).json({ error: 'Failed to fetch conversations' });
  }
}

export function getConversationById(req, res) {
  try {
    const { id } = req.params;
    const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const analysis = db.prepare('SELECT * FROM analyses WHERE conversation_id = ?').get(id);
    const threat = db.prepare('SELECT * FROM threats WHERE conversation_id = ?').get(id);
    const urls = db.prepare('SELECT * FROM urls WHERE conversation_id = ?').all(id);
    const emails = db.prepare('SELECT * FROM emails WHERE conversation_id = ?').all(id);

    return res.json({
      conversation,
      analysis: analysis ? {
        ...analysis,
        keywords: JSON.parse(analysis.keywords || '[]'),
        entities: JSON.parse(analysis.entities || '[]')
      } : null,
      threat: threat ? {
        ...threat,
        social_engineering_techniques: JSON.parse(threat.social_engineering_techniques || '[]')
      } : null,
      urls,
      emails
    });
  } catch (err) {
    console.error('Error fetching conversation details:', err);
    return res.status(500).json({ error: 'Failed to fetch conversation details' });
  }
}

export async function createConversation(req, res) {
  try {
    const { 
      customer_name = 'Anonymous Customer', 
      customer_email = '', 
      channel = 'Email', 
      message, 
      conversation_history = '' 
    } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const extId = `CONV-${Date.now()}`;
    const dateStr = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO conversations (external_id, customer_name, customer_email, channel, message, conversation_history, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'Open', ?, ?)
    `);

    const info = insertStmt.run(extId, customer_name, customer_email, channel, message, conversation_history, dateStr, dateStr);
    const convId = info.lastInsertRowid;

    // Trigger immediate AI + Security analysis
    const aiResult = await analyzeConversationWithAI({
      message,
      conversationHistory: conversation_history,
      channel,
      customerName: customer_name,
      customerEmail: customer_email
    });

    // Save Analysis
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

    // Save Threat
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

    // Save URLs
    if (aiResult.urls && Array.isArray(aiResult.urls)) {
      const urlStmt = db.prepare(`
        INSERT INTO urls (conversation_id, url, domain, subdomain, protocol, url_length, uses_ip, https, suspicious_characters, shortened, lookalike, risk_score, risk_reason, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      aiResult.urls.forEach(u => {
        urlStmt.run(convId, u.url, u.domain, u.subdomain, u.protocol, u.url_length, u.uses_ip, u.https, u.suspicious_characters, u.shortened, u.lookalike, u.risk_score, u.risk_reason, dateStr);
      });
    }

    // Save Emails
    if (aiResult.emails && Array.isArray(aiResult.emails)) {
      const emailStmt = db.prepare(`
        INSERT INTO emails (conversation_id, email, domain, display_name, domain_mismatch, lookalike, free_mail, risk_score, risk_reason, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      aiResult.emails.forEach(e => {
        emailStmt.run(convId, e.email, e.domain, e.display_name, e.domain_mismatch, e.lookalike, e.free_mail, e.risk_score, e.risk_reason, dateStr);
      });
    }

    return res.status(201).json({
      id: convId,
      external_id: extId,
      message: 'Conversation created and analyzed successfully',
      analysis: aiResult
    });
  } catch (err) {
    console.error('Error creating conversation:', err);
    return res.status(500).json({ error: 'Failed to create and analyze conversation' });
  }
}

export function deleteConversation(req, res) {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM conversations WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    return res.json({ message: 'Conversation deleted successfully' });
  } catch (err) {
    console.error('Error deleting conversation:', err);
    return res.status(500).json({ error: 'Failed to delete conversation' });
  }
}
