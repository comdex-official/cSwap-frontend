import dynamic from 'next/dynamic';
import '../styles/global.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { MantineProvider } from '@mantine/core';
import Layout from '../modules/layout/Layout';

// const Layout = dynamic(() => import('@/modules/layout/Layout'));

export default function App({ Component, pageProps }) {
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        colorScheme: 'light',
      }}
    >
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </MantineProvider>
  );
}
