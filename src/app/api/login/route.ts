import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const db = (process.env as any).DB;
    if (!db) return NextResponse.json({ error: 'Database binding not found' }, { status: 500 });

    const { username, password } = await request.json();

    const user = await db.prepare('SELECT * FROM users WHERE username = ? AND password = ?')
      .bind(username, password)
      .first();

    if (user) {
      return NextResponse.json({ 
        success: true, 
        user: { username: user.username, name: user.name } 
      });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
