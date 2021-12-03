import { Component, Setter, Show } from "solid-js";
import { styled } from "solid-styled-components";
import { Transition } from "solid-transition-group";
import fade from "../utils/fade";

interface ICheckbox extends IVariant {
  checked: boolean;
  setCheck: Setter<boolean>;
}

const Checkbox: Component<ICheckbox> = (props) => {
  return (
    <Box
      variant={props.variant}
      size="2rem"
      onClick={() => props.setCheck((prev) => !prev)}
    >
      <Transition {...fade(200, "ease")}>
        <Show when={props.checked}>
          <Mark size="1.25rem" />
        </Show>
      </Transition>
    </Box>
  );
};

interface ISize {
  size?: string;
}

const Mark = styled("div")(({ size = "1rem" }: ISize) => ({
  background: "#363636",
  borderRadius: "50rem",
  minWidth: size,
  minHeight: size,
}));

interface IVariant {
  variant?: "normal" | "error";
}

const Box = styled("div")(({ size, variant = "normal" }: ISize & IVariant) => ({
  background: variant == "normal" ? "#252525" : "#4D1414",
  borderRadius: "50rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  minWidth: size,
  minHeight: size,
  maxWidth: size,
  maxHeight: size,
}));

export default Checkbox;
