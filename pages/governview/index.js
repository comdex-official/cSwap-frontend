import dynamic from 'next/dynamic';

const GovernViewPage = dynamic(() =>
  import('../../modules/govern/GovernViewPage')
);

export default function GovernPage() {
  return <GovernViewPage />;
}
