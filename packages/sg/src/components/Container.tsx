import styled from "@emotion/styled";
import { HTMLMotionProps, motion } from "framer-motion";

interface IContainerProps extends HTMLMotionProps<"div"> {
  min?: string;
  max?: string;
  value?: string;
  margin?: string;
  direction?: "row" | "column";
}

const Container: React.FC<IContainerProps> = (props) => {
  return (
    <Wrapper>
      <Inner {...props}></Inner>
    </Wrapper>
  );
};
const Inner = styled(motion.div)(
  ({
    max = "60rem",
    value = "100%",
    min = "1px",
    margin = "0 .75rem",
    direction = "column",
  }: IContainerProps) => ({
    margin,
    display: "flex",
    flexDirection: direction,
    width: `clamp(${min}, ${max}, ${value})`,
    justifyContent: "center",
  })
);

const Wrapper = styled.div({
  width: "100%",
  display: "flex",
  justifyContent: "center",
});

export default Container;
