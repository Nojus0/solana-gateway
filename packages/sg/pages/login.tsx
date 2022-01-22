import styled from "@emotion/styled"
import { NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import validator from "validator"
import { useEffect, useState } from "react"
import defaultVariant from "../src/animations/defaultVariant"
import Button from "../src/components/Button"
import Container from "../src/components/Container"
import NormalHeader, { Underline } from "../src/components/NormalHeader"
import Seperator from "../src/components/Seperator"
import { A, Text } from "../src/components/Text"
import TextBox, { TextBoxLabel } from "../src/components/TextBox"
import { useFetchCurrent, useRequireAuth } from "../src/redux/slices/authSlice"
import NetworkCard, { NetworkContainer } from "../src/components/NetworkCard"
import loginThunk from "../src/redux/thunks/login"
import { useDispatch, useSelector } from "react-redux"
import { selectAuth } from "../src/redux/store"
import { useRouter } from "next/router"

interface QueryState {
  initial: string
  path: string
}

export function useQueryState({ initial, path }: QueryState) {
  const router = useRouter()
  const state = useState<string>()
  const [get, set] = state

  useEffect(() => {
    if (!router.isReady) return

    set(
      !router.query[path] ? (initial as string) : (router.query[path] as string)
    )
  }, [router.isReady])

  useEffect(() => {
    if (!router.isReady || !get) return

    router.query[path] = get
    router.replace({ query: router.query })
  }, [get, router.isReady])

  return state
}
const Login: NextPage = () => {
  useFetchCurrent()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string>("")
  const router = useRouter()
  const dispatch = useDispatch()
  const user = useSelector(selectAuth)
  const [network, setNet] = useQueryState({ initial: "main", path: "network" })

  useEffect(() => {
    if (user.isAuthenticated) {
      router.replace("/transfers", "/transfers")
    }
  }, [user.isAuthenticated])
  useEffect(() => {
    if (router.query.network != "dev" && router.query.network != "main") return

    setNet(router.query.network)
  }, [router.query.network])

  async function submitLogin() {
    if (!validator.isEmail(email)) return setError("Invalid email")
    if (!validator.isLength(password, { min: 6 }))
      return setError("Password must be at least 6 characters")

    if (network != "main" && network != "dev")
      return setError("Invalid network")

    dispatch(
      loginThunk({
        network,
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
          <TextCustom>Solana Gateway - Login</TextCustom>

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
          <TextBoxLabel>Network</TextBoxLabel>
          <NetworkContainer>
            <NetworkCard
              selected={network != "main"}
              margin="0 .5rem 0 0"
              network="main"
              onClick={() => setNet("main")}
            >
              Main net
            </NetworkCard>
            <NetworkCard
              onClick={() => setNet("dev")}
              selected={network != "dev"}
              network="dev"
            >
              Dev net
            </NetworkCard>
          </NetworkContainer>
          {error && <ErrorText>{error}</ErrorText>}
          <Button onClick={submitLogin} variant="outline" margin="1rem 0">
            Sign In
          </Button>
          <Seperator margin=".75rem 0 0 0" width="100%" />
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
  fontSize: "1.05rem",
  margin: ".25rem 0"
})

const TextCustom = styled(Text)({
  // width: "clamp(5rem, 100%, 30rem)",
  textAlign: "center",
  width: "100%"
})

const DontAccount = styled.p({
  fontSize: "1.05rem",
  color: "#414141",
  fontWeight: 400,
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
