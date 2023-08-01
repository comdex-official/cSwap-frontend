import dynamic from 'next/dynamic';

const GovernViewPage = dynamic(() =>
  import('../../modules/govern/GovernViewPage')
);

export default function GovernPage({ id }) {
  return <GovernViewPage id={id} />;
}

export async function getServerSideProps(context) {
  const { id } = context.query;
  return { props: { id } };
}
