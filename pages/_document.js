import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head></Head>
      <body className="dark-mode">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
