import styled from "@emotion/styled"
import Button from "../../components/Button"

export const Wrapper = styled.div({
  minHeight: "100%",
  background: "#F5F5F5",
})

export const AddButton = styled(Button)({
  alignSelf: "flex-end"
})

export const SubTitleWrapper = styled.div({
  display: "flex",
  padding: ".75rem",
  width: "clamp(1px, 100%, 60rem)",
  alignItems: "flex-start"
})

export const SubTitle = styled.h2({
  margin: ".5rem 0",
  flexGrow: 1,
  fontWeight: 500,
  fontSize: "2rem",
  textAlign: "start"
})
