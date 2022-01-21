import styled from "@emotion/styled"
import { AnimatePresence } from "framer-motion"
import { NextPage } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import fadeVariant from "../../src/animations/fadeVariant"
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
import useScrollBar from "../../src/layout/dashboard/useScrollBar"
import { useRequireAuth } from "../../src/redux/slices/authSlice"
import { selectAuth } from "../../src/redux/store"
import Spinner, { SpinnerWrapper } from "../../src/svg/Spinner"
import { $, GraphQLError } from "../../src/zeus"
import { GqlInclude } from "../../src/zeus/custom"
import { ErrorText } from "../login"

interface ITransaction {
  uuid: string
  confirmedAt?: number
  createdAt: number
  payload?: string | undefined
  recieveLm: number
  status: string
  recieveSig: string
  senderLm: number
  senderSig: string
  senderPk: string
  senderTo: string
}

async function getTransaction(uuid: string) {
  try {
    const data = await GqlInclude("query")(
      {
        getTransaction: [
          {
            uuid: $`uuid`
          },
          {
            confirmedAt: true,
            createdAt: true,
            payload: true,
            recieveLm: true,
            status: true,
            uuid: true,
            recieveSig: true,
            senderLm: true,
            senderSig: true,
            senderPk: true,
            senderTo: true
          }
        ]
      },
      {
        operationName: "getTransaction",
        variables: {
          uuid
        }
      }
    )
    return data.getTransaction
  } catch (err) {
    if (err instanceof GraphQLError && err.response?.errors) {
      return err.response.errors.map((e: any) => e.message).join("\n")
    }

    if (err instanceof TypeError) {
      return "Please check your internet connection"
    }
    return "Error fetching transaction"
  }
}

const Uuid: NextPage = () => {
  useRequireAuth()
  useScrollBar()
  const user = useSelector(selectAuth)
  const router = useRouter()
  const [uuid, setUUID] = useState("")
  const [txn, setTxn] = useState<ITransaction>()
  const [error, setError] = useState("")

  useEffect(() => {
    if (!router.isReady) return

    if (router.query.uuid) {
      setUUID(router.query.uuid as string)
    } else {
      router.push("/transfers")
    }
  }, [router])

  useEffect(() => {
    if (!uuid) return
    fetchCurrentTransaction()
  }, [uuid])

  async function fetchCurrentTransaction() {
    const data = await getTransaction(uuid)

    if (typeof data === "string") return setError(data)

    if (data) setTxn(data)
  }

  async function setConfirmed() {
    try {
      const data = await GqlInclude("mutation")(
        {
          setConfirmed: [
            {
              uuid: $`uuid`
            },
            {
              confirmedAt: true,
              createdAt: true,
              payload: true,
              recieveLm: true,
              status: true,
              uuid: true,
              recieveSig: true,
              senderLm: true,
              senderSig: true,
              senderPk: true,
              senderTo: true
            }
          ]
        },
        {
          operationName: "setConfirmed",
          variables: {
            uuid
          }
        }
      )
      setTxn(data.setConfirmed)
    } catch (err) {
      if (err instanceof GraphQLError && err.response?.errors) {
        setError(err.response.errors.map((e: any) => e.message).join("\n"))
      }

      if (err instanceof TypeError) {
        return setError("Please check your internet connection")
      }
      return setError("Error fetching transaction")
    }
  }

  return (
    <>
      <Head>
        <title>Transfers - Solana Gateway</title>
      </Head>
      <Wrapper>
        <ListHeader selectedRoute="none">
          <SubTitleWrapper>
            <SubTitle>Transaction</SubTitle>
            <AnimatePresence>
              {txn?.status == "PENDING" && (
                <Button
                  variant="outline"
                  variants={fadeVariant}
                  animate="visible"
                  initial="hidden"
                  exit="hidden"
                  onClick={setConfirmed}
                  padding=".5rem 1.25rem"
                >
                  Set Confirmed
                </Button>
              )}
            </AnimatePresence>

            <Button
              onClick={() => history.back()}
              variant="outline"
              padding=".5rem 1.25rem"
            >
              Back
            </Button>
          </SubTitleWrapper>
          <Underline />
        </ListHeader>
        <Container max="60rem" min="1px" value="100%">
          {user.isLoading || !txn ? (
            <SpinnerWrapper>
              <Spinner />
              {error && <ErrorText>{error}</ErrorText>}
            </SpinnerWrapper>
          ) : (
            <Transaction {...txn} />
          )}
        </Container>
      </Wrapper>
    </>
  )
}

const Transaction: React.FC<ITransaction> = props => {
  return (
    <TransactionBox>
      <Row>
        <Title>uuid</Title>
        <Value>{props.uuid}</Value>
      </Row>
      <Row>
        <Title>status</Title>
        <Value>{props.status}</Value>
      </Row>
      <Row>
        <Title>amount</Title>
        <Value>{props.senderLm * 0.000000001}</Value>
      </Row>
      <Row>
        <Title>sender sent to</Title>
        <Value>{props.senderTo}</Value>
        <Button
          onClick={() => navigator.clipboard.writeText(props.senderTo)}
          padding=".45rem 1rem"
          variant="outline"
        >
          Copy
        </Button>
      </Row>
      <Row>
        <Title>sender address</Title>
        <Value>{props.senderPk}</Value>
        <Button
          onClick={() => navigator.clipboard.writeText(props.senderPk)}
          padding=".45rem 1rem"
          variant="outline"
        >
          Copy
        </Button>
      </Row>
      <Row>
        <Title>sender signature</Title>
        <Value>{props.senderSig}</Value>
        <Button
          onClick={() => navigator.clipboard.writeText(props.senderSig)}
          padding=".45rem 1rem"
          variant="outline"
        >
          Copy
        </Button>
      </Row>
      <Row>
        <Title>recieve signature</Title>
        <Value>{props.recieveSig}</Value>
        <Button
          onClick={() => navigator.clipboard.writeText(props.recieveSig)}
          padding=".45rem 1rem"
          variant="outline"
        >
          Copy
        </Button>
      </Row>
      <Row>
        <Title>recieve amount</Title>
        <Value>{props.recieveLm * 0.000000001}</Value>
      </Row>
      <Row>
        <Title>payload</Title>
        <Value>{props.payload}</Value>
      </Row>
      <Row>
        <Title>created</Title>
        <Value>{new Date(props.createdAt).toUTCString()}</Value>
      </Row>
      <Row>
        <Title>confirmed</Title>
        <Value>
          {props.confirmedAt
            ? new Date(props.confirmedAt).toUTCString()
            : "false"}
        </Value>
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
  margin: "2rem 0",
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
