import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const db = (process.env as any).DB;
    const body = await request.json();
    const { username, password } = body;

    // Only check DB binding
    if (!db) return NextResponse.json({ error: 'Database binding not found' }, { status: 500 });

    const user = await db.prepare('SELECT name, username FROM users WHERE username = ? AND password = ?')
      .bind(username, password)
      .first();

    if (user) {
      // Use username as id if id column is missing
      const userWithId = { ...user, id: (user as any).id || user.username };
      return NextResponse.json({ success: true, user: userWithId });
    } else {
      return NextResponse.json({ success: false, message: 'Username atau password salah!' });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
