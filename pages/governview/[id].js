import dynamic from 'next/dynamic';

const GovernViewPage = dynamic(() =>
  import('../../modules/govern/GovernViewPage')
);

export default function GovernPage({ id }) {
  return <GovernViewPage id={id} />;
}

GovernPage.getInitialProps = async({ query })=> {
  const { id } = query;
  return { id };
}
