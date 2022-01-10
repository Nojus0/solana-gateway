import styled from "@emotion/styled"
import { IMargin, IPadding } from "./interfaces"

export const NetworkContainer = styled.div({
  display: "flex",
  flexWrap: "wrap",
  margin: ".75rem 0 .5rem 0"
})

type INetworkCardProps = {
  network: "main" | "dev"
  selected?: boolean
  outline?: string
} & IPadding &
  IMargin

const NetworkCard = styled.button(
  ({
    network = "main",
    padding = ".7rem 1.25rem",
    margin = "0 .5rem",
    outline = ".15rem",
    selected = false
  }: INetworkCardProps) => ({
    padding,
    margin,
    borderRadius: "1.15rem",
    "&:focus-visible": {
      outline: "#dedede .2rem solid"
    },
    cursor: "pointer",
    color:
      network == "main" && selected
        ? "#E95420"
        : network == "dev" && selected
        ? "#007ED9"
        : "white",
    border:
      network == "main"
        ? `${outline} solid #E95420`
        : network == "dev"
        ? `${outline} solid #007ED9`
        : "none",
    background:
      network == "main" && !selected
        ? "#E95420"
        : network == "dev" && !selected
        ? "#007ED9"
        : "transparent"
  })
)

export default NetworkCard
