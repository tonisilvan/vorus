import { getProductsData } from '@/lib/admin-store';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { products } = await getProductsData();
  return <HomeClient products={products} />;
}
