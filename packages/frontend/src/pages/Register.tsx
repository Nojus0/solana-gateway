import { useNavigate } from "solid-app-router";
import { Component, createSignal } from "solid-js";
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
import TextBox from "../components/TextBox";
import { setPublicKey } from "../graphql/setPublicKey";
import { createStore } from "solid-js/store";
import { auth, useIfAuthTransactions } from "../utils/auth";

const [valid, setValid] = createStore({
  email: true,
  password: true,
  wallet: true,
  agreed: true,
});

const email_regex = /^\S+@\S+\.\S+$/;

const Register: Component = () => {
  useIfAuthTransactions();
  const [agreed, setAgreed] = createSignal(false);
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [wallet, setWallet] = createSignal("");
  const navigate = useNavigate();
  async function register(e: MouseEvent) {
    setValid("email", email_regex.test(email()));
    setValid("password", password().trim().length > 3);
    setValid("wallet", wallet().trim().length > 30);
    setValid("agreed", agreed());

    if (!valid.email) return;
    if (!valid.password) return;
    if (!valid.wallet) return;
    if (!valid.agreed) return;

    if (password().length < 3) return setValid("password", false);

    const { createUser } = await auth.register(email(), password());

    if (createUser.api_key) {
      const pb = await setPublicKey({ newPublicKey: wallet() });
      navigate("/transactions");
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
          <BottomWrapper>
            <FlexBox>
              <Checkbox
                variant={valid.agreed ? "normal" : "error"}
                checked={agreed()}
                setCheck={setAgreed}
              />
              <RememberText onClick={() => setAgreed((p) => !p)}>
                I agree to the terms of services
              </RememberText>
            </FlexBox>
            <Button onClick={register}>Create account</Button>
          </BottomWrapper>
        </Box>
      </ClampedCustom>
      <RightButton>Docs</RightButton>
    </>
  );
};

export default Register;
