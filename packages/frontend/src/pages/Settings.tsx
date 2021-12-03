import { Component, createEffect, createSignal } from "solid-js";
import { styled } from "solid-styled-components";
import Background from "../components/Background";
import { Box, MainText } from "../components/Both";
import { Button } from "../components/Button";
import ClampContainer from "../components/ClampContainer";
import TextBox from "../components/TextBox";
import { setPublicKey } from "../graphql/setPublicKey";
import { setWebhook } from "../graphql/setWebhook";
import { auth, useAuth } from "../utils/auth";

const Settings: Component = () => {
  useAuth();

  const [wallet, setWallet] = createSignal(auth.currentUser.publicKey);
  const [webhook, setWeb] = createSignal(auth.currentUser.webhook);

  async function save() {
    await auth.setPublicKey(wallet());
    await auth.setWebhook(webhook());
  }

  return (
    <>
      <Background />
      <ClampContainer>
        <Box>
          <MainText>Settings</MainText>
          <TextBox
            value={wallet()}
            onInput={(e) => setWallet(e.currentTarget.value)}
            placeholder="Wallet address"
          />
          <TextBox
            value={webhook()}
            onInput={(e) => setWeb(e.currentTarget.value)}
            placeholder="Webhook url"
          />
          <ButtonContainer>
            <Button onClick={() => history.back()} margin="1.25rem">
              Back
            </Button>
            <Button onClick={save} margin="1.25rem 0 1.25rem 0">
              Save
            </Button>
          </ButtonContainer>
        </Box>
      </ClampContainer>
    </>
  );
};

const ButtonContainer = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
});

export default Settings;
