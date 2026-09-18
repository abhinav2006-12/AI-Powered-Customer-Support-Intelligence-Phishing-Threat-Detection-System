import db from '../db/database.js';

export function getAnalytics(req, res) {
  try {
    const { range = '30d' } = req.query;

    let dateFilter = '';
    if (range === 'today') {
      dateFilter = "WHERE c.created_at >= DATE('now', 'start of day')";
    } else if (range === '7d') {
      dateFilter = "WHERE c.created_at >= DATE('now', '-7 days')";
    } else if (range === '30d') {
      dateFilter = "WHERE c.created_at >= DATE('now', '-30 days')";
    } // 'all' has no filter

    // 1. Most Common Complaint Categories
    const categories = db.prepare(`
      SELECT a.category, COUNT(*) as count 
      FROM analyses a 
      JOIN conversations c ON a.conversation_id = c.id
      ${dateFilter}
      GROUP BY a.category 
      ORDER BY count DESC
    `).all();

    // 2. Most Frequent Issues
    const topIssues = db.prepare(`
      SELECT a.issue, COUNT(*) as count 
      FROM analyses a 
      JOIN conversations c ON a.conversation_id = c.id
      ${dateFilter ? `${dateFilter} AND a.issue IS NOT NULL AND a.issue != ''` : "WHERE a.issue IS NOT NULL AND a.issue != ''"}
      GROUP BY a.issue 
      ORDER BY count DESC 
      LIMIT 8
    `).all();

    // 3. Sentiment Breakdown
    const sentiments = db.prepare(`
      SELECT a.sentiment, COUNT(*) as count 
      FROM analyses a 
      JOIN conversations c ON a.conversation_id = c.id
      ${dateFilter}
      GROUP BY a.sentiment
    `).all();

    // 4. Resolution Status Overview
    const resolutions = db.prepare(`
      SELECT a.resolution_status, COUNT(*) as count 
      FROM analyses a 
      JOIN conversations c ON a.conversation_id = c.id
      ${dateFilter}
      GROUP BY a.resolution_status
    `).all();

    // 5. Top Suspicious Domains
    const suspiciousDomains = db.prepare(`
      SELECT u.domain, COUNT(*) as count, MAX(u.risk_score) as max_risk
      FROM urls u
      JOIN conversations c ON u.conversation_id = c.id
      ${dateFilter ? `${dateFilter} AND u.risk_score >= 25` : "WHERE u.risk_score >= 25"}
      GROUP BY u.domain
      ORDER BY count DESC
      LIMIT 6
    `).all();

    // 6. Social Engineering Technique Frequencies
    const threatsList = db.prepare(`
      SELECT t.social_engineering_techniques
      FROM threats t
      JOIN conversations c ON t.conversation_id = c.id
      ${dateFilter ? `${dateFilter} AND t.social_engineering = 1` : "WHERE t.social_engineering = 1"}
    `).all();

    const techniqueCounts = {};
    threatsList.forEach(t => {
      try {
        const arr = JSON.parse(t.social_engineering_techniques || '[]');
        arr.forEach(tech => {
          techniqueCounts[tech] = (techniqueCounts[tech] || 0) + 1;
        });
      } catch (e) {}
    });

    const topTechniques = Object.entries(techniqueCounts)
      .map(([technique, count]) => ({ technique, count }))
      .sort((a, b) => b.count - a.count);

    // 7. Timeline Breakdown by Channel
    const channels = db.prepare(`
      SELECT c.channel, COUNT(*) as count 
      FROM conversations c
      ${dateFilter}
      GROUP BY c.channel
    `).all();

    return res.json({
      range,
      categories,
      topIssues,
      sentiments,
      resolutions,
      suspiciousDomains,
      topTechniques,
      channels
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}
