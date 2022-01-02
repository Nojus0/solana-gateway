import styled from "@emotion/styled"
import { IMargin, IPadding } from "./interfaces"

const TextBox = styled.input(
  ({ margin = ".5rem 0", padding = ".75rem 1rem" }: IMargin & IPadding) => ({
    padding,
    margin,
    borderRadius: ".4rem",
    backgroundColor: "transparent",
    border: ".1rem solid #D4D4D4",
    color: "black"
  })
)

export const TextBoxLabel = styled.p(({ margin = ".85rem 0 .25rem .25rem" }: IMargin) => ({
  margin,
  color: "black",
  fontWeight: 400,
  fontSize: ".95rem"
}))

export default TextBox
