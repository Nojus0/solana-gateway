import styled from "@emotion/styled"
import { IMargin, IPadding } from "./interfaces"

type INetworkCardProps = {
  network: "main" | "dev"
} & IPadding &
  IMargin

const NetworkCard = styled.button(
  ({
    network = "main",
    padding = ".7rem 1.25rem",
    margin = "0 .5rem"
  }: INetworkCardProps) => ({
    padding,
    margin,
    borderRadius: "1rem",
    cursor: "pointer",
    color: "white",
    border: "none",
    background: network === "main" ? "#E95420" : "#007ED9"
  })
)

export default NetworkCard
