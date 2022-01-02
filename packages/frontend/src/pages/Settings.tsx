import { Component, createEffect, createSignal, onMount } from "solid-js";
import { styled } from "solid-styled-components";
import { Box, FlexBox, MainText } from "../components/Both";
import { Button } from "../components/Button";
import Checkbox from "../components/Checkbox";
import ClampContainer from "../components/ClampContainer";
import Spinner from "../components/Spinner";
import TextBox from "../components/TextBox";
import { auth, useAuth } from "../utils/auth";

const Settings: Component = () => {
  useAuth();

  const [publicKey, setPk] = createSignal(auth.currentUser.publicKey);
  const [webhook, setWeb] = createSignal(auth.currentUser.webhook);
  const [fast, setFast] = createSignal(auth.currentUser.isFast);

  // * I don't know any other good way to do this *
  createEffect(() => {
    setPk(auth.currentUser.publicKey);
    setWeb(auth.currentUser.webhook);
    setFast(auth.currentUser.isFast);
  });

  // Create a function log out the user using the gqlRequest function
  const signOut = () => {
    auth.signOut();
  };

  async function save() {
    await auth.setPublicKey(publicKey());
    await auth.setWebhook(webhook());
    await auth.setFast(fast());
  }

  return (
    <ClampContainer>
      <Box>
        <MainText>Settings</MainText>
        {auth.loading && <Spinner />}
        {!auth.loading && (
          <>
            <TextBox
              label="Wallet address"
              value={publicKey()}
              onInput={(e) => setPk(e.currentTarget.value)}
              placeholder="Wallet address"
            />
            <TextBox
              label="Webhook Url"
              value={webhook()}
              onInput={(e) => setWeb(e.currentTarget.value)}
              placeholder="Webhook Url"
            />
            <TextBox
              value={auth.currentUser.secret}
              label="Secret"
              disabled
              placeholder="Secret"
            />
            <TextBox
              value={auth.currentUser.api_key}
              disabled
              label="API Key"
              placeholder="API Key"
            />
            <FlexBox>
              <Checkbox checked={fast()} setCheck={setFast} />
              <CheckBoxText>Fast Mode</CheckBoxText>
            </FlexBox>
          </>
        )}

        <ButtonContainer>
          <Button onClick={signOut} margin="1.25rem 0 1.25rem 0">
            Sign Out
          </Button>
          <Button onClick={() => history.back()} margin="1.25rem">
            Back
          </Button>
          <Button onClick={save} margin="1.25rem 0 1.25rem 0">
            Save
          </Button>
        </ButtonContainer>
      </Box>
    </ClampContainer>
  );
};

const CheckBoxText = styled("p")({
  fontWeight: 500,
  fontSize: "1rem",
  lineHeight: "93.5%",
  letterSpacing: "-0.015em",
  color: "white",
  margin: "0 1rem",
});

const ButtonContainer = styled("div")({
  display: "flex",
  marginTop: "1rem",
  flexWrap: "wrap",
  justifyContent: "flex-end",
});

export default Settings;