import { Html, Head, Main, NextScript } from "next/document";
import { ColorSchemeScript } from '@mantine/core';

export default function Document() {
  return (
    <Html lang="en">
      <Head title="TakeoffAI TPN2.0 Demo">
        <ColorSchemeScript defaultColorScheme="auto" />
        <link rel="icon" type="image/png" href="/Group-46.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
