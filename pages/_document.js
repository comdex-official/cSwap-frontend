import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script
          type="text/javascript"
          src="/static/charting_library/charting_library.js"
        ></script>
        <script src="/static/datafeeds/udf/dist/bundle.js" />
      </Head>
      <body className="dark-mode">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
