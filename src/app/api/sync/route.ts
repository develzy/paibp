import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const db = (process.env as any).DB;
    if (!db) return NextResponse.json({ error: 'Database binding not found' }, { status: 500 });

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      const result = await db.prepare('SELECT data_json FROM app_data WHERE key_name = ?').bind(key).first();
      return NextResponse.json(result ? JSON.parse(result.data_json) : []);
    }

    const results = await db.prepare('SELECT key_name, data_json FROM app_data').all();
    const data: any = {};
    results.results.forEach((row: any) => {
      data[row.key_name] = JSON.parse(row.data_json);
    });

    // Smart Merge: If app_data for classes or students is empty, pull from relational tables
    if (!data.classes || data.classes.length === 0) {
      const relClasses = await db.prepare('SELECT id, name, academic_year as year FROM classes').all();
      if (relClasses.results.length > 0) data.classes = relClasses.results;
    }
    
    if (!data.students || data.students.length === 0) {
      const relStudents = await db.prepare('SELECT id, nis, nisn, name, class_id as classId FROM students').all();
      if (relStudents.results.length > 0) data.students = relStudents.results;
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = (process.env as any).DB;
    if (!db) return NextResponse.json({ error: 'Database binding not found' }, { status: 500 });

    const body = await request.json();
    const { key, data } = body;

    if (!key) return NextResponse.json({ error: 'Key is required' }, { status: 400 });

    await db.prepare('INSERT INTO app_data (key_name, data_json, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key_name) DO UPDATE SET data_json = excluded.data_json, updated_at = CURRENT_TIMESTAMP')
      .bind(key, JSON.stringify(data))
      .run();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
