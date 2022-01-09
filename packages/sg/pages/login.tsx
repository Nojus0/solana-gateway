import styled from "@emotion/styled"
import { NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import validator from "validator"
import { useState } from "react"
import defaultVariant from "../src/animations/defaultVariant"
import Button from "../src/components/Button"
import Container from "../src/components/Container"
import NormalHeader, { Underline } from "../src/components/NormalHeader"
import Seperator from "../src/components/Seperator"
import { A, Text } from "../src/components/Text"
import TextBox, { TextBoxLabel } from "../src/components/TextBox"
import { $, Gql, GraphQLError } from "../src/zeus"
import { useRouter } from "next/router"
import { useDispatch, useSelector } from "react-redux"
import loginThunk from "../src/redux/thunks/login"
import { useEffect } from "react"
import { selectAuth } from "../src/redux/store"
import { useRequireAuth } from "../src/redux/slices/authSlice"

const Login: NextPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string>("")
  const router = useRouter()
  const dispatch = useDispatch()
  const user = useSelector(selectAuth)
  useRequireAuth()

  useEffect(() => {
    if (user.isAuthenticated) {
      router.replace("/transfers", "/transfers")
    }
  }, [user.isAuthenticated])

  async function submitLogin() {
    if (!validator.isEmail(email)) return setError("Invalid email")
    if (!validator.isLength(password, { min: 6 }))
      return setError("Password must be at least 6 characters")

    dispatch(
      loginThunk({
        network: "dev",
        email,
        password,
        onError: msg => setError(msg)
      })
    )
  }

  if (user.isLoading) return null

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
            variant={error ? "error" : "normal"}
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email"
          />
          <TextBoxLabel>Password</TextBoxLabel>
          <TextBox
            variant={error ? "error" : "normal"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="password"
            type="password"
          />
          {error && <ErrorText>{error}</ErrorText>}

          <Button onClick={submitLogin} variant="outline" margin="1rem 0">
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

export const ErrorText = styled.p({
  color: "#DD0000",
  fontSize: ".85rem",
  margin: ".25rem 0"
})

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
