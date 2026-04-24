// Local Analysis Engine (Heuristic Fallback)
const analyzeLocally = (message, language) => {
    const msg = message.toLowerCase();
    let verdict = "SAFE";
    let dangerLevel = "LOW";
    let confidence = "60%";
    let scamType = "NONE";
    let explanation = "";
    let actionSteps = [];

    // UAE Scam Patterns
    const patterns = [
        {
            id: 'rta',
            keywords: ['rta', 'fine', 'penalty', 'traffic', 'violation', 'plate'],
            type: 'Fake Traffic Fine',
            danger: 'HIGH',
            reason: 'This message mimics official RTA traffic fine notifications to steal credit card details.'
        },
        {
            id: 'delivery',
            keywords: ['aramex', 'emirates post', 'package', 'delivery', 'shipping', 'address', 'unpaid'],
            type: 'Package Delivery Scam',
            danger: 'HIGH',
            reason: 'Commonly used to trick users into paying "shipping fees" or providing bank info for fake deliveries.'
        },
        {
            id: 'bank',
            keywords: ['nbd', 'fab', 'adcb', 'sib', 'blocked', 'verify', 'update', 'kyc', 'central bank'],
            type: 'Banking Phishing',
            danger: 'CRITICAL',
            reason: 'Attempt to steal online banking credentials by claiming your account is blocked or needs verification.'
        },
        {
            id: 'prize',
            keywords: ['winner', 'prize', 'mahzooz', 'emirates draw', 'congratulations', 'won', 'lottery', '500,000'],
            type: 'Fake Prize/Lottery',
            danger: 'MEDIUM',
            reason: 'Asks for "processing fees" to claim a prize that does not exist.'
        },
        {
            id: 'telecom',
            keywords: ['etisalat', 'du', 'points', 'reward', 'points', 'expire', 'recharge'],
            type: 'Telecom Fraud',
            danger: 'MEDIUM',
            reason: 'Requests login details to "redeem" expiring points or rewards.'
        }
    ];

    for (const p of patterns) {
        if (p.keywords.some(k => msg.includes(k))) {
            verdict = "SCAM";
            dangerLevel = p.danger;
            confidence = "85%";
            scamType = p.type;
            explanation = p.reason;
            actionSteps = [
                "Do not click any links in the message.",
                "Verify the claim through the official app or website.",
                "Report the number as spam on your device."
            ];
            break;
        }
    }

    if (verdict === "SAFE") {
        explanation = "No known scam patterns were detected in this message. However, stay vigilant.";
        actionSteps = ["Verify the sender's identity.", "Avoid sharing sensitive info."];
    }

    // Basic language support for fallback
    if (language === 'AR') {
        explanation = verdict === "SCAM" ? "تم اكتشاف تهديد محتمل. هذا النوع من الرسائل شائع في عمليات الاحتيال." : "لم يتم العثور على تهديد.";
    }

    return {
        verdict,
        dangerLevel,
        confidence,
        scamType,
        explanation,
        actionSteps,
        reportTo: "Dubai Police (901)"
    };
};

module.exports = async function handler(req, res) {
    const { message, language } = req.body;
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

    // If key is missing or known to be empty/placeholder, use local analysis
    if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY.includes('your_api_key') || ANTHROPIC_API_KEY.length < 20) {
        console.log('[SYSTEM] Using Heuristic Engine (Offline Mode)');
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
        
        // If API fails due to credits or other errors, use local analysis as fallback
        if (data.error) {
            console.log('[SYSTEM] API Error, falling back to Heuristic Engine...');
            return res.status(200).json(analyzeLocally(message, language));
        }

        if (data.content && data.content[0]) {
            return res.status(200).json(JSON.parse(data.content[0].text));
        }
        
        return res.status(200).json(analyzeLocally(message, language));
    } catch (error) {
        console.log('[SYSTEM] Connection Error, falling back to Heuristic Engine...');
        return res.status(200).json(analyzeLocally(message, language));
    }
};
