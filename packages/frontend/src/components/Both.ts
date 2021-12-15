import { styled } from "solid-styled-components";
import { Button } from "./Button";
import ClampContainer from "./ClampContainer";

export const RightButton = styled(Button)({
  position: "absolute",
  top: ".5rem",
  right: ".5rem",
  zIndex: 3,
  "@media (max-width: 50rem)": {
    display: "none",
  },
});
export const email_regex = /^\S+@\S+\.\S+$/;

export const FlexBox = styled("div")({
  display: "flex",
  alignItems: "center",
});

export const RememberText = styled("h4")({
  fontWeight: 500,
  userSelect: "none",
  fontSize: "1rem",
  lineHeight: "93.5%",
  letterSpacing: "-0.015em",
  color: "#DFDFDF",
  cursor: "pointer",
  margin: "0 .65rem",
});

export const ClampedCustom = styled(ClampContainer)({
  height: "100%",
});


export const ErrorText = styled("h4")({
  fontWeight: 500,
  userSelect: "none",
  fontSize: "1rem",
  lineHeight: "93.5%",
  letterSpacing: "-0.015em",
  color: "#FF4D00",
  margin: ".35rem 0",
});

export const BottomWrapper = styled("div")({
  display: "flex",
  flexDirection: "column",
  button: {
    alignSelf: "flex-end",
  },
});

export const MainText = styled("h1")({
  fontWeight: 500,
  fontSize: "2rem",
  lineHeight: "93.5%",
  letterSpacing: "-0.015em",
  width: "50%",
  color: "#FFFFFF",
});

export const Box = styled("div")({
  width: "100%",
  borderRadius: "2rem",
  height: "auto",
  overflowY: "auto",
  padding: "1.5rem 2.5rem",
  display: "flex",
  flexDirection: "column",
  background: "rgba(48,48,48,.25)",
});
