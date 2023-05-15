"use client";
import Head from "next/head";
import Layout from "../modules/layout";
import "../styles/global.scss";
import "antd/dist/reset.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Head>
      <title>cSwap Exchange</title>
      <link rel="shortcut icon" href="/assets/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
