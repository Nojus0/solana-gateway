import styled from "@emotion/styled"
import { motion } from "framer-motion"
import { NextPage } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import React, { Component, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import fadeVariant from "../src/animations/fadeVariant"
import { ButtonRight } from "../src/components/BasicRowCard"
import Button from "../src/components/Button"
import Container from "../src/components/Container"
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
import { useRequireAuth } from "../src/redux/slices/authSlice"
import { selectAuth } from "../src/redux/store"
import { GraphQLError } from "../src/zeus"
import { GqlInclude } from "../src/zeus/custom"
import { ErrorText } from "./login"

const PLACEHOLDER_KEY = "******************"

const Settings: NextPage = props => {
  useRequireAuth()
  useScrollBar();
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
        <Container max="60rem" min="1px" value="100%">
          <Email>{user.data.email}</Email>
          <Underline />
          <KeyBoxEmpty
            onNew={newKeys}
            network={user.data.network}
            accessKey={ak}
            secretKey={sk}
            error={error}
          />
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

const KeyBoxEmpty: React.FC<IKeys> = p => {
  return (
    <KeysBox>
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
            Please keep save the access key and secret key in a safe place. You
            wont be able to view these keys again!
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

const KeysBox = styled.div({
  margin: "1rem 0 7.5rem 0",
  borderRadius: "0.85rem",
  background: "white",
  boxShadow: "0px 2px 16px rgba(55, 55, 55, 0.25)"
})

const Email = styled.h2({
  fontSize: "1.25rem",
  fontWeight: 400
})

export default Settings
