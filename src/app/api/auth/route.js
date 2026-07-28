import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { password } = await request.json();
    
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Default for dev
    const VIEWER_PASSWORD = process.env.VIEWER_PASSWORD || 'viewer123'; // Default for dev

    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ role: 'admin' });
    } else if (password === VIEWER_PASSWORD) {
      return NextResponse.json({ role: 'viewer' });
    } else {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
