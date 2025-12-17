import { NextRequest, NextResponse } from 'next/server';
import { sendSMS } from '@/lib/sms';
import { verificationCodes } from '@/lib/verification-store';

export async function POST(request: NextRequest) {
  const { phone } = await request.json() as { phone: string };

  if (!phone) {
    return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
  }

  // Normalize phone number
  const normalized = normalizePhone(phone);
  if (!normalized) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Store with 10 minute expiry
  verificationCodes.set(normalized, {
    code,
    expires: Date.now() + 10 * 60 * 1000,
  });

  // Send SMS
  try {
    await sendSMS(normalized, `Your Slate verification code is: ${code}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send verification SMS:', error);
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
  }
}

function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');

  // US number
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // Already has country code
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // International with +
  if (phone.startsWith('+') && digits.length >= 10) {
    return `+${digits}`;
  }

  return null;
}
