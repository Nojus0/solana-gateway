import { useNavigate } from "solid-app-router";
import { Component, createSignal } from "solid-js";
import { styled } from "solid-styled-components";
import Background from "../components/Background";
import {
  BottomWrapper,
  Box,
  ClampedCustom,
  FlexBox,
  MainText,
  RememberText,
  RightButton,
} from "../components/Both";
import { Button } from "../components/Button";
import Checkbox from "../components/Checkbox";
import ClampContainer from "../components/ClampContainer";
import TextBox from "../components/TextBox";
import { auth, useIfAuthTransactions } from "../utils/auth";

const Login: Component = () => {
  const [remember, setRemember] = createSignal(true);
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [pass, setPass] = createSignal("");
  useIfAuthTransactions();

  async function login(e: MouseEvent) {
    const a = await auth.login(email(), pass());  
  }

  return (
    <>
      <Background />
      <ClampedCustom>
        <Box>
          <MainText>Welcome to Solana Gateway</MainText>
          <TextBox
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            placeholder="Email"
          />
          <TextBox
            value={pass()}
            onInput={(e) => setPass(e.currentTarget.value)}
            placeholder="Password"
          />
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
      <RightButton>Docs</RightButton>
    </>
  );
};

export default Login;
