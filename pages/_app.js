"use client";
import Head from "next/head";
import Layout from "../modules/layout";
import "../styles/global.scss";
import "antd/dist/reset.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { message } from "antd";

function MyApp({ Component, pageProps }) {
  message.config({
    maxCount: 2,
  });
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
