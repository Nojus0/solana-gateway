import styled from "@emotion/styled";
import { motion } from "framer-motion";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import defaultVariant from "../src/animations/defaultVariant";
import Button, { TextButton } from "../src/components/Button";
import Container from "../src/components/Container";
import NormalHeader from "../src/components/NormalHeader";
import { Text } from "../src/components/Text";
import useMediaQuery from "../src/components/useMediaQuery";
import Arrow from "../src/svg/Arrow";
import Logo, { GatewayText } from "../src/svg/Logo";

const Home: NextPage = () => {
  return (
    <motion.div initial="hidden" variants={defaultVariant} animate="visible">
      <Head>
        <title>Home - Solana Gateway</title>
      </Head>
      <Container margin="0 .75rem" max="60rem" min="1px" value="100%">
        <NormalHeader />
        <MainView>
          <Text>Start accepting solana payments.</Text>
          <TransferCardContainer>
            <TransferCard>
              Transfer
              <CustomArrow />
              <YouText>You</YouText>
            </TransferCard>
            <TransferCard variant="grey">Transfer</TransferCard>
          </TransferCardContainer>
          <ButtonContainer>
            <Link passHref href="/signup">
              <a>
                <Button fontSize="1.15rem" margin=".25rem .5rem">Get Started</Button>
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
      </Container>
    </motion.div>
  );
};

const CustomArrow = styled(Arrow)({
  position: "absolute",
  top: "120%",
});

const YouText = styled.p({
  fontSize: "1rem",
  userSelect: "none",
  position: "absolute",
  top: "190%",
});

const TransferCardContainer = styled.div({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
});

interface ITransferCardProps {
  variant?: "green" | "grey";
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
    margin: "4rem .75rem",
  })
);

const ButtonContainer = styled.div({
  display: "flex",
  margin: "4rem 0",
  padding: "0 0 5rem 0",
  flexWrap: "wrap",
});

const MainView = styled.div({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
});

export default Home;
