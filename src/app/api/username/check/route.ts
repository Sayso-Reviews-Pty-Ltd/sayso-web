import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

/**
 * GET /api/username/check?username=foo
 * Returns { available: boolean }
 * 400 if username is missing or invalid format
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'username is required' }, { status: 400 });
  }

  if (!USERNAME_REGEX.test(username)) {
    return NextResponse.json(
      { error: 'Username must be 3–20 characters and only contain letters, numbers, or underscores' },
      { status: 400 }
    );
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[Username Check] Missing Supabase credentials');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .ilike('username', username)
    .maybeSingle();

  if (error) {
    console.error('[Username Check] Supabase error:', error.message);
    return NextResponse.json({ error: 'Failed to check username' }, { status: 500 });
  }

  return NextResponse.json({ available: data === null });
}
