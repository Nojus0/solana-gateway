import { Component, JSX } from "solid-js";
import { styled } from "solid-styled-components";

const ClampContainer: Component<JSX.HTMLAttributes<HTMLDivElement> & IInner> = (
  props
) => {
  return (
    <Wrapper>
      <Inner {...props} />
    </Wrapper>
  );
};

export default ClampContainer;

interface IInner {
  min?: string;
  max?: string;
  horizontal?: string;
  vertical?: string;
  padding?: string;
}

const Inner = styled("div")(
  ({
    max = "40rem",
    min = "1px",
    horizontal = "center",
    vertical = "center",
    padding = "0",
  }: IInner) => ({
    width: `clamp(${min},100%,${max})`,
    display: "flex",
    flexDirection: "column",
    alignItems: horizontal,
    zIndex: 3,
    justifyContent: vertical,
    position: "relative",
    padding,
  })
);

const Wrapper = styled("div")({
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
});
