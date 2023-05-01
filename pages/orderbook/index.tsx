import dynamic from 'next/dynamic';

const OrderBook = dynamic(() => import('@/modules/orderBook/OrderBook'));

export default function AssetsPage() {
  return (
    <>
      <OrderBook />
    </>
  );
}
