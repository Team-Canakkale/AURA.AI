// Simple chat test
async function testChat() {
    const API_URL = 'http://localhost:4001';

    console.log('🐿️ Testing TUSU Chat...\n');

    const chatPayload = {
        userMessage: "Merhaba TUSU! Nasılsın?"
    };

    try {
        const chatRes = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(chatPayload)
        });

        const chatData = await chatRes.json();
        console.log('Response:', JSON.stringify(chatData, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testChat();
