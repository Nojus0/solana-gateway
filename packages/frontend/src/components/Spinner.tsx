import { Component } from "solid-js";
import { styled } from "solid-styled-components";
import { ISize } from "../utils/interfaces";

const Spinner = styled("div")(({ size = "4rem" }: ISize) => ({
  "--border-width": ".35rem",
  height: size,
  width: size,
  borderRadius: "50%",
  "--mask":
    "radial-gradient(farthest-side, transparent calc(100% - var(--border-width) - 0.5px), #000 calc(100% - var(--border-width) + 0.5px));",
  "-webkit-mask": "var(--mask)",
  mask: "var(--mask)",
  background:
    "linear-gradient(to top, #b4b4b4, #b4b4b43d) 100% 0/50% 100% no-repeat, linear-gradient(#b4b4b43d 50%, transparent 95%) 0 0/50% 100% no-repeat",

  animation: "spin 1s linear infinite",

  "@keyframes spin": {
    "0%": {
      transform: "rotate(0deg)",
    },
    "100%": {
      transform: "rotate(360deg)",
    },
  },
}));

export default Spinner;
