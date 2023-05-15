import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
     
      </Head>
      <body className="dark-mode">
        <Script
          type="text/javascript"
          src="https://s3.tradingview.com/tv.js"
        ></Script>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
