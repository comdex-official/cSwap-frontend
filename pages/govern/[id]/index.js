import dynamic from 'next/dynamic';

const GovernView = dynamic(() =>
  import('../../../modules/govern/GovernViewPage')
);

export default function GovernPage() {
  return <GovernView />;
}
