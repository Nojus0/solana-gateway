import styled from "@emotion/styled"
import { IColor, IFontSize, IMargin, IPadding } from "./interfaces"

interface IVariant {
  variant?: "normal" | "error"
}

const TextBox = styled.input(
  ({
    margin = ".5rem 0",
    padding = ".85rem 1rem",
    color = "black",
    variant = "normal"
  }: IMargin & IPadding & IColor & IVariant) => ({
    padding,
    margin,
    borderRadius: ".5rem",
    backgroundColor: "transparent",
    border: variant == "normal" ? `.15rem solid ${color}`: `.15rem solid #DD0000`,
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
