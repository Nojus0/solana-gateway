import styled from "@emotion/styled";

interface IText {
  fontSize?: string;
  margin?: string;
}

export const Text = styled.h1(
  ({ fontSize = "3.25rem", margin = ".85rem 0" }: IText) => ({
    fontSize,
    margin,
    letterSpacing: "-0.01em",
    lineHeight: "100.5%",
    width: "80%",
    textAlign: "center",
  })
);

export const A = styled.a({
  textDecoration: "none",
});
