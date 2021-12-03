import { Link } from "solid-app-router";
import { Component, lazy } from "solid-js";
import { styled } from "solid-styled-components";
import Background from "../components/Background";
import { Button } from "../components/Button";
import ClampContainer from "../components/ClampContainer";

const HeadText = styled("h1")({
  fontWeight: 600,
  fontSize: "clamp(3rem, 2.5vw + 3rem ,5rem)",
  lineHeight: "102.5%",
  textAlign: "center",
  letterSpacing: "-0.025em",
  color: "#FFFFFF",
  margin: 0,
  textShadow:
    "0px 4px 0px rgba(0, 0, 0, 0.4), 0px 4px 0px #8F8F8F, 0px 4.8px 0px #000000",
});

const Home: Component = () => {
  return (
    <>
      <ClampContainer max="50rem" horizontal="center" vertical="center">
        <MainContainer>
          <HeadText>Solana Gateway</HeadText>
          <DescriptionText>
            Integrate solana into your project with ease
          </DescriptionText>
          <ButtonContainer>
            <Link href="/register">
              <Button variant="solid">Register</Button>
            </Link>
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </ButtonContainer>
        </MainContainer>
      </ClampContainer>
      <Background />
    </>
  );
};

const ButtonContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  justifyContent: "center",
});

const MainContainer = styled("div")({
  display: "flex",
  zIndex: 3,
  flexDirection: "column",
  transform: "translate(0, -5.5rem)",
});

const DescriptionText = styled("p")({
  fontWeight: 500,
  fontSize: "clamp(.85rem, .85 + 2.5vw,1.15rem)",
  lineHeight: "102.5%",
  margin: "2rem 1rem",
  textAlign: "center",
  letterSpacing: "-0.01em",
  color: "#DFDFDF",
});

export default Home;
