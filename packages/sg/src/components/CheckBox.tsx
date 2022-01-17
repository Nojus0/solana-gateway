import styled from "@emotion/styled"
import { motion } from "framer-motion"
import { IMargin } from "./interfaces"

interface ICheckBoxProps {
  size?: string
}

const CheckBox = styled(motion.button)(
  ({ margin = ".5rem 0", size = "2rem" }: ICheckBoxProps & IMargin) => ({
    margin,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: size,
    background: "white",
    minHeight: size,
    cursor: "pointer",
    borderRadius: ".5rem",
    border: "none",
    height: size,
    width: size,
    boxShadow: "0px 0px 7px rgba(0, 0, 0, 0.25)"
  })
)

export default CheckBox