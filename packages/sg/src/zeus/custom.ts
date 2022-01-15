import { Chain } from "."

export const GqlInclude = Chain(process.env.NEXT_PUBLIC_API_URL!, {
  credentials: "include"
})
