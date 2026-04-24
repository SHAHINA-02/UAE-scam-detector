const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Import the local API handler
const checkScamHandler = require('./api/check-scam-local.js');

app.post('/api/check-scam', async (req, res) => {
    console.log(`[API] Processing analysis request (${req.body.language})...`);
    
    const vercelRes = {
        status: (code) => ({
            json: (data) => {
                console.log(`[API] Completed with status ${code}`);
                res.status(code).send(data);
            }
        })
    };
    
    try {
        await checkScamHandler(req, vercelRes);
    } catch (error) {
        console.error('[SERVER ERROR]', error);
        res.status(500).send({ error: 'Local server error during analysis.' });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 UAE Scam Detector Local Server`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`\nWatching for requests...\n`);
});
