import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { normalizeProduct, readProductsFile, writeProductsFile } from '@/lib/admin-store';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = readProductsFile();
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { product, error } = normalizeProduct(body, data.products[index]);
    if (!product) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const slugTaken = data.products.some(
      p => p.slug === product.slug && p.id !== id
    );
    if (slugTaken) {
      return NextResponse.json(
        { error: `Ya existe otro producto con el slug "${product.slug}"` },
        { status: 409 }
      );
    }

    data.products[index] = product;
    writeProductsFile(data);
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json(
      { error: 'No se pudo actualizar el producto' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = readProductsFile();
    const exists = data.products.some(p => p.id === id);
    if (!exists) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    data.products = data.products.filter(p => p.id !== id);
    writeProductsFile(data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'No se pudo eliminar el producto' },
      { status: 500 }
    );
  }
}
