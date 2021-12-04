import { Component, Setter, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { styled } from "solid-styled-components";
import { Transition } from "solid-transition-group";
import fade from "../utils/fade";

interface IModalProps {
  when: boolean;
  setWhen: Setter<boolean>;
}

const Modal: Component<IModalProps> = (props) => {
  return (
    <Transition {...fade(250, "ease")}>
      <Show when={props.when}>
        <Blur>{props.children}</Blur>
      </Show>
    </Transition>
  );
};
const Blur = styled("div")({
  position: "absolute",
  width: "100vw",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  background: "rgba(0,0,0, .25)",
  zIndex: 10,
});

export default Modal;
