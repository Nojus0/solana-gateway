export function envProcessor(envs: string[]) {
  for (const env of envs) {
    if (!process.env[env])
      throw new Error(`${env} is not present in .env or enviroment variables`);
  }
}
