import db from '../db/database.js';

export function getThreats(req, res) {
  try {
    const { risk_level = '', search = '', page = 1, limit = 20 } = req.query;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    // Summary Statistics
    const totalThreats = db.prepare('SELECT COUNT(*) as count FROM threats WHERE threat_detected = 1').get().count;
    const criticalThreats = db.prepare("SELECT COUNT(*) as count FROM threats WHERE risk_level = 'CRITICAL'").get().count;
    const highRiskThreats = db.prepare("SELECT COUNT(*) as count FROM threats WHERE risk_level = 'HIGH'").get().count;
    const suspiciousUrlsCount = db.prepare('SELECT COUNT(*) as count FROM urls WHERE risk_score >= 25').get().count;
    const suspiciousEmailsCount = db.prepare('SELECT COUNT(*) as count FROM emails WHERE risk_score >= 20').get().count;
    const socialEngineeringCount = db.prepare('SELECT COUNT(*) as count FROM threats WHERE social_engineering = 1').get().count;

    const whereConditions = ['t.threat_detected = 1'];
    const params = [];

    if (risk_level) {
      whereConditions.push('t.risk_level = ?');
      params.push(risk_level.toUpperCase());
    }

    if (search.trim()) {
      whereConditions.push('(c.customer_name LIKE ? OR c.customer_email LIKE ? OR c.external_id LIKE ? OR c.message LIKE ? OR t.threat_type LIKE ? OR t.reason LIKE ? OR t.social_engineering_techniques LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term, term, term);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM threats t
      JOIN conversations c ON t.conversation_id = c.id
      ${whereClause}
    `;
    const total = db.prepare(countQuery).get(...params).total;

    const itemsQuery = `
      SELECT 
        t.id as threat_id,
        t.conversation_id,
        c.external_id,
        c.customer_name,
        c.customer_email,
        c.channel,
        c.message,
        t.threat_type,
        t.risk_level,
        t.risk_score,
        t.social_engineering,
        t.social_engineering_techniques,
        t.credential_request,
        t.otp_request,
        t.reason,
        t.recommended_action,
        t.created_at
      FROM threats t
      JOIN conversations c ON t.conversation_id = c.id
      ${whereClause}
      ORDER BY t.risk_score DESC, t.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const items = db.prepare(itemsQuery).all(...params, parseInt(limit), offset).map(item => ({
      ...item,
      social_engineering_techniques: JSON.parse(item.social_engineering_techniques || '[]')
    }));

    return res.json({
      summary: {
        totalThreats,
        criticalThreats,
        highRiskThreats,
        suspiciousUrlsCount,
        suspiciousEmailsCount,
        socialEngineeringCount
      },
      items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching threat intelligence:', err);
    return res.status(500).json({ error: 'Failed to fetch threats' });
  }
}

export function getThreatById(req, res) {
  try {
    const { id } = req.params;
    const threat = db.prepare('SELECT * FROM threats WHERE id = ?').get(id);

    if (!threat) {
      return res.status(404).json({ error: 'Threat record not found' });
    }

    const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(threat.conversation_id);
    const analysis = db.prepare('SELECT * FROM analyses WHERE conversation_id = ?').get(threat.conversation_id);
    const urls = db.prepare('SELECT * FROM urls WHERE conversation_id = ?').all(threat.conversation_id);
    const emails = db.prepare('SELECT * FROM emails WHERE conversation_id = ?').all(threat.conversation_id);

    return res.json({
      threat: {
        ...threat,
        social_engineering_techniques: JSON.parse(threat.social_engineering_techniques || '[]')
      },
      conversation,
      analysis,
      urls,
      emails
    });
  } catch (err) {
    console.error('Error fetching threat details:', err);
    return res.status(500).json({ error: 'Failed to fetch threat details' });
  }
}
