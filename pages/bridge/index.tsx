import dynamic from 'next/dynamic';

const Bridge = dynamic(() => import('@/modules/bridge/Bridge'));

export default function BridgePage() {
  return (
    <>
      <Bridge />
    </>
  );
}
