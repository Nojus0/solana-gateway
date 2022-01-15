import styled from "@emotion/styled"
import { motion } from "framer-motion"
import { NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import React, { Component, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import fadeVariant from "../src/animations/fadeVariant"
import { ButtonRight } from "../src/components/BasicRowCard"
import Button from "../src/components/Button"
import Container from "../src/components/Container"
import { IMargin } from "../src/components/interfaces"
import ListHeader from "../src/components/ListHeader"
import NetworkCard from "../src/components/NetworkCard"
import { Underline } from "../src/components/NormalHeader"
import TextBox, { TextBoxLabel } from "../src/components/TextBox"
import {
  SubTitle,
  SubTitleWrapper,
  Wrapper
} from "../src/layout/dashboard/styled"
import useScrollBar from "../src/layout/dashboard/useScrollBar"
import { setFast, useRequireAuth } from "../src/redux/slices/authSlice"
import { selectAuth } from "../src/redux/store"
import LinkIcon from "../src/svg/LinkIcon"
import { $, GraphQLError } from "../src/zeus"
import { GqlInclude } from "../src/zeus/custom"
import { ErrorText } from "./login"

const PLACEHOLDER_KEY = "******************"

const Settings: NextPage = props => {
  useRequireAuth()
  useScrollBar()
  const user = useSelector(selectAuth)
  const [showAK, setAK] = useState(false)
  const [showSK, setSK] = useState(false)
  const [ak, setAk] = useState(PLACEHOLDER_KEY)
  const [sk, setSk] = useState(PLACEHOLDER_KEY)
  const [error, setError] = useState("")

  if (user.isLoading) return null

  async function newKeys() {
    try {
      setError("")
      const data = await GqlInclude("mutation")({
        keys: {
          apiKey: true,
          secretKey: true
        }
      })

      if (data.keys) {
        setAk(data.keys.apiKey)
        setSk(data.keys.secretKey)
      }
    } catch (err) {
      if (err instanceof GraphQLError && err.response?.errors) {
        setError(err.response.errors.map((e: any) => e.message).join("\n"))
      }

      if (err instanceof TypeError) {
        setError("Please check your internet connection")
      }
    }
  }

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
        <Container margin=".5rem" max="60rem" min="1px" value="100%">
          <Email>{user.data.email}</Email>
          <Underline margin="0 0 1rem 0" />
          <KeyBoxEmpty
            onNew={newKeys}
            network={user.data.network}
            accessKey={ak}
            secretKey={sk}
            error={error}
          />
          <SettingsCard />
        </Container>
      </Wrapper>
    </>
  )
}

interface IKeys {
  network: string
  accessKey: string
  secretKey: string
  onNew: () => void
  error?: string
}

const SettingsCard: React.FC = () => {
  const user = useSelector(selectAuth)
  const [error, setError] = useState("")
  const dispatch = useDispatch()
  const [fast, setOptionFast] = useState(user.data.isFast)

  async function submitFast() {
    if (user.data.isFast == fast) return
    try {
      setError("")

      const data = await GqlInclude("mutation")(
        {
          setFast: [
            {
              newFast: $`newFast`
            },
            true
          ]
        },
        {
          operationName: "setFast",
          variables: {
            newFast: fast
          }
        }
      )
      dispatch(setFast(fast))
    } catch (err) {
      if (err instanceof GraphQLError && err.response?.errors) {
        setError(err.response.errors.map((e: any) => e.message).join("\n"))
      }

      if (err instanceof TypeError) {
        setError("Please check your internet connection")
      }
    }
  }

  return (
    <KeysBox
      variants={fadeVariant}
      animate="visible"
      initial="hidden"
      exit="hidden"
      margin="1rem 0 15rem 0"
    >
      <KeyBoxInner>
        <HeaderText>Options</HeaderText>
      </KeyBoxInner>
      <Underline />
      <KeyBoxMain>
        <HeaderContainer>
          <TextBoxLabel margin="0 .5rem 0 0">resend confirmations</TextBoxLabel>
          <Link
            passHref
            href="https://docs.solanagateway.com/docs/Account/FastMode"
          >
            <a>
              <LinkHref width="1.25rem" />
            </a>
          </Link>
        </HeaderContainer>
        <ResendBox>
          <ResendOption
            onClick={() => setOptionFast(false)}
            margin="0 .5rem 0 0"
            selected={!fast}
          >
            Finalized
          </ResendOption>
          <ResendOption
            onClick={() => setOptionFast(true)}
            margin="0"
            selected={fast}
          >
            Confirmed
          </ResendOption>
        </ResendBox>
        <ButtonRight>
          <Button
            variant={user.data.isFast == fast ? "outline" : "normal"}
            fontSize="1rem"
            onClick={submitFast}
            padding={user.data.isFast == fast ? ".4rem 1rem" : ".55rem 1.15rem"}
            margin=".75rem 0"
          >
            Save
          </Button>
        </ButtonRight>
      </KeyBoxMain>
      <Underline />
    </KeysBox>
  )
}

const LinkHref = styled(LinkIcon)({
  cursor: "pointer"
})

const HeaderContainer = styled.div({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start"
})

interface IResendButton {
  selected: boolean
  margin?: string
}

const ResendOption = styled.button(
  ({ selected, margin = "0.5rem" }: IResendButton) => ({
    margin,
    cursor: "pointer",
    padding: ".65rem 1rem",
    borderRadius: "5rem",
    background: selected ? "black" : "transparent",
    border: ".15rem solid black",
    color: selected ? "white" : "black",
    outline: "none"
  })
)

const ResendBox = styled.div({
  margin: "1rem 0",
  display: "flex"
})

const KeyBoxEmpty: React.FC<IKeys> = p => {
  return (
    <KeysBox
      variants={fadeVariant}
      animate="visible"
      initial="hidden"
      exit="hidden"
    >
      <KeyBoxInner>
        <NetworkCard margin="0" network={p.network as any}>
          {p.network} net
        </NetworkCard>
      </KeyBoxInner>
      <Underline />
      <KeyBoxMain>
        <TextBoxLabel>Access Key</TextBoxLabel>
        <TextBox
          value={p.accessKey}
          padding=".6rem 1rem"
          disabled
          placeholder="Access key"
        />

        <TextBoxLabel>Secret Key</TextBoxLabel>
        <TextBox
          disabled
          value={p.secretKey}
          padding=".6rem 1rem"
          placeholder="Access key"
        />
        {p.accessKey != PLACEHOLDER_KEY && (
          <InfoText>
            Please save the access key and secret key in a safe place. You wont
            be able to view these keys again! Though you can generate a new one
            every 1 hour.
          </InfoText>
        )}
        {p.error && <ErrorText>{p.error}</ErrorText>}
        <ButtonRight>
          <Button
            variant="outline"
            fontSize="1rem"
            onClick={p.onNew}
            padding=".4rem 1rem"
            margin=".75rem 0"
          >
            New
          </Button>
        </ButtonRight>
      </KeyBoxMain>
    </KeysBox>
  )
}

const HeaderText = styled.h2({
  fontSize: "1.5rem",
  margin: ".35rem 0"
})

const InfoText = styled.p({
  fontSize: "1rem",
  fontWeight: 400,
  color: "red"
})

const KeyBoxInner = styled.div({
  padding: "1rem 1.5rem"
})

const KeyBoxMain = styled(KeyBoxInner)({
  display: "flex",
  flexDirection: "column"
})

const KeysBox = styled(motion.div)(
  ({ margin = "1rem 0 1.5rem 0" }: IMargin) => ({
    margin,
    borderRadius: "0.85rem",
    background: "white",
    boxShadow: "0px 2px 16px rgba(55, 55, 55, 0.25)"
  })
)

const Email = styled.h2({
  fontSize: "1.25rem",
  fontWeight: 400
})

export default Settings
