import dynamic from 'next/dynamic';

const Trade = dynamic(() => import('../modules/trade/Trade'));

export default function Home() {
  return <Trade />;
}