import styled from "@emotion/styled"
import { NextPage } from "next"
import Head from "next/head"
import { useState } from "react"
import { useSelector } from "react-redux"
import Button from "../src/components/Button"
import Container from "../src/components/Container"
import ListHeader from "../src/components/ListHeader"
import { Underline } from "../src/components/NormalHeader"
import TextBox, { TextBoxLabel } from "../src/components/TextBox"
import {
  SubTitle,
  SubTitleWrapper,
  Wrapper
} from "../src/layout/dashboard/styled"
import { useRequireAuth } from "../src/redux/slices/authSlice"
import { selectAuth } from "../src/redux/store"

const Settings: NextPage = props => {
  useRequireAuth()
  const user = useSelector(selectAuth)
  const [showAK, setAK] = useState(false)
  const [showSK, setSK] = useState(false)

  if (user.isLoading) return null

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
                <FieldWrapper>
                  <CustomTextBox
                    type={showAK ? "text" : "password"}
                    value={user.data.apiKey}
                    placeholder="API Key"
                  />
                  <Button
                    margin=".5rem 1rem"
                    fontSize=".95rem"
                    padding=".7rem 1rem"
                    onClick={() => setAK(prev => !prev)}
                  >
                    {showAK ? "Hide" : "Show"}
                  </Button>
                </FieldWrapper>

                <TextBoxLabel>Your Secret Key</TextBoxLabel>
                <FieldWrapper>
                  <CustomTextBox
                    value={user.data.secretKey}
                    type={showSK ? "text" : "password"}
                    placeholder="Secret Key"
                  />
                  <Button
                    margin=".5rem 1rem"
                    fontSize=".95rem"
                    padding=".7rem 1rem"
                    onClick={() => setSK(prev => !prev)}
                  >
                    {showSK ? "Hide" : "Show"}
                  </Button>
                </FieldWrapper>
              </Box>
            </SettingsSection>
          </SectionWrapper>
        </Container>
      </Wrapper>
    </>
  )
}

const CustomTextBox = styled(TextBox)({
  display: "flex",
  flexGrow: 1
})

const FieldWrapper = styled.div({
  display: "flex",
  alignItems: "center"
})

const BoxHeader = styled.h2({
  fontSize: "1.5rem",
  margin: "0 0 1rem 0",
  fontWeight: 500
})

const Box = styled.div({
  display: "flex",
  flexDirection: "column",
  padding: "1.5rem",
  borderRadius: ".5rem",
  border: ".1rem solid black"
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
