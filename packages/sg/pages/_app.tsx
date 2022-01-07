import "../styles/globals.css"
import type { AppProps } from "next/app"
import { Provider, useDispatch } from "react-redux"
import store from "../src/redux/store"
import { AnimatePresence } from "framer-motion"
import currentUserThunk from "../src/redux/thunks/currentUser"
function MyApp({ Component, pageProps }: AppProps) {

  return (
    <Provider store={store}>
      <AnimatePresence>
        <Component {...pageProps} />
      </AnimatePresence>
    </Provider>
  )
}

export default MyApp
