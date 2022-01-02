import styled from "@emotion/styled"
import Link from "next/link"
import Button from "./Button"
import { A } from "./Text"

interface IField {
  label: string
  value: string
}

interface IBasicRowCard {
  title: string
  fields: IField[]
}

const BasicRowCard: React.FC<IBasicRowCard> = p => {
  return (
    <Box>
      <Title>{p.title}</Title>
      {p.fields.map(field => (
        <Row key={field.label}>
          <Entry>{field.label}</Entry>
          <Entry>{field.value}</Entry>
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
  whiteSpace: "nowrap",
  wordBreak: "break-all",
  flexBasis: "100%",
  color: "#7B7B7B"
})

const Title = styled.h1({
  fontSize: "1.5rem",
  color: "#575757",
  margin: ".5rem 0"
})

const Box = styled.div({
  background: "#FFFFFF",
  borderRadius: ".75rem",
  minWidth: "20rem",
  // maxWidth: "20rem",
  padding: "1.7rem",
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
