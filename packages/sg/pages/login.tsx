import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import defaultVariant from "../src/animations/defaultVariant";
import Container from "../src/components/Container";
import ContinueGithub from "../src/components/ContinueGithub";
import NormalHeader, { Underline } from "../src/components/NormalHeader";
import Seperator from "../src/components/Seperator";
import { A, Text } from "../src/components/Text";

const Login: NextPage = () => {
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

        <Middle>
          <TextCustom margin="3rem 1rem 2rem 1rem">
            Log in to Solana Gateway
          </TextCustom>
          <Link href="/transfers" passHref>
            <A>
              <ContinueGithub />
            </A>
          </Link>
          <Seperator width="50%" />
          <Link href="/signup" passHref>
            <A>
              <DontAccount>Don’t have an account? Sign Up</DontAccount>
            </A>
          </Link>
        </Middle>
      </Container>
    </>
  );
};

const TextCustom = styled(Text)({
  width: "clamp(5rem, 100%, 30rem)",
});

const DontAccount = styled.p({
  fontSize: ".85rem",
  color: "#7A7A7A",
  cursor: "pointer",
  transition: "color 100ms ease-in-out",
  "&:hover": {
    color: "black",
  },
});

const Middle = styled.div({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
});

export default Login;
