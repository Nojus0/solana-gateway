import styled from "@emotion/styled";

interface IButtonProps {
  margin?: string;
  padding?: string;
  variant?: "normal" | "outline";
  fontSize?: string;
}

const Button = styled.button(
  ({
    padding = "0.75rem 1.25rem",
    margin = "0.25rem",
    variant = "normal",
    fontSize = "1.05rem",
  }: IButtonProps) => ({
    padding,
    margin,
    fontSize,
    userSelect: "none",
    fontWeight: 400,
    borderRadius: ".35rem",
    background: variant == "normal" ? "black" : "white",
    border: variant == "outline" ? ".1rem solid black" : "none",
    cursor: "pointer",
    color: variant == "normal" ? "white" : "black",
    letterSpacing: "-0.01em",
  })
);

export default Button;

export const TextButton = styled.p({
  margin: "0 1.85rem",
  cursor: "pointer",
  color: "#575757",
});
