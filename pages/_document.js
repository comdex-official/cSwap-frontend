import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <Script
          type="text/javascript"
          src="/static/charting_library/charting_library.js"
        ></Script>
        <Script src="/static/datafeeds/udf/dist/bundle.js" />
      </Head>
      <body className="dark-mode">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
