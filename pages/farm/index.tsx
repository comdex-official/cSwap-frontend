import dynamic from 'next/dynamic';

const Farm = dynamic(() => import('@/modules/assets/Assets'));

export default function FarmPage() {
  return <>{/* <Farm /> */}</>;
}
