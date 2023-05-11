"use client";
import Layout from '../modules/layout';
import '../styles/global.scss'
import 'antd/dist/reset.css';

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

export default MyApp
