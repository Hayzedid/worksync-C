import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo purposes
// In production, you'd want to use a database or email service
let subscribers: string[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if email already exists
    if (subscribers.includes(email.toLowerCase())) {
      return NextResponse.json(
        { message: 'This email is already subscribed to our newsletter' },
        { status: 409 }
      );
    }

    // Add to subscribers list
    subscribers.push(email.toLowerCase());

    // Log subscription (in production, you'd save to database)
    console.log(`New newsletter subscription: ${email}`);
    console.log(`Total subscribers: ${subscribers.length}`);

    // In production, you might want to:
    // 1. Save to database
    // 2. Send welcome email
    // 3. Add to email marketing service (Mailchimp, ConvertKit, etc.)
    // 4. Send notification to admin

    return NextResponse.json(
      { 
        message: 'Successfully subscribed to newsletter!',
        subscriberCount: subscribers.length 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check subscription status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { message: 'Email parameter is required' },
      { status: 400 }
    );
  }

  const isSubscribed = subscribers.includes(email.toLowerCase());
  
  return NextResponse.json({
    email,
    isSubscribed,
    totalSubscribers: subscribers.length
  });
}