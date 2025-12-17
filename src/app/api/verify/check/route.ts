import { NextRequest, NextResponse } from 'next/server';
import { verificationCodes } from '@/lib/verification-store';

export async function POST(request: NextRequest) {
  const { phone, code } = await request.json() as { phone: string; code: string };

  if (!phone || !code) {
    return NextResponse.json({ error: 'Phone and code required' }, { status: 400 });
  }

  const normalized = normalizePhone(phone);
  if (!normalized) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
  }

  const stored = verificationCodes.get(normalized);

  if (!stored) {
    return NextResponse.json({ error: 'No verification code found. Request a new one.' }, { status: 400 });
  }

  if (Date.now() > stored.expires) {
    verificationCodes.delete(normalized);
    return NextResponse.json({ error: 'Code expired. Request a new one.' }, { status: 400 });
  }

  if (stored.code !== code) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
  }

  // Success - clean up
  verificationCodes.delete(normalized);

  return NextResponse.json({ success: true, phone: normalized });
}

function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  if (phone.startsWith('+') && digits.length >= 10) {
    return `+${digits}`;
  }

  return null;
}
