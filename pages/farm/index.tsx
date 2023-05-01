import dynamic from 'next/dynamic';

const Farm = dynamic(() => import('@/modules/farm/Farm'));

export default function FarmPage() {
  return (
    <>
      <Farm />
    </>
  );
}
