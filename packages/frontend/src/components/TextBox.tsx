import { styled } from "solid-styled-components";

interface ITextbox {
  margin?: string;
  variant?: "normal" | "error";
}

const TextBox = styled("input")(
  ({ margin = ".75rem 0", variant = "normal" }: ITextbox) => ({
    margin,
    background: variant == "normal" ? "#252525" : "#4D1414",
    borderRadius: ".85rem",
    fontWeight: 500,
    fontSize: "1rem",
    padding: "1.25rem",
    lineHeight: "93.5%",
    border: "none",
    outline: "none",
    letterSpacing: "-0.015em",
    color: "#DFDFDF",
  })
);

export default TextBox;
