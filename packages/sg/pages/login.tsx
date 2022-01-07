import styled from "@emotion/styled"
import { motion } from "framer-motion"
import { NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import { useState } from "react"
import defaultVariant from "../src/animations/defaultVariant"
import Button from "../src/components/Button"
import Container from "../src/components/Container"
import ContinueGithub from "../src/components/ContinueGithub"
import NormalHeader, { Underline } from "../src/components/NormalHeader"
import Seperator from "../src/components/Seperator"
import { A, Text } from "../src/components/Text"
import TextBox, { TextBoxLabel } from "../src/components/TextBox"

const Login: NextPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <>
      <Head>
        <title>Login - Solana Gateway</title>
      </Head>
      <Container
        variants={defaultVariant}
        animate="visible"
        initial="hidden"
        margin="0 .75rem"
        max="60rem"
        min="1px"
        value="100%"
      >
        <NormalHeader />

        <Container max="35rem">
          <TextCustom margin="1rem 1rem .25rem 1rem">
            Log in to Solana Gateway
          </TextCustom>

          <TextBoxLabel>Email address</TextBoxLabel>
          <TextBox
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email"
          />

          <TextBoxLabel>Password</TextBoxLabel>
          <TextBox
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="password"
          />

          <Button variant="outline" margin="1rem 0">
            Sign In
          </Button>
          <Seperator margin="2rem 0 0 0" width="100%" />
          <Link href="/signup" passHref>
            <A>
              <DontAccount>Don’t have an account? Sign Up</DontAccount>
            </A>
          </Link>
        </Container>
      </Container>
    </>
  )
}

const TextCustom = styled(Text)({
  // width: "clamp(5rem, 100%, 30rem)",
  textAlign: "center",
  width: "100%"
})

const DontAccount = styled.p({
  fontSize: ".85rem",
  color: "#7A7A7A",
  cursor: "pointer",
  transition: "color 100ms ease-in-out",
  "&:hover": {
    color: "black"
  }
})

const Middle = styled.div({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center"
  // alignItems: "center"
})

export default Login
