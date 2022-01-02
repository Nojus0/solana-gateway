import styled from "@emotion/styled";

interface ISeperatorProps {
  margin?: string;
  width?: string;
  color?: string;
  height?: string;
}

const Seperator = styled.div(
  ({
    margin = "1rem 0",
    width = "100%",
    color = "#F1F1F1",
    height = ".1rem",
  }: ISeperatorProps) => ({
    margin,
    width,
    background: color,
    height,
    minHeight: height,
  })
);

export default Seperator;
