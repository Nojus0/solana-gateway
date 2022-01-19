import { URL } from "url"

export function isUrlValid(web: string, httpsRequired: boolean = false) {
  const url = new URL(web)

  if (
    (httpsRequired && url.protocol !== "https:") ||
    url.protocol !== "http:"
  ) {
    return false
  }

  return !(url.hostname == "localhost" || url.hostname == "127.0.0.1")
}
