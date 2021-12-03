import { styled } from "solid-styled-components";

interface IButton {
  minWidth?: string;
  margin?: string;
  padding?: string;
  variant?: "outline" | "solid";
}

export const Button = styled("button")(
  ({
    padding = "1rem",
    margin = ".5rem",
    minWidth = "8rem",
    variant = "outline",
  }: IButton) => ({
    padding,
    margin,
    minWidth,
    borderRadius: "50rem",
    border: variant == "outline" ? ".15rem solid white" : "none",
    background: variant == "outline" ? "transparent" : "#1B1B1B",
    outline: "none",
    fontWeight: 500,
    cursor: "pointer",
    color: "white",
    fontSize: "1rem",
    lineHeight: "102.5%",
    letterSpacing: "-0.025em",
  })
);
