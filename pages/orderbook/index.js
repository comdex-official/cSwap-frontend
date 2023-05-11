import dynamic from 'next/dynamic';
import OrderBook from '../../modules/orderBook/OrderBook';

// const OrderBook = dynamic(() => import('@/modules/orderBook/OrderBook'));

export default function AssetsPage() {
  return (
    <>
      <OrderBook />
    </>
  );
}
