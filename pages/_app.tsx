import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import '../styles/global.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Layout = dynamic(() => import('@/modules/layout/Layout'));

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
