export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, language } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Anthropic API key not configured' });
  }

  const systemPrompt = `You are a UAE cybercrime and fraud detection expert. Analyze if the provided message is a scam.
Common UAE scams include: fake Etisalat/du rewards, fake Emirates NBD/FAB/ADCB banking alerts, fake RTA fines, fake prize wins (Mahzooz/Emirates Draw), fake job offers via WhatsApp, investment fraud, crypto scams, and "Package delivery" scams (Aramex/Emirates Post).

Return ONLY this JSON format, no extra text:
{
  "verdict": "SCAM or SAFE",
  "dangerLevel": "HIGH or MEDIUM or LOW",
  "confidence": "85% (number only with % sign)",
  "scamType": "category name (e.g., Banking Phishing, Fake Prize, etc.) or NONE",
  "explanation": "clear explanation in the requested language",
  "actionSteps": ["step1", "step2", "step3"],
  "reportTo": "authority name and number"
}

IMPORTANT: Reply to the "explanation" and "actionSteps" in the user's selected language: ${language}.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          { role: 'user', content: `Analyze this message: "${message}"` }
        ]
      })
    });

    const data = await response.json();
    
    if (data.content && data.content[0] && data.content[0].text) {
      const resultText = data.content[0].text.trim();
      // Attempt to parse JSON
      try {
        const jsonResult = JSON.parse(resultText);
        return res.status(200).json(jsonResult);
      } catch (parseError) {
        console.error('JSON Parse Error:', resultText);
        return res.status(500).json({ error: 'Failed to parse AI response' });
      }
    } else {
      throw new Error('Invalid response from AI');
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Analysis failed' });
  }
}
