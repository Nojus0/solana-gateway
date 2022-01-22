import "../styles/globals.css"
import type { AppProps } from "next/app"
import { Provider, useDispatch } from "react-redux"
import store from "../src/redux/store"
import { AnimatePresence } from "framer-motion"
import currentUserThunk from "../src/redux/thunks/currentUser"
import Script from "next/script"
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA}', { page_path: window.location.pathname });
          `
        }}
      />
      <Provider store={store}>
        <AnimatePresence>
          <Component {...pageProps} />
        </AnimatePresence>
      </Provider>
    </>
  )
}

export default MyApp
