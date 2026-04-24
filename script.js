document.addEventListener('DOMContentLoaded', () => {
    const scamCounter = document.getElementById('scamCounter');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const messageInput = document.getElementById('messageInput');
    const scanningOverlay = document.getElementById('scanningOverlay');
    const resultPanel = document.getElementById('resultPanel');
    const langBtns = document.querySelectorAll('.lang-btn');
    const matrixBg = document.getElementById('matrixBg');

    let selectedLang = 'EN';

    // Random counter animation
    let count = 1247;
    setInterval(() => {
        if (Math.random() > 0.7) {
            count += Math.floor(Math.random() * 3) + 1;
            scamCounter.textContent = count.toLocaleString();
            scamCounter.style.color = '#00FF88';
            setTimeout(() => scamCounter.style.color = '', 300);
        }
    }, 5000);

    // Matrix background effect
    function updateMatrix() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+-';
        let text = '';
        for (let i = 0; i < 20; i++) {
            let line = '';
            for (let j = 0; j < 80; j++) {
                line += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            text += line + '\n';
        }
        matrixBg.textContent = text;
    }
    
    let matrixInterval;

    // Language Selector
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedLang = btn.dataset.lang;
        });
    });

    // Analyze Button
    analyzeBtn.addEventListener('click', async () => {
        const message = messageInput.value.trim();
        if (!message) {
            alert('Please paste a message to analyze.');
            return;
        }

        // Show scanning state
        analyzeBtn.disabled = true;
        resultPanel.classList.add('hidden');
        scanningOverlay.classList.remove('hidden');
        
        // Start matrix animation
        matrixInterval = setInterval(updateMatrix, 100);

        try {
            const response = await fetch('/api/check-scam', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, language: selectedLang })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.explanation || 'API request failed');
            }

            const result = await response.json();
            displayResult(result);
        } catch (error) {
            console.error('Error:', error);
            alert(`ANALYSIS ERROR: ${error.message}`);
        } finally {
            clearInterval(matrixInterval);
            scanningOverlay.classList.add('hidden');
            analyzeBtn.disabled = false;
        }
    });

    function displayResult(data) {
        const isScam = data.verdict === 'SCAM';
        const bannerClass = isScam ? 'scam' : 'safe';
        const bannerText = isScam ? '⚠ THREAT DETECTED' : '✅ NO THREAT DETECTED';
        const gaugeClass = isScam ? 'red' : 'green';
        
        let gaugeWidth = parseInt(data.confidence) || 50;
        if (!isScam) gaugeWidth = 100 - (parseInt(data.confidence) / 2); // Show safe level

        resultPanel.innerHTML = `
            <div class="alert-banner ${bannerClass}">${bannerText}</div>
            <div class="result-content">
                <div class="gauge-section">
                    <div class="gauge-label">${isScam ? 'DANGER' : 'SAFETY'} LEVEL: ${data.dangerLevel}</div>
                    <div class="gauge-track">
                        <div class="gauge-fill ${gaugeClass}" style="width: 0%"></div>
                    </div>
                </div>

                <div class="grid-cards">
                    <div class="info-card">
                        <div class="info-label">THREAT TYPE</div>
                        <div class="info-value">${data.scamType}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">CONFIDENCE</div>
                        <div class="info-value">${data.confidence}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">VERDICT</div>
                        <div class="info-value" style="color: ${isScam ? 'var(--danger-red)' : 'var(--safe-green)'}">${data.verdict}</div>
                    </div>
                </div>

                <div class="analysis-section">
                    <div class="section-title">// THREAT ANALYSIS</div>
                    <p class="explanation-text">${data.explanation}</p>
                </div>

                ${isScam ? `
                    <div class="analysis-section">
                        <div class="section-title">// RECOMMENDED ACTIONS</div>
                        <ul class="action-list">
                            ${data.actionSteps.map((step, i) => `
                                <li class="action-item">
                                    <span class="action-num">0${i+1}</span>
                                    <span>${step}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <div class="authority-section">
                        <div class="section-title">// REPORT TO AUTHORITIES</div>
                        <div class="authority-grid">
                            <a href="tel:901" class="authority-btn">📞 Dubai Police: 901</a>
                            <a href="tel:80055" class="authority-btn">📞 TRA: 80055</a>
                            <a href="tel:80022823" class="authority-btn">📞 Central Bank: 800CBUAE</a>
                        </div>
                    </div>
                ` : `
                    <div class="analysis-section">
                        <div class="section-title">// SYSTEM NOTE</div>
                        <p class="explanation-text">The message appears to be legitimate based on current threat patterns. However, always remain cautious when clicking links or providing personal information.</p>
                    </div>
                `}

                <div class="reset-container">
                    <button id="resetBtn" class="reset-btn">RUN NEW SCAN</button>
                </div>
            </div>
        `;

        resultPanel.classList.remove('hidden');
        
        // Trigger gauge animation
        setTimeout(() => {
            const fill = resultPanel.querySelector('.gauge-fill');
            if (fill) fill.style.width = gaugeWidth + '%';
        }, 100);

        document.getElementById('resetBtn').addEventListener('click', () => {
            resultPanel.classList.add('hidden');
            messageInput.value = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Scroll to result
        resultPanel.scrollIntoView({ behavior: 'smooth' });
    }
});
