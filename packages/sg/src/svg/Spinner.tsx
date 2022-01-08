import { FC } from "react"
import { motion, SVGMotionProps } from "framer-motion"
import styled from "@emotion/styled"
const Spinner: FC<SVGMotionProps<SVGSVGElement>> = p => {
  // make framer motion spinning variant animation
  const spinVariant = {
    initial: {
      rotate: 0
    },
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  }

  return (
    <motion.svg
      variants={spinVariant}
      animate="animate"
      initial="initial"
      width="77"
      height="77"
      viewBox="0 0 77 77"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...p}
    >
      <g filter="url(#filter0_d_110_21)">
        <circle
          cx="38.5008"
          cy="36.5"
          r="31.5"
          stroke="url(#paint0_linear_110_21)"
          strokeWidth="6"
          shapeRendering="crispEdges"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_110_21"
          x="0.000732422"
          y="0"
          width="77"
          height="77.0001"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.241667 0 0 0 0 0.241667 0 0 0 0 0.241667 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_110_21"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_110_21"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_110_21"
          x1="38.5008"
          y1="2"
          x2="38.5008"
          y2="71"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#989898" />
          <stop offset="0.83125" stopColor="#F5F5F5" />
        </linearGradient>
      </defs>
    </motion.svg>
  )
}

export default Spinner

export const SpinnerWrapper = styled.div({
  display: "flex",
  width: "100%",
  margin: "2rem 0",
  alignItems: "center",
  justifyContent: "center"
})
