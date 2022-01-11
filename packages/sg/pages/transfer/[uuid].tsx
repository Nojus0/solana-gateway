import styled from "@emotion/styled"
import { NextPage } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import Button from "../../src/components/Button"
import Container from "../../src/components/Container"
import ListHeader from "../../src/components/ListHeader"
import { Underline } from "../../src/components/NormalHeader"
import {
  AddButton,
  SubTitle,
  SubTitleWrapper,
  Wrapper
} from "../../src/layout/dashboard/styled"
import { useRequireAuth } from "../../src/redux/slices/authSlice"
import { selectAuth } from "../../src/redux/store"
import { GqlInclude } from "../../src/zeus/custom"

async function getTransaction(uuid: string) {

  const data = await GqlInclude("query")({
    
  })

} 

const Uuid: NextPage = () => {
  useRequireAuth()
  const user = useSelector(selectAuth)
  const router = useRouter()
  const [uuid, setUUID] = useState("")

  useEffect(() => {
    if (!router.isReady) return

    if (router.query.uuid) {
      setUUID(router.query.uuid as string)
    } else {
      router.push("/transfers")
    }
  }, [router])

  return (
    <>
      <Head>
        <title>Transfers - Solana Gateway</title>
      </Head>
      <Wrapper>
        <ListHeader selectedRoute="none">
          <SubTitleWrapper>
            <SubTitle>Transaction</SubTitle>
            <Button
              onClick={() => history.back()}
              variant="outline"
              padding=".6rem 1.25rem"
              fontSize=".9rem"
            >
              Back
            </Button>
          </SubTitleWrapper>
          <Underline />
        </ListHeader>
        <Container max="60rem" min="1px" value="100%">
          {user.isLoading ? <p>Loading...</p> : <Transaction />}
        </Container>
      </Wrapper>
    </>
  )
}

function Transaction() {
  return (
    <TransactionBox>
      <Row>
        <Title>uuid</Title>
        <Value>231sd123ad32rsdw</Value>
      </Row>
      <Row>
        <Title>status</Title>
        <Value>Confirmed</Value>
      </Row>
      <Row>
        <Title>amount</Title>
        <Value>0.01 SOL</Value>
      </Row>
      <Row>
        <Title>sender address</Title>
        <Value>BtmeDx97CSrq9ce7dARsgnusA7YHbVe6732cfTkd8SFW</Value>
        <Button padding=".45rem 1rem" variant="outline">
          Copy
        </Button>
      </Row>
      <Row>
        <Title>sender signature</Title>
        <Value>31cm6RaU1YHHzhQQ5Ztw3jLu3ncofqtQRypW4zMY33E...</Value>
        <Button padding=".45rem 1rem" variant="outline">
          Copy
        </Button>
      </Row>
      <Row>
        <Title>resend signature</Title>
        <Value>31cm6RaU1YHHzhQQ5Ztw3jLu3ncofqtQRypW4zMY33E...</Value>
        <Button padding=".45rem 1rem" variant="outline">
          Copy
        </Button>
      </Row>
      <Row>
        <Title>recieve signature</Title>
        <Value>31cm6RaU1YHHzhQQ5Ztw3jLu3ncofqtQRypW4zMY33E...</Value>
        <Button padding=".45rem 1rem" variant="outline">
          Copy
        </Button>
      </Row>
      <Row>
        <Title>recieve amount</Title>
        <Value>0.9 SOL</Value>
      </Row>
      <Row>
        <Title>payload</Title>
        <Value>data=2</Value>
      </Row>
      <Row>
        <Title>created</Title>
        <Value>2021-12-28 7:32pm</Value>
      </Row>
      <Row>
        <Title>confirmed</Title>
        <Value>2021-12-28 7:32pm</Value>
      </Row>
    </TransactionBox>
  )
}

const Row = styled.div({
  display: "flex",
  padding: ".75rem 0",
  alignItems: "center",
  flexBasis: "100%",
  flexGrow: 1,
  justifyContent: "flex-start"
})

const Title = styled.h2({
  fontSize: "1.15rem",
  fontWeight: 400,
  textOverflow: "ellipsis",
  overflow: "hidden",
  whiteSpace: "nowrap",
  wordBreak: "break-all",
  flexBasis: "100%",
  margin: 0
})

const Value = styled.p({
  fontSize: "1.15rem",
  fontWeight: 400,
  flexGrow: 1,
  textOverflow: "ellipsis",
  overflow: "hidden",
  whiteSpace: "nowrap",
  maxWidth: "50%",
  wordBreak: "break-all",
  flexBasis: "100%",
  margin: 0
})

const TransactionBox = styled.div({
  padding: "1.5rem",
  margin: "1rem 0 0 0",
  borderRadius: ".5rem",
  overflowY: "auto",
  maxHeight: "27.5rem",
  background: "white",
  boxShadow: "0px 2px 4px rgba(99, 99, 99, 0.25)",

  "&::-webkit-scrollbar": {
    width: "15px",
    height: "15px",
    backgroundColor: "inherit",
    borderRadius: "10px"
  },
  "&::-webkit-scrollbar-corner": {
    backgroundColor: "#0000001a"
  },
  "&::-webkit-scrollbar-thumb": {
    borderRadius: "15px",
    backgroundColor: "#e95420",
    backgroundClip: "content-box",
    border: "4px solid transparent"
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "#f5f5f5"
  }
})

export default Uuid
