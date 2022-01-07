import styled from "@emotion/styled"
import { IColor, IFontSize, IMargin, IPadding } from "./interfaces"

const TextBox = styled.input(
  ({
    margin = ".5rem 0",
    padding = ".85rem 1rem",
    color = "black"
  }: IMargin & IPadding & IColor) => ({
    padding,
    margin,
    borderRadius: ".4rem",
    backgroundColor: "transparent",
    border: `.1rem solid ${color}`,
    color: "black"
  })
)

export const TextBoxLabel = styled.p(
  ({
    margin = ".8rem 0 .05rem .25rem",
    fontSize = ".95rem"
  }: IMargin & IFontSize) => ({
    fontSize,
    margin,
    color: "black",
    fontWeight: 400
  })
)

export default TextBox
