import { NextResponse } from 'next/server';

export async function POST() {
  const apiKey = process.env.VAPI_PRIVATE_KEY;
  const assistantId = process.env.VAPI_ASSISTANT_ID;
  const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;
  const customerNumber = process.env.MY_MOBILE_NUMBER;

  if (!apiKey || !assistantId || !phoneNumberId || !customerNumber) {
    return NextResponse.json(
      { error: 'Missing environment variables' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumberId: phoneNumberId,
        customer: {
          number: customerNumber,
        },
        assistantId: assistantId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Vapi AI Error:', data);
      return NextResponse.json(
        { error: data.message || 'Failed to trigger call' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
