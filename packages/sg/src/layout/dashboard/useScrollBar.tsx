import { useEffect } from "react"

function useScrollBar() {
  useEffect(() => {
    document.body.style.overflowY = "scroll"
    return () => {
      document.body.style.overflowY = "auto"
    }
  }, [])
}

export default useScrollBar
