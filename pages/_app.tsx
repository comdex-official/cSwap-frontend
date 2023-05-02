import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import '../styles/global.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { MantineProvider } from '@mantine/core';

const Layout = dynamic(() => import('@/modules/layout/Layout'));

export default function App({ Component, pageProps }: AppProps) {
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
