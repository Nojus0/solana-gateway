import { Link, useNavigate } from "solid-app-router";
import { Component, createSignal, For } from "solid-js";
import { createStore } from "solid-js/store";
import { styled } from "solid-styled-components";
import Background from "../components/Background";
import {
  BottomWrapper,
  Box,
  ClampedCustom,
  email_regex,
  ErrorText,
  FlexBox,
  MainText,
  RememberText,
  RightButton,
} from "../components/Both";
import { Button } from "../components/Button";
import Checkbox from "../components/Checkbox";
import ClampContainer from "../components/ClampContainer";
import Spinner from "../components/Spinner";
import TextBox from "../components/TextBox";
import { auth, useAuth } from "../utils/auth";
import { IGQLError } from "../utils/interfaces";

const [valid, setValid] = createStore({
  email: true,
  password: true,
});

const Login: Component = () => {
  useAuth("/transactions");
  const [remember, setRemember] = createSignal(true);
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [pass, setPass] = createSignal("");
  const [errors, setErrors] = createSignal<IGQLError[]>([]);

  async function login(e: MouseEvent) {
    const { errors } = await auth.login(email(), pass(), remember());
    setValid("email", email_regex.test(email()));
    setValid("password", pass().length > 3);

    if (!valid.email || !valid.password) return;

    if (errors) {
      return setErrors(errors);
    }

    if (auth.loggedIn) {
      navigate("/transactions");
    }
  }

  return (
    <>
      <ClampedCustom>
        <Box>
          <MainText>Welcome to Solana Gateway</MainText>
          <TextBox
            label="Email address"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            placeholder="Email"
            variant={valid.email ? "normal" : "error"}
          />
          <TextBox
            label="Password"
            value={pass()}
            variant={valid.password ? "normal" : "error"}
            type="password"
            onInput={(e) => setPass(e.currentTarget.value)}
            placeholder="Password"
          />
          <For each={errors()}>
            {(err) => <ErrorText>{err.message}</ErrorText>}
          </For>
          <BottomWrapper>
            <FlexBox>
              <Checkbox checked={remember()} setCheck={setRemember} />
              <RememberText onClick={() => setRemember((p) => !p)}>
                Remember me
              </RememberText>
            </FlexBox>
            <Button onClick={login}>Login</Button>
          </BottomWrapper>
        </Box>
      </ClampedCustom>
      <Link href="https://docs.solanagateway.com">
        <RightButton>Docs</RightButton>
      </Link>
    </>
  );
};

export default Login;
