import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getUsersData, saveUsersData } from '@/lib/admin-store';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await getUsersData();
    const exists = data.users.some(u => u.id === id);
    if (!exists) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    data.users = data.users.filter(u => u.id !== id);
    await saveUsersData(data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Error eliminando usuario:', e);
    return NextResponse.json(
      { error: 'No se pudo eliminar el usuario' },
      { status: 500 }
    );
  }
}
