export function isUrlValid(web: string) {
  const url = new URL(web);

  if (process.env.NETWORK == "dev") return true;

  return !(
    url.hostname == "localhost" ||
    url.hostname == "127.0.0.1" ||
    url.protocol != "https:"
  );
}

