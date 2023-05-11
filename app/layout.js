"use client";

import { Provider } from "react-redux";
import "../styles/global.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
import "antd/dist/reset.css";
import Header from "@/shared/components/header/Header";
import store from "@/logic/redux/store";
import { MantineProvider } from "@mantine/core";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            colorScheme: "light",
          }}
        >
          <Provider store={store}>
            <Header />
            {children}
          </Provider>
        </MantineProvider>
      </body>
    </html>
  );
}
