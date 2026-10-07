import { Metadata } from 'next';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getProductsData } from '@/lib/admin-store';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Administración',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return <AdminLogin />;
  }

  const { products } = await getProductsData();
  return <AdminDashboard initialProducts={products} />;
}
