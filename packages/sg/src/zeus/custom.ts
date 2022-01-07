import { Chain } from "."

export const GqlInclude = Chain("http://localhost:4000/graphql", {
  credentials: "include"
})
