import styled from "@emotion/styled"
import { motion } from "framer-motion"
import type { NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import defaultVariant from "../src/animations/defaultVariant"
import Button, { TextButton } from "../src/components/Button"
import Container from "../src/components/Container"
import NormalHeader, { Underline } from "../src/components/NormalHeader"
import { Text } from "../src/components/Text"
import useMediaQuery from "../src/components/useMediaQuery"
import Arrow from "../src/svg/Arrow"
import CheckMark from "../src/svg/CheckMark"
import Logo, { GatewayText } from "../src/svg/Logo"

const Home: NextPage = () => {
  return (
    <motion.div initial="hidden" variants={defaultVariant} animate="visible">
      <Head>
        <title>Solana Gateway - Home</title>
        <meta
          name="description"
          content="Solana Gateway start accepting solana today. Solana Gateway lets you accept solana payments easily, explore all your recieved transactions in the transaction explorer, and get notified when you recieve a new one. Sign up or Login."
        />
      </Head>
      <Container margin="0 .75rem" max="60rem" min="1px" value="100%">
        <NormalHeader />
        <MainView>
          <Text>Start accepting solana payments.</Text>
          <TransferCardContainer>
            <TransferCard>
              Transfer
              <CustomArrow />
              <YouText>Notify</YouText>
            </TransferCard>
            <TransferCard variant="grey">Transfer</TransferCard>
          </TransferCardContainer>
          <ButtonContainer>
            <Link passHref href="/signup">
              <a>
                <Button fontSize="1.15rem" margin=".25rem .5rem">
                  Get Started
                </Button>
              </a>
            </Link>
            <Link passHref href="https://docs.solanagateway.com">
              <a>
                <Button
                  margin=".25rem .5rem"
                  padding=".7rem 2.5rem"
                  variant="outline"
                >
                  Docs
                </Button>
              </a>
            </Link>
          </ButtonContainer>
        </MainView>
        <Underline />
        <SectionHeader>Solana Gateway Features</SectionHeader>
        <Underline />
        <AboutContainer>
          <Section>
            <SectionHead>
              <Header>Events</Header>
              <Marker />
            </SectionHead>
            <Paragraph>
              Get notified in real time when you recieve a payment to one of
              your temporary addresses.
            </Paragraph>
          </Section>
          <Underline />

          <Section>
            <SectionHead>
              <Header>Transfer Explorer</Header>
              <Marker />
            </SectionHead>
            <Paragraph>
              View your transfers in the transfer explorer, and see all the data
              associated with a transfer.
            </Paragraph>
          </Section>
          <Underline />

          <Section>
            <SectionHead>
              <Header>Scalable</Header>
              <Marker />
            </SectionHead>
            <Paragraph>
              Low downtime, low latency, and highly scalable.
            </Paragraph>
          </Section>
          <Underline />
        </AboutContainer>
      </Container>
    </motion.div>
  )
}

const Marker = styled(CheckMark)({
  margin: "0 1rem"
})

const AboutContainer = styled.div({
  display: "flex",
  alignItems: "flex-start",
  flexWrap: "wrap",
  margin: "0 0 10rem 0",
  "&media (max-width: 40rem)": {
    flexDirection: "column"
  }
})
const SectionHead = styled.div({
  display: "flex",
  alignItems: "center"
})

const Paragraph = styled.p({
  fontSize: "1.25rem",
  fontWeight: 400,
  lineHeight: "150%",
  letterSpacing: "-0.01em"
})
const Section = styled.div({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: "3.5rem 0"
})

const SectionHeader = styled.h2({
  fontSize: "2.5rem",
  fontWeight: 500,
  argin: "0rem 0 7.5rem 0",
  textAlign: "center"
})

const Header = styled.h2({
  fontSize: "2.5rem",
  fontWeight: 500,
  margin: 0
})

const CustomArrow = styled(Arrow)({
  position: "absolute",
  top: "120%"
})

const YouText = styled.p({
  fontSize: "1rem",
  userSelect: "none",
  position: "absolute",
  top: "190%"
})

const TransferCardContainer = styled.div({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap"
})

interface ITransferCardProps {
  variant?: "green" | "grey"
}

const TransferCard = styled.div(
  ({ variant = "green" }: ITransferCardProps) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50rem",
    position: "relative",
    padding: "1.5rem 5rem",
    userSelect: "none",
    background: variant == "green" ? "#C3FFC9" : "#F4F4F4",
    fontSize: "1rem",
    color: "#323232",
    margin: "4rem .75rem"
  })
)

const ButtonContainer = styled.div({
  display: "flex",
  margin: "4rem 0",
  padding: "0 0 5rem 0",
  flexWrap: "wrap"
})

const MainView = styled.div({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center"
})

export default Home
