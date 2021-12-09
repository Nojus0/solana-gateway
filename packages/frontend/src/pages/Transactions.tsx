import { Component, createSignal, For, onMount } from "solid-js";
import { styled } from "solid-styled-components";
import Background from "../components/Background";
import { MainText } from "../components/Both";
import { Button } from "../components/Button";
import ClampContainer from "../components/ClampContainer";
import { Transaction, TransactionBasic } from "shared";
import { format } from "date-fns";
import { Link } from "solid-app-router";
import { useAuth } from "../utils/auth";
import { getTransactions } from "../graphql/getTransactions";
import Modal from "../components/Modal";
import fade from "../utils/fade";
import { Transition } from "solid-transition-group";
const SOL_LAMPORTS = 0.000000001;

const [modal, setModal] = createSignal({ show: false, body: "" });

// create a function that clamps numbers maximum to 8 decimal places
const clamp = (num: number) => {
  return Math.round(num * 100000000) / 100000000;
};

const Transactions: Component = () => {
  useAuth();
  const [skip, setSkip] = createSignal(0);
  const [limit, setLimit] = createSignal(50);
  const [transactions, setTransactions] = createSignal<Transaction[]>([]);

  onMount(async () => {
    const txns = await getTransactions({
      filter: "All",
      limit: limit(),
      skip: skip(),
    });
    setTransactions((p) => [...p, ...txns.getTransactions]);
  });

  return (
    <>
      <Modal when={modal().show} setWhen={setModal}>
        <ModalContainer>
          <pre>

          <RawText>{modal().body}</RawText>
          </pre>
          <Button onClick={() => setModal({ show: false, body: "" })}>
            Ok
          </Button>
        </ModalContainer>
      </Modal>

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
            <For each={transactions()}>{(item) => <Card {...item} />}</For>
          </Browser>
        </Box>
      </ClampContainer>
    </>
  );
};

const RawText = styled("p")({
  color: "white",
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
});

const Card: Component<Transaction> = (props) => {
  const time_formated = format(new Date(props.createdAt), "h:m aaa MMM d");

  function onRaw() {
    setModal({ show: true, body: JSON.stringify(props, null, 4) });
  }

  return (
    <Transition {...fade(250, "ease")}>
      <Wrap>
        <ColumnContainer>
          <SOLText>{clamp(props.lamports * SOL_LAMPORTS)} SOL</SOLText>
          <Time>{time_formated}</Time>
        </ColumnContainer>
        <Button margin="1rem" onClick={onRaw}>
          Raw
        </Button>
      </Wrap>
    </Transition>
  );
};

const ModalContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  wordBreak: "break-all",
  alignItems: "center",
  background: "#2D2D2D",
  padding: "2rem",
  borderRadius: "2rem",
});

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
  flexWrap: "wrap",
  margin: "1rem 0",
  padding: "2rem",
  width: "98.5%",
  justifyContent: "center",
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
  display: "flex",
  padding: "1.5rem",
  flexDirection: "column",
  background: "rgba(48,48,48,.25)",
});

export default Transactions;
