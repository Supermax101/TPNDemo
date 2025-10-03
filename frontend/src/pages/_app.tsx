import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { createTheme, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AppProvider } from '@/hooks/AppContext/AppProvider';
import { TPNParametersProvider } from '@/hooks/AppContext/TPNParametersContext';

const theme = createTheme({
  /** Put your mantine theme override here */
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <AppProvider>
        <TPNParametersProvider>
          <Component {...pageProps} />
        </TPNParametersProvider>
      </AppProvider>
    </MantineProvider>
  );
}
