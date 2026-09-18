import { generateChatResponse, getLiveSystemContext } from '../services/gemini.service.js';

export async function handleChatMessage(req, res) {
  try {
    const { message, history = [], mode = 'soc', includeContext = true } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const response = await generateChatResponse({
      message: message.trim(),
      history,
      mode,
      includeContext
    });

    return res.json({
      success: true,
      data: response
    });
  } catch (err) {
    console.error('Chat controller error:', err);
    return res.status(500).json({ error: 'Failed to process chat message: ' + err.message });
  }
}

export function handleGetChatSuggestions(req, res) {
  const suggestions = [
    {
      category: 'Cybersecurity & Threat Triage',
      icon: 'ShieldAlert',
      prompts: [
        'Analyze this link: http://paypa1-security.example/login for credential harvesting',
        'Explain how 2FA/OTP interception attacks work in customer support chats',
        'What are the recommended SOC containment steps for a lookalike domain scam?'
      ]
    },
    {
      category: 'Customer Support Copilot',
      icon: 'MessageSquare',
      prompts: [
        'Draft an empathetic response to a customer whose subscription was charged twice',
        'How should I respond to a customer threatening legal action over a delayed delivery?',
        'Write an escalation apology letter offering a 20% discount code'
      ]
    },
    {
      category: 'Ask Live Database',
      icon: 'Database',
      prompts: [
        'What are the current top complaint categories in our database?',
        'Summarize all unresolved cases and recent critical phishing threats',
        'How many total support conversations are stored in SQLite?'
      ]
    }
  ];

  return res.json({ suggestions });
}
