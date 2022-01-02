import styled from "@emotion/styled"
import { NextPage } from "next"
import Head from "next/head"
import Container from "../src/components/Container"
import ListHeader from "../src/components/ListHeader"
import { Underline } from "../src/components/NormalHeader"
import TextBox, { TextBoxLabel } from "../src/components/TextBox"
import {
  SubTitle,
  SubTitleWrapper,
  Wrapper
} from "../src/layout/dashboard/styled"

const Settings: NextPage = props => {
  return (
    <>
      <Head>
        <title>Transfers - Solana Gateway</title>
      </Head>

      <Wrapper>
        <ListHeader selectedRoute="settings">
          <SubTitleWrapper>
            <SubTitle>Settings</SubTitle>
          </SubTitleWrapper>
          <Underline />
        </ListHeader>
        <Container max="60rem" min="1px" value="100%">
          {/* <h1>settings</h1> */}
          <SectionWrapper>
            <SideBar>
              <Section>Account</Section>
            </SideBar>
            <SettingsSection>
              <Box>
                <BoxHeader>Your Credentials</BoxHeader>
                <Underline />
                <TextBoxLabel>Your Access Key</TextBoxLabel>
                <TextBox placeholder="API Key"/>
                <TextBoxLabel>Your Secret Key</TextBoxLabel>
                <TextBox placeholder="Secret Key"/>
              </Box>
            </SettingsSection>
          </SectionWrapper>
        </Container>
      </Wrapper>
    </>
  )
}

const BoxHeader = styled.h2({
  fontSize: "1.5rem",
  fontWeight: 500
})

const Box = styled.div({
  display: "flex",
  flexDirection: "column",
  padding: "1.5rem",
  borderRadius: ".5rem",
  border: ".1rem solid #D4D4D4"
})

const Section = styled.p({
  margin: "1rem 0",
  fontSize: "1rem",
  fontWeight: 500
})

const SideBar = styled.div({
  display: "flex",
  flexGrow: 1,
  flexDirection: "column"
})

const SettingsSection = styled.div({
  display: "flex",
  margin: "1rem 0 0 8rem",
  flexBasis: "100%",
  flexDirection: "column"
})

const SectionWrapper = styled.div({
  display: "flex"
})

export default Settings
