import styled from "@emotion/styled"
import { motion } from "framer-motion"
import { IFontSize, IMargin, IPadding } from "./interfaces"

interface IButtonProps {
  margin?: string
  padding?: string
  variant?: "normal" | "outline"
  fontSize?: string
}

const Button = styled(motion.button)(
  ({
    padding = "0.75rem 1.25rem",
    margin = "0.25rem",
    variant = "normal",
    fontSize = "1.05rem"
  }: IButtonProps) => ({
    padding,
    margin,
    fontSize,
    fontWeight: 500,
    "&:focus-visible": {
      outline: "#dedede .2rem solid"
    },
    borderRadius: ".45rem",
    background: variant == "normal" ? "black" : "white",
    border: ".15rem solid black",
    cursor: "pointer",
    color: variant == "normal" ? "white" : "black",
    letterSpacing: "-0.01em"
  })
)

export default Button

interface ITextButton {}

export const TextButton = styled.p(
  ({
    fontSize = "1.2rem",
    padding = "0.8rem 1.45rem",
    margin = "0rem"
  }: IFontSize & IMargin & IPadding) => ({
    margin,
    padding,
    fontWeight: 400,
    fontSize,
    cursor: "pointer",
    color: "#575757"
  })
)
