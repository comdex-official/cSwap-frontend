import dynamic from 'next/dynamic';

const GovernView = dynamic(() => import('@/modules/govern/GovernView'));

export default function GovernPage() {
  return (
    <>
      <GovernView />
    </>
  );
}
