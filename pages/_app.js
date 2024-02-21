import Head from 'next/head';
import Layout from '../modules/layout';
import '../styles/global.scss';
import 'antd/dist/reset.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { message } from 'antd';
import Loading from './Loading';
import { useState, useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  message.config({
    maxCount: 2,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (document.readyState === 'complete') {
      setIsLoading(false);
    } else {
      window.addEventListener('load', () => {
        setIsLoading(false);
      });
      return () =>
        document.removeEventListener('load', () => {
          setIsLoading(false);
        });
    }
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="loading_logo">
          <Loading />
        </div>
      ) : (
        <Layout>
          <Head>
            <title>cSwap Exchange</title>
            <link rel="shortcut icon" href="/assets/favicon.ico" />
          </Head>
          <Component {...pageProps} />
        </Layout>
      )}
    </>
  );
}

export default MyApp;
