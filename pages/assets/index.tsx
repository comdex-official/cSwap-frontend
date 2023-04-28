import dynamic from 'next/dynamic';

const Assets = dynamic(() => import('@/modules/assets/Assets'));

export default function AssetsPage() {
  return (
    <>
      <Assets />
    </>
  );
}
