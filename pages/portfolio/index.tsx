import dynamic from 'next/dynamic';

const Portfolio = dynamic(() => import('@/modules/portfolio/Portfolio'));

export default function PortfolioPage() {
  return (
    <>
      <Portfolio />
    </>
  );
}
