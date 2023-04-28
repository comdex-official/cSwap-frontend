import dynamic from 'next/dynamic';

const OrderBook = dynamic(() => import('@/modules/assets/Assets'));

export default function AssetsPage() {
  return <>{/* <OrderBook /> */}</>;
}
