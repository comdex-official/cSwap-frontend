import dynamic from 'next/dynamic';

const Govern = dynamic(() => import('@/modules/govern/Govern'));

export default function GovernPage() {
  return <>{/* <Govern /> */}</>;
}
