import db from '../db/database.js';

export function getDashboardMetrics(req, res) {
  try {
    // 1. KPI Cards
    const totalConversations = db.prepare('SELECT COUNT(*) as count FROM conversations').get().count;
    const totalComplaints = db.prepare("SELECT COUNT(*) as count FROM analyses WHERE sentiment = 'Negative' OR category != 'Other'").get().count;
    const criticalCases = db.prepare("SELECT COUNT(*) as count FROM analyses a LEFT JOIN threats t ON a.conversation_id = t.conversation_id WHERE a.priority = 'Critical' OR t.risk_level = 'CRITICAL'").get().count;
    const unresolvedCases = db.prepare("SELECT COUNT(*) as count FROM analyses WHERE resolution_status = 'Unresolved'").get().count;
    const threatsDetected = db.prepare('SELECT COUNT(*) as count FROM threats WHERE threat_detected = 1').get().count;

    // 2. Sentiment Distribution
    const sentimentRows = db.prepare(`
      SELECT sentiment, COUNT(*) as count 
      FROM analyses 
      WHERE sentiment IS NOT NULL 
      GROUP BY sentiment
    `).all();

    // 3. Complaint Category Distribution
    const categoryRows = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM analyses 
      WHERE category IS NOT NULL 
      GROUP BY category 
      ORDER BY count DESC
    `).all();

    // 4. Priority Distribution
    const priorityRows = db.prepare(`
      SELECT priority, COUNT(*) as count 
      FROM analyses 
      WHERE priority IS NOT NULL 
      GROUP BY priority
    `).all();

    // 5. Threat Type Distribution
    const threatTypeRows = db.prepare(`
      SELECT threat_type, COUNT(*) as count 
      FROM threats 
      WHERE threat_detected = 1 
      GROUP BY threat_type 
      ORDER BY count DESC
    `).all();

    // 6. Issue Frequency (Top 5 Issues)
    const issueRows = db.prepare(`
      SELECT issue, COUNT(*) as count 
      FROM analyses 
      WHERE issue IS NOT NULL AND issue != '' 
      GROUP BY issue 
      ORDER BY count DESC 
      LIMIT 6
    `).all();

    // 7. Conversation Trends & Security Risk Trends (Last 14 days)
    const trendRows = db.prepare(`
      SELECT 
        DATE(c.created_at) as date, 
        COUNT(c.id) as total,
        SUM(CASE WHEN t.threat_detected = 1 THEN 1 ELSE 0 END) as threats,
        SUM(CASE WHEN a.priority = 'Critical' OR t.risk_level = 'CRITICAL' THEN 1 ELSE 0 END) as critical
      FROM conversations c
      LEFT JOIN analyses a ON c.id = a.conversation_id
      LEFT JOIN threats t ON c.id = t.conversation_id
      WHERE c.created_at >= DATE('now', '-14 days')
      GROUP BY DATE(c.created_at)
      ORDER BY date ASC
    `).all();

    // 8. Recent Threats List (Top 5)
    const recentThreats = db.prepare(`
      SELECT 
        t.id as threat_id,
        c.id as conversation_id,
        c.external_id,
        c.customer_name,
        c.customer_email,
        t.threat_type,
        t.risk_level,
        t.risk_score,
        t.reason,
        t.created_at
      FROM threats t
      JOIN conversations c ON t.conversation_id = c.id
      WHERE t.threat_detected = 1
      ORDER BY t.created_at DESC
      LIMIT 5
    `).all();

    // 9. Recent Unresolved Complaints (Top 5)
    const recentUnresolved = db.prepare(`
      SELECT 
        c.id as conversation_id,
        c.external_id,
        c.customer_name,
        c.channel,
        a.category,
        a.issue,
        a.priority,
        a.urgency,
        c.created_at
      FROM conversations c
      JOIN analyses a ON c.id = a.conversation_id
      WHERE a.resolution_status = 'Unresolved'
      ORDER BY c.created_at DESC
      LIMIT 5
    `).all();

    return res.json({
      kpi: {
        totalConversations,
        totalComplaints,
        criticalCases,
        unresolvedCases,
        threatsDetected
      },
      charts: {
        sentiment: sentimentRows,
        categories: categoryRows,
        priority: priorityRows,
        threatTypes: threatTypeRows,
        issues: issueRows,
        trends: trendRows
      },
      recent: {
        threats: recentThreats,
        unresolved: recentUnresolved
      }
    });
  } catch (err) {
    console.error('Error calculating dashboard metrics:', err);
    return res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
}
