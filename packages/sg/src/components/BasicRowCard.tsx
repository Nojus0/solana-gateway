import styled from "@emotion/styled"
import { AnimatePresence, HTMLMotionProps, motion } from "framer-motion"
import Link from "next/link"
import fadeVariant from "../animations/fadeVariant"
import Button from "./Button"
import { IMargin } from "./interfaces"
import { A } from "./Text"
import TextBox from "./TextBox"

interface IField {
  label: string
  value: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

interface IBasicRowCard extends HTMLMotionProps<"div"> {
  title: string
  fields: IField[]
  margin?: string
}

const BasicRowCard: React.FC<IBasicRowCard> = ({
  title,
  fields,
  children,
  ...rest
}) => {
  return (
    <Wrapper>
      <Box
        variants={fadeVariant}
        animate="visible"
        initial="hidden"
        exit="hidden"
        {...rest}
      >
        <Title>{title}</Title>
        {fields.map(field => (
          <Row key={field.label}>
            <Entry>{field.label}</Entry>
            {field.onChange ? (
              <TextBox
                padding=".5rem"
                margin="0"
                value={field.value}
                onChange={field.onChange}
              />
            ) : (
              <Entry>{field.value}</Entry>
            )}
          </Row>
        ))}
        {children}
      </Box>
    </Wrapper>
  )
}

const Row = styled.div({
  display: "flex"
})

const Entry = styled.p({
  margin: ".5rem 0",
  flexGrow: 1,
  fontSize: "1.15rem",
  fontWeight: 400,
  textOverflow: "ellipsis",
  overflow: "hidden",
  // whiteSpace: "nowrap",
  wordBreak: "break-all",
  flexBasis: "100%",
  color: "#7B7B7B"
})

const Title = styled.h1({
  fontSize: "2rem",
  color: "#575757",
  margin: ".5rem 0"
})
interface IWidth {
  width?: string
}

const Wrapper = styled.div({
  width: "100%",
  "@media (min-width: 65rem)": {
    width: "30rem"
  },
  padding: "1rem"
})

const Box = styled(motion.div)(({ margin = "0" }: IMargin) => ({
  background: "#FFFFFF",
  borderRadius: ".75rem",
  margin,
  padding: "1.7rem",
  wordBreak: "break-all",
  textOverflow: "ellipsis",
  boxShadow: "0px 2px 4px rgba(138, 138, 138, 0.25)"
}))

export const ButtonRight = styled.div({
  display: "flex",
  justifyContent: "flex-end"
})

export default BasicRowCard
