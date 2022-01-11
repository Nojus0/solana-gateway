import styled from "@emotion/styled"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import fadeVariant from "../animations/fadeVariant"
import Button from "./Button"
import { A } from "./Text"
import TextBox from "./TextBox"

interface IField {
  label: string
  value: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

interface IBasicRowCard {
  title: string
  fields: IField[]
}

const BasicRowCard: React.FC<IBasicRowCard> = p => {
  return (
    <Box variants={fadeVariant} animate="visible" initial="hidden" exit="hidden">
      <Title>{p.title}</Title>
      {p.fields.map(field => (
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
      {p.children}
    </Box>
  )
}

const Row = styled.div({
  display: "flex"
})

const Entry = styled.p({
  margin: ".5rem 0",
  flexGrow: 1,
  fontSize: "1rem",
  fontWeight: 400,
  textOverflow: "ellipsis",
  overflow: "hidden",
  // whiteSpace: "nowrap",
  wordBreak: "break-all",
  flexBasis: "100%",
  color: "#7B7B7B"
})

const Title = styled.h1({
  fontSize: "1.5rem",
  color: "#575757",
  margin: ".5rem 0"
})

export const BasicWrapper = styled.div({
  flexGrow: 1,
  minWidth: "20rem",
})

const Box = styled(motion.div)({
  background: "#FFFFFF",
  borderRadius: ".75rem",
  minWidth: "20rem",
  padding: "1.7rem",
  flexGrow: 1,
  margin: "1.5rem 1.5rem 1.5rem 0",
  wordBreak: "break-all",
  textOverflow: "ellipsis",
  // overflow: "hidden",
  boxShadow: "0px 2px 4px rgba(138, 138, 138, 0.25)"
})

export const ButtonRight = styled.div({
  display: "flex",
  justifyContent: "flex-end"
})

export default BasicRowCard
