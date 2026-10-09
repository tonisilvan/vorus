import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getUsersData } from '@/lib/admin-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const { users } = await getUsersData();
  // Nunca exponer passwordHash
  const safe = users.map(({ passwordHash: _ph, ...u }) => u);
  return NextResponse.json({ users: safe });
}
