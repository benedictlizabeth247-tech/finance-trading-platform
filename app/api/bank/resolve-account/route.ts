
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { accountNumber, bankCode } = await request.json();

  // Simulate network delay
  await new Promise(r => setTimeout(r, 1000));

  if (accountNumber && accountNumber.length === 10) {
    return NextResponse.json({
      success: true,
      accountName: "CHUKWUMA OGBONNA"
    });
  }

  return NextResponse.json({
    success: false,
    error: "Could not resolve account name"
  }, { status: 400 });
}
