import styled from "@emotion/styled"
import { AnimatePresence, motion } from "framer-motion"
import { NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import defaultVariant from "../src/animations/defaultVariant"
import validator from "validator"
import { DEFAULT_NETWORK } from "shared/dist/default"
import Button from "../src/components/Button"
import { IMargin } from "../src/components/interfaces"
import TextBox, { TextBoxLabel } from "../src/components/TextBox"
import useMediaQuery from "../src/components/useMediaQuery"
import signUpThunk from "../src/redux/thunks/signUp"
import CheckMark from "../src/svg/CheckMark"
import Logo, { GatewayText } from "../src/svg/Logo"
import { selectAuth } from "../src/redux/store"
import { useRouter } from "next/router"
import { ErrorText } from "./login"
import loginThunk from "../src/redux/thunks/login"
import NetworkCard, { NetworkContainer } from "../src/components/NetworkCard"
import CheckBox from "../src/components/CheckBox"
import Mark from "../src/svg/Mark"
import fadeVariant from "../src/animations/fadeVariant"
const min = 65

const Signup: NextPage = props => {
  const isSmall = useMediaQuery(`(max-width: ${min}rem)`, false)

  return (
    <>
      <Head>
        <title>Solana Gateway - Signup</title>
      </Head>
      <Wrapper DoWrap={isSmall}>
        {isSmall ? <InteractSide /> : <FeatureSide />}
        {isSmall ? <FeatureSide /> : <InteractSide />}
      </Wrapper>
    </>
  )
}

const FeatureSide: React.FC = () => {
  const isSmall = useMediaQuery(`(max-width: ${min}rem)`, false)

  return (
    <GreySide
      width={isSmall ? "100vw" : "55vw"}
      height={isSmall ? "" : "100vh"}
    >
      <Features
        margin={isSmall ? "1rem 0 8rem 1.5rem" : "2rem 5rem"}
        animate="visible"
        initial="hidden"
        variants={defaultVariant}
      >
        {!isSmall && (
          <Link passHref href="/">
            <HeaderBox>
              <Logo width="2.5rem" height="2.5rem" />
              <GatewayText>Gateway</GatewayText>
            </HeaderBox>
          </Link>
        )}

        <Feature
          title="temporary addresses"
          description="accept payments by generating a temporary deposit address."
        />
        <Feature
          title="events"
          description="get notified in real time when you recieve a payment by using a webhook."
        />
        <Feature
          title="transaction explorer"
          description="browse your transactions and the data associated with them."
        />
      </Features>
    </GreySide>
  )
}

const InteractSide: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState({
    email: "",
    password: "",
    confirmPass: "",
    bottom: ""
  })
  const isSmall = useMediaQuery(`(max-width: ${min}rem)`, false)
  const [confirmPass, setConfirmPass] = useState("")
  const user = useSelector(selectAuth)
  const [network, setNet] = useState<"dev" | "main">("main")
  const dispatch = useDispatch()
  const router = useRouter()
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (user.isAuthenticated && !user.isLoading) {
      router.replace("/transfers", "/transfers")
    }
  }, [user])

  async function submitSignup() {
    setError({
      email: "",
      password: "",
      confirmPass: "",
      bottom: ""
    })

    if (!validator.isEmail(email))
      return setError(prev => ({ ...prev, email: "Invalid email" }))

    if (!validator.isLength(password, { min: 6 }))
      return setError(prev => ({
        ...prev,
        password: "Password is too weak. Must be at least 6 characters"
      }))

    if (password !== confirmPass)
      return setError(prev => ({
        ...prev,
        confirmPass: "Passwords do not match"
      }))

    if (!accepted) {
      return setError(prev => ({
        ...prev,
        bottom: "You must agree terms and conditions and privacy policy"
      }))
    }

    dispatch(
      signUpThunk({
        email,
        acceptedTerms: accepted,
        network,
        password,
        onError: msg => setError(prev => ({ ...prev, bottom: msg }))
      })
    )
  }

  return (
    <SideContainer
      width={isSmall ? "100%" : "auto"}
      animate="visible"
      initial="hidden"
      variants={defaultVariant}
    >
      <TitleText>Start accepting Solana payments.</TitleText>
      <TextBoxLabel>Email address</TextBoxLabel>
      <TextBox
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="email"
        variant={error.email ? "error" : "normal"}
      />
      {error.email && <ErrorText>{error.email}</ErrorText>}
      <TextBoxLabel>Password</TextBoxLabel>
      <TextBox
        placeholder="password"
        type="password"
        value={password}
        variant={error.password ? "error" : "normal"}
        onChange={e => setPassword(e.target.value)}
      />
      {error.password && <ErrorText>{error.password}</ErrorText>}

      <TextBoxLabel>Confirm password</TextBoxLabel>
      <TextBox
        placeholder="password"
        variant={error.confirmPass ? "error" : "normal"}
        type="password"
        value={confirmPass}
        onChange={e => setConfirmPass(e.target.value)}
      />
      {error.confirmPass && <ErrorText>{error.confirmPass}</ErrorText>}
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
      <TermsContainer>
        <CheckBox margin="0.25rem" onClick={() => setAccepted(prev => !prev)}>
          <AnimatePresence>
            {accepted && (
              <Mark
                variants={fadeVariant}
                animate="visible"
                initial="hidden"
                exit="hidden"
                width="1.15rem"
                height="1.15rem"
              />
            )}
          </AnimatePresence>
        </CheckBox>
        <TermsText>
          I agree to the terms and conditions and privacy policy
        </TermsText>
      </TermsContainer>
      {error.bottom && <ErrorText>{error.bottom}</ErrorText>}
      <Button onClick={submitSignup} variant="outline" margin="1rem 0">
        Sign Up
      </Button>
    </SideContainer>
  )
}

interface IFeature {
  title: string
  description: string
}

const Feature: React.FC<IFeature> = props => {
  return (
    <FeatureContainer>
      <CustomCheckMark width="2rem" height="2rem" />
      <FeatureSection>
        <FeatureTitle>{props.title}</FeatureTitle>
        <FeatureDescription>{props.description}</FeatureDescription>
      </FeatureSection>
    </FeatureContainer>
  )
}

const TermsContainer = styled.div({
  display: "flex",
  alignItems: "center",
  padding: ".75rem 0"
})

const TermsText = styled.p({
  fontSize: "1.05rem",
  lineHeight: "140%",
  fontWeight: 400,
  letterSpacing: "-0.01em",
  margin: "0 .5rem",
  color: "#000000"
})

const CustomCheckMark = styled(CheckMark)({
  minWidth: "2rem",
  minHeight: "2rem"
})

interface ISide {
  width?: string
}

const SideContainer = styled(motion.div)(({ width = "auto" }: ISide) => ({
  width,
  display: "flex",
  flexDirection: "column",
  padding: ".75rem 3.5rem",
  position: "relative",
  overflowY: "auto",
  "&::-webkit-scrollbar": {
    width: "15px",
    height: "15px",
    backgroundColor: "inherit",
    borderRadius: "10px"
  },
  "&::-webkit-scrollbar-corner": {
    backgroundColor: "#0000001a"
  },
  "&::-webkit-scrollbar-thumb": {
    borderRadius: "15px",
    backgroundColor: "#dcdcdc",
    backgroundClip: "content-box",
    border: "4px solid transparent"
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "white"
  }
}))

const TitleText = styled.h1({
  fontSize: "2.65rem",
  width: "90%",
  lineHeight: "100.5%"
})

interface IWrapperProps {
  DoWrap?: boolean
}

const Wrapper = styled.div(({ DoWrap = false }: IWrapperProps) => ({
  display: "flex",
  flexWrap: DoWrap ? "wrap" : "nowrap",
  height: "100%"
}))

const FeatureTitle = styled("h2")({
  fontSize: "2.25rem",
  color: "black",
  margin: "0.5rem 0"
})

const FeatureDescription = styled("p")({
  fontSize: "1rem",
  color: "black",
  fontWeight: 400,
  margin: 0
})

const FeatureSection = styled("div")({
  display: "flex",
  flexDirection: "column",
  margin: "0 .85rem"
})

const FeatureContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  margin: "2rem 0"
})

const HeaderBox = styled.a({
  display: "flex",
  textDecoration: "none",
  alignItems: "center",
  justifyContent: "center"
})

const Features = styled(motion.div)(({ margin = "2rem 5rem" }: IMargin) => ({
  margin
}))

interface IGreySide {
  width?: string
  height?: string
}

const GreySide = styled.div(
  ({ width = "55vw", height = "100%" }: IGreySide) => ({
    width,
    height,
    display: "flex",
    alignSelf: "flex-start",
    flexDirection: "column",
    background: "#F5F5F5",
    borderRight: "1px solid #D4D4D4"
  })
)

export default Signup
