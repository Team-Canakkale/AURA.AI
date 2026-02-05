// apps/backend-finance/test-tusu.ts

async function runTest() {
    const API_URL = 'http://localhost:4001';

    console.log('🚀 TUSU MVP Test Starting...');

    // --- SCENARIO 1: Expense Analysis ---
    console.log('\n--- Step 1: Testing /api/analyze-expenses ---');

    const analysisPayload = {
        transactions: [
            { date: '2025-02-01', description: 'Starbucks', category: 'Dining', amount: 150, currency: 'TRY' },
            { date: '2025-02-02', description: 'Kahve Dünyası', category: 'Dining', amount: 200, currency: 'TRY' },
            { date: '2025-02-03', description: 'Espresso Lab', category: 'Dining', amount: 5000, currency: 'TRY' } // EXCESSIVE SPENDING
        ]
    };

    try {
        const analyzeRes = await fetch(`${API_URL}/api/analyze-expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(analysisPayload)
        });

        if (!analyzeRes.ok) {
            throw new Error(`Analysis failed with status: ${analyzeRes.status}`);
        }

        const analysisData = await analyzeRes.json();
        console.log('✅ Analysis Result:', JSON.stringify(analysisData, null, 2));

        // --- SCENARIO 2: Chatbot ---
        if (analysisData && analysisData.success) {
            console.log('\n--- Step 2: Testing /api/chat ---');

            const chatPayload = {
                userMessage: "Merhaba TUSU! Bu yatırım fonu güvenli mi?",
                contextData: analysisData.data
            };

            const chatRes = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(chatPayload)
            });

            if (!chatRes.ok) {
                throw new Error(`Chat failed with status: ${chatRes.status}`);
            }

            const chatData = await chatRes.json();
            console.log('🐿️ TUSU Chat Response:', JSON.stringify(chatData, null, 2));
        }

    } catch (error) {
        console.error('❌ TEST FAILED:', error);
    }
}

runTest();