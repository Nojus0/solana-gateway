import { Component, For } from "solid-js";
import { styled } from "solid-styled-components";
import Background from "../components/Background";
import { MainText } from "../components/Both";
import { Button } from "../components/Button";
import ClampContainer from "../components/ClampContainer";
import { TransactionBasic } from "shared";
import { format } from "date-fns";
import { Link } from "solid-app-router";
import { useAuth } from "../utils/auth";
const SOL_LAMPORTS = 0.000000001;

const Transactions: Component = () => {

  useAuth();

  const T: TransactionBasic[] = [
    {
      id: "da1231dsad",
      IsProcessed: false,
      createdAt: new Date(),
      lamports: 100000,
      payload: "data=231",
      processedAt: new Date(),
      publicKey: "DSADADAEQWEPUBLIC",
      sendbackSignature: "DSADASDQ£!$£",
      transferSignature: "dsadasdasd",
    },
    {
      id: "d23123123a1231dsad",
      IsProcessed: false,
      createdAt: new Date(),
      lamports: 103120000,
      payload: "data=231",
      processedAt: new Date(),
      publicKey: "DSADADAEQWEPUBLIC",
      sendbackSignature: "DSADASDQ£!$£",
      transferSignature: "dsadasdasd",
    },
    {
      id: "d23123123a1231dsad",
      IsProcessed: false,
      createdAt: new Date(),
      lamports: 103120000,
      payload: "data=231",
      processedAt: new Date(),
      publicKey: "DSADADAEQWEPUBLIC",
      sendbackSignature: "DSADASDQ£!$£",
      transferSignature: "dsadasdasd",
    },
    {
      id: "d23123123a1231dsad",
      IsProcessed: false,
      createdAt: new Date(),
      lamports: 103120000,
      payload: "data=231",
      processedAt: new Date(),
      publicKey: "DSADADAEQWEPUBLIC",
      sendbackSignature: "DSADASDQ£!$£",
      transferSignature: "dsadasdasd",
    },
    {
      id: "d23123123a1231dsad",
      IsProcessed: false,
      createdAt: new Date(),
      lamports: 103120000,
      payload: "data=231",
      processedAt: new Date(),
      publicKey: "DSADADAEQWEPUBLIC",
      sendbackSignature: "DSADASDQ£!$£",
      transferSignature: "dsadasdasd",
    },
    {
      id: "d23123123a1231dsad",
      IsProcessed: false,
      createdAt: new Date(),
      lamports: 103120000,
      payload: "data=231",
      processedAt: new Date(),
      publicKey: "DSADADAEQWEPUBLIC",
      sendbackSignature: "DSADASDQ£!$£",
      transferSignature: "dsadasdasd",
    },
    {
      id: "d23123123a1231dsad",
      IsProcessed: false,
      createdAt: new Date(),
      lamports: 103120000,
      payload: "data=231",
      processedAt: new Date(),
      publicKey: "DSADADAEQWEPUBLIC",
      sendbackSignature: "DSADASDQ£!$£",
      transferSignature: "dsadasdasd",
    },
    {
      id: "d23123123a1231dsad",
      IsProcessed: false,
      createdAt: new Date(),
      lamports: 103120000,
      payload: "data=231",
      processedAt: new Date(),
      publicKey: "DSADADAEQWEPUBLIC",
      sendbackSignature: "DSADASDQ£!$£",
      transferSignature: "dsadasdasd",
    },
    {
      id: "d23123123a1231dsad",
      IsProcessed: false,
      createdAt: new Date(),
      lamports: 103120000,
      payload: "data=231",
      processedAt: new Date(),
      publicKey: "DSADADAEQWEPUBLIC",
      sendbackSignature: "DSADASDQ£!$£",
      transferSignature: "dsadasdasd",
    },
    {
      id: "d23123123a1231dsad",
      IsProcessed: false,
      createdAt: new Date(),
      lamports: 103120000,
      payload: "data=231",
      processedAt: new Date(),
      publicKey: "DSADADAEQWEPUBLIC",
      sendbackSignature: "DSADASDQ£!$£",
      transferSignature: "dsadasdasd",
    },
  ];

  return (
    <>
      <Background />
      <ClampContainer max="65rem">
        <Box>
          <TopBar>
            <Header>Transfers</Header>
            <Link href="/docs">
              <DocsButton>Docs</DocsButton>
            </Link>
            <Link href="/settings">
              <Button>Settings</Button>
            </Link>
          </TopBar>
          <Browser>
            <For each={T}>{(item) => <Card {...item} />}</For>
          </Browser>
        </Box>
      </ClampContainer>
    </>
  );
};

const Card: Component<TransactionBasic> = (props) => {
  const time_formated = format(props.createdAt, "h:m aaa MMM d");

  return (
    <Wrap>
      <ColumnContainer>
        <SOLText>{props.lamports * SOL_LAMPORTS} SOL</SOLText>
        <Time>{time_formated}</Time>
      </ColumnContainer>
      <Button margin="0">Raw</Button>
    </Wrap>
  );
};

const DocsButton = styled(Button)({
  "@media (max-width: 30rem)": {
    display: "none",
  },
});

const SOLText = styled("h2")({
  fontWeight: 600,
  margin: ".5rem 0",
  fontSize: "2rem",
  lineHeight: "93.5%",
  letterSpacing: "-0.015em",
  color: "#FFFFFF",
});

const Time = styled("h1")({
  fontWeight: 500,
  margin: ".5rem 0",
  fontSize: "1rem",
  lineHeight: "93.5%",
  letterSpacing: "-0.015em",
  color: "#FFFFFF",
});

const ColumnContainer = styled("div")({
  display: "flex",
  flexGrow: 1,
  flexDirection: "column",
});

const Wrap = styled("div")({
  background: "#232323",
  borderRadius: "2rem",
  alignItems: "center",
  margin: "1rem 0",
  padding: "2rem",
  width: "98.5%",
  display: "flex",
});

const Header = styled(MainText)({
  flexGrow: 1,
});

const Browser = styled("div")({
  display: "flex",
  height: "100%",
  overflowY: "auto",
  flexDirection: "column",

  "&::-webkit-scrollbar": {
    width: "7px",
  },

  "&::-webkit-scrollbar-track": {
    background: "#161616",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "white",
    borderRadius: "10rem",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "#555",
  },
});

const TopBar = styled("div")({
  display: "flex",
});

const Box = styled("div")({
  width: "100%",
  height: "90%",
  borderRadius: "2rem",
  zIndex: 2,
  display: "flex",
  padding: "1.5rem",
  flexDirection: "column",
  background: "rgba(48,48,48,.25)",
});

export default Transactions;
