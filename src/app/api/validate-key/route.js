import { NextResponse } from 'next/server';

export async function GET() {
  // Retrieve secret key from environment variables
  const license = process.env.LICENSE_KEY; // Ensure this is set in your .env file

  if (!license) {
    return NextResponse.json({ error: 'License key not found' }, { status: 500 });
  }

  return NextResponse.json({ license });
}
