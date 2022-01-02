import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { NextPage } from "next";
import Head from "next/head";
import defaultVariant from "../src/animations/defaultVariant";
import Container from "../src/components/Container";
import ContinueGithub from "../src/components/ContinueGithub";
import { IMargin } from "../src/components/interfaces";
import NormalHeader from "../src/components/NormalHeader";
import { Text } from "../src/components/Text";
import useMediaQuery from "../src/components/useMediaQuery";
import CheckMark from "../src/svg/CheckMark";
import GithubLogo from "../src/svg/GithubLogo";
import Logo, { GatewayText } from "../src/svg/Logo";

const Signup: NextPage = (props) => {
  const isSmall = useMediaQuery("(max-width: 45rem)", false);
  console.log(isSmall);
  return (
    <>
      <Head>
        <title>Signup - Solana Gateway</title>
      </Head>
      <Wrapper DoWrap={isSmall}>
        {isSmall ? <InteractSide /> : <FeatureSide />}
        {isSmall ? <FeatureSide /> : <InteractSide />}
      </Wrapper>
    </>
  );
};

const FeatureSide: React.FC = () => {
  const isSmall = useMediaQuery("(max-width: 45rem)", false);

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
          <HeaderBox>
            <Logo width="2.5rem" height="2.5rem" />
            <GatewayText>Gateway</GatewayText>
          </HeaderBox>
        )}

        <Feature
          title="Temporary Addresses"
          description="Accept payments by generating a deposit address."
        />
        <Feature
          title="Recieve Events"
          description="Get notified when you recieve a payment by using a webhook."
        />
        <Feature
          title="Browse Transactions"
          description="Browse your transactions and the data associated with them."
        />
      </Features>
    </GreySide>
  );
};

const InteractSide: React.FC = () => {
  return (
    <SideContainer animate="visible" initial="hidden" variants={defaultVariant}>
      <TitleText>Start accepting Solana payments.</TitleText>
      <ContinueGithub />
      <TermsText>
        By clicking continue, you agree to our Terms of Service and Privacy
        Policy.
      </TermsText>
    </SideContainer>
  );
};

interface IFeature {
  title: string;
  description: string;
}

const Feature: React.FC<IFeature> = (props) => {
  return (
    <FeatureContainer>
      <CustomCheckMark width="2rem" height="2rem" />
      <FeatureSection>
        <FeatureTitle>{props.title}</FeatureTitle>
        <FeatureDescription>{props.description}</FeatureDescription>
      </FeatureSection>
    </FeatureContainer>
  );
};

const CustomCheckMark = styled(CheckMark)({
  minWidth: "2rem",
  minHeight: "2rem",
});

const TermsText = styled.p({
  fontSize: ".95rem",
  margin: "2.5rem 0",
  fontWeight: 400,
  color: "#7A7A7A",
});

const SideContainer = styled(motion.div)({
  display: "flex",
  flexDirection: "column",
  margin: "3rem 3.5rem",
});

const TitleText = styled.h1({
  fontSize: "2.65rem",
  width: "90%",
  lineHeight: "100.5%",
});

interface IWrapperProps {
  DoWrap?: boolean;
}

const Wrapper = styled.div(({ DoWrap = false }: IWrapperProps) => ({
  display: "flex",
  flexWrap: DoWrap ? "wrap" : "nowrap",
}));

const FeatureTitle = styled("h2")({
  fontSize: "2.25rem",
  color: "black",
  margin: "0.5rem 0",
});

const FeatureDescription = styled("p")({
  fontSize: "1rem",
  color: "#7A7A7A",
  fontWeight: 400,
  margin: 0,
});

const FeatureSection = styled("div")({
  display: "flex",
  flexDirection: "column",
  margin: "0 .85rem",
});

const FeatureContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  margin: "2rem 0",
});

const HeaderBox = styled.div({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const Features = styled(motion.div)(({ margin = "2rem 5rem" }: IMargin) => ({
  margin,
}));

interface IGreySide {
  width?: string;
  height?: string;
}

const GreySide = styled.div(
  ({ width = "55vw", height = "100vh" }: IGreySide) => ({
    width,
    height,
    display: "flex",
    alignSelf: "flex-start",
    flexDirection: "column",
    background: "#F5F5F5",
    borderRight: "1px solid #D4D4D4",
  })
);

export default Signup;
