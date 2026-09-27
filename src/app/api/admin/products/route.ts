import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { normalizeProduct, readProductsFile, writeProductsFile } from '@/lib/admin-store';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const data = readProductsFile();
  return NextResponse.json({ products: data.products });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { product, error } = normalizeProduct(body);
    if (!product) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const data = readProductsFile();
    if (data.products.some(p => p.slug === product.slug)) {
      return NextResponse.json(
        { error: `Ya existe un producto con el slug "${product.slug}"` },
        { status: 409 }
      );
    }

    data.products.push(product);
    writeProductsFile(data);
    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'No se pudo guardar el producto' },
      { status: 500 }
    );
  }
}
