import { Component, Show } from "solid-js";
import { styled } from "solid-styled-components";
import { JSX } from "solid-js";
import { Button } from "./Button";

interface IMargin {
  margin?: string;
}

const TextBox: Component<
  ITextbox & IMargin & JSX.InputHTMLAttributes<HTMLInputElement>
> = ({ margin = "1.25rem 0", ...props }) => {
  return (
    <BoxWrapper margin={margin}>
      <Label>{props.label}</Label>
      <InputWrap>
        <TextBoxStyled {...props}></TextBoxStyled>
      </InputWrap>
    </BoxWrapper>
  );
};

const InputWrap = styled("div")({
  position: "relative",
  width: "100%",
});

const BoxWrapper = styled("div")(({ margin }: IMargin) => ({
  margin,
  display: "flex",
  position: "relative",
}));

const Label = styled("p")({
  fontWeight: 500,
  fontSize: ".85rem",
  position: "absolute",
  top: "-2.15rem",
  width: "100%",
  userSelect: "none",
  left: ".40rem",
  lineHeight: "93.5%",
  letterSpacing: "-0.015em",
  color: "#FFFFFF",
});

interface ITextbox {
  variant?: "normal" | "error";
  label: string;
}

const TextBoxStyled = styled("input")(({ variant = "normal" }: ITextbox) => ({
  background: variant == "normal" ? "#252525" : "#4D1414",
  borderRadius: ".85rem",
  fontWeight: 500,
  width: "100%",
  fontSize: "1rem",
  padding: "1.25rem",
  lineHeight: "93.5%",
  border: "none",
  outline: "none",
  letterSpacing: "-0.015em",
  color: "#DFDFDF",
}));

export default TextBox;
