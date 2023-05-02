import dynamic from 'next/dynamic';
import GovernView from '../../../modules/govern/GovernView'

// const GovernView = dynamic(() => import('@/modules/govern/GovernView'));

export default function GovernPage() {
  return (
    <>
      <GovernView />
    </>
  );
}
