// Production Vercel API with Heuristic Fallback
const analyzeLocally = (message, language) => {
    const msg = message.toLowerCase();
    let verdict = "SAFE";
    let dangerLevel = "LOW";
    let confidence = "60%";
    let scamType = "NONE";
    let explanation = "No known scam patterns were detected in this message. However, stay vigilant.";
    let actionSteps = ["Verify the sender's identity.", "Avoid sharing sensitive info."];

    const patterns = [
        { keywords: ['rta', 'fine', 'penalty'], type: 'Fake Traffic Fine', danger: 'HIGH', reason: 'Mimics official RTA notifications to steal payment details.' },
        { keywords: ['aramex', 'package', 'delivery'], type: 'Package Delivery Scam', danger: 'HIGH', reason: 'Tricks users into paying "shipping fees" for fake deliveries.' },
        { keywords: ['nbd', 'fab', 'adcb', 'blocked', 'verify'], type: 'Banking Phishing', danger: 'CRITICAL', reason: 'Attempt to steal banking credentials.' },
        { keywords: ['winner', 'prize', 'won'], type: 'Fake Prize/Lottery', danger: 'MEDIUM', reason: 'Asks for fees to claim a non-existent prize.' }
    ];

    for (const p of patterns) {
        if (p.keywords.some(k => msg.includes(k))) {
            verdict = "SCAM";
            dangerLevel = p.danger;
            confidence = "90%";
            scamType = p.type;
            explanation = p.reason;
            actionSteps = ["Do not click any links.", "Report the number immediately.", "Verify via official apps."];
            break;
        }
    }

    return { verdict, dangerLevel, confidence, scamType, explanation, actionSteps, reportTo: "Dubai Police (901)" };
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { message, language } = req.body;
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

    // Use Heuristic engine if API key is missing
    if (!ANTHROPIC_API_KEY) {
        return res.status(200).json(analyzeLocally(message, language));
    }

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
                system: `Analyze if UAE message is a scam. Return ONLY JSON.`,
                messages: [{ role: 'user', content: message }]
            })
        });

        const data = await response.json();
        
        if (data.error || !data.content) {
            return res.status(200).json(analyzeLocally(message, language));
        }

        const rawText = data.content[0].text;
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        return res.status(200).json(JSON.parse(jsonMatch ? jsonMatch[0] : rawText));
    } catch (error) {
        return res.status(200).json(analyzeLocally(message, language));
    }
}
