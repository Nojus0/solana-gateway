import { Link, useNavigate } from "solid-app-router";
import { Component, createSignal, For } from "solid-js";
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
import TextBox from "../components/TextBox";
import { setPublicKey } from "../graphql/setPublicKey";
import { createStore } from "solid-js/store";
import { auth, useAuth } from "../utils/auth";
import { styled } from "solid-styled-components";
import { IGQLError } from "../utils/interfaces";

const [valid, setValid] = createStore({
  email: true,
  password: true,
  wallet: true,
  agreed: true,
});

const Register: Component = () => {
  const [agreed, setAgreed] = createSignal(false);
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [wallet, setWallet] = createSignal("");
  const [isDev, setIsDev] = createSignal(false);
  const [errors, setErrors] = createSignal<IGQLError[]>([]);
  const navigate = useNavigate();
  async function register(e: MouseEvent) {
    setValid("email", email_regex.test(email()));
    setValid("password", password().trim().length > 3);
    setValid("wallet", wallet().trim().length > 30);
    setValid("agreed", agreed());

    if (!valid.email || !valid.password || !valid.wallet || !valid.agreed)
      return;

    if (password().length < 3) return setValid("password", false);

    const { createUser, errors } = await auth.register(
      email(),
      password(),
      isDev() ? "dev" : "main"
    );

    if (createUser.api_key) {
      const pb = await auth.setPublicKey(wallet());
      navigate("/transactions");
    }

    if (errors) {
      setErrors(errors);
    }
  }

  return (
    <>
      <ClampedCustom horizontal="center" vertical="center">
        <Box>
          <MainText>Welcome to Solana Gateway</MainText>
          <TextBox
            label="Email"
            variant={valid.email ? "normal" : "error"}
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            placeholder="Email"
          />
          <TextBox
            label="Password"
            variant={valid.password ? "normal" : "error"}
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            type="password"
            placeholder="Password"
          />
          <TextBox
            label="Wallet address"
            variant={valid.wallet ? "normal" : "error"}
            value={wallet()}
            onInput={(e) => setWallet(e.currentTarget.value)}
            placeholder="Wallet address"
          />
          <For each={errors()}>
            {(err) => <ErrorText>{err.message}</ErrorText>}
          </For>
          <BottomWrapper>
            <CheckContainer>
              <Checkbox
                variant="normal"
                checked={isDev()}
                setCheck={setIsDev}
              />
              <RememberText onClick={() => setIsDev((p) => !p)}>
                Dev Net Account
              </RememberText>
            </CheckContainer>
            <CheckContainer>
              <Checkbox
                variant={valid.agreed ? "normal" : "error"}
                checked={agreed()}
                setCheck={setAgreed}
              />
              <RememberText onClick={() => setAgreed((p) => !p)}>
                I agree to the terms of services
              </RememberText>
            </CheckContainer>
            <Button onClick={register}>Create account</Button>
          </BottomWrapper>
        </Box>
      </ClampedCustom>
      <Link href="https://docs.solanagateway.com">
        <RightButton>Docs</RightButton>
      </Link>
    </>
  );
};

const CheckContainer = styled(FlexBox)({
  margin: "0 0 1rem 0",
});

export default Register;
