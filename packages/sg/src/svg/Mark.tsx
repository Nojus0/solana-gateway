import styled from "@emotion/styled"
import { HTMLMotionProps, motion, MotionProps, SVGMotionProps } from "framer-motion"
import { SVGProps } from "react"

const Mark: React.FC<SVGMotionProps<SVGElement>> = props => {
  return (
    <motion.svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M1 6.90903C1 6.90903 4.19908 10.9622 4.22581 10.9999C4.25253 11.0376 11 1 11 1"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </motion.svg>
  )
}

export const GatewayText = styled.h1({
  fontWeight: 500,
  flexGrow: 1,
  margin: "0 .85rem",
  color: "black",
  fontSize: "2.15rem"
})

export default Mark
