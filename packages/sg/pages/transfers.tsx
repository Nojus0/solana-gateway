import styled from "@emotion/styled"
import { NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import Button from "../src/components/Button"
import Container from "../src/components/Container"
import ListHeader from "../src/components/ListHeader"
import { A } from "../src/components/Text"
import BasicRowCard from "../src/components/BasicRowCard"
import { Wrapper } from "../src/layout/dashboard/styled"
import { useRequireAuth } from "../src/redux/slices/authSlice"
import { useSelector } from "react-redux"
import { selectAuth } from "../src/redux/store"
import { useRouter } from "next/router"
import { GqlInclude } from "../src/zeus/custom"
import { $, GraphQLError, TransactionFilter } from "../src/zeus"
import { AnimatePresence, motion } from "framer-motion"
import fadeVariant from "../src/animations/fadeVariant"
import Spinner, { SpinnerWrapper } from "../src/svg/Spinner"
import useScrollBar from "../src/layout/dashboard/useScrollBar"
import { Waypoint } from "react-waypoint"
import useMediaQuery from "../src/components/useMediaQuery"
type PropType<TObj, TProp extends keyof TObj> = TObj[TProp]
type Awaited<T> = T extends PromiseLike<infer U> ? U : T

interface TransferBasic {
  createdAt: any
  payload?: string | undefined
  recieveLm: number
  status: string
  uuid: string
}

async function getTransactions(
  filter: TransactionFilter,
  next: string | null,
  limit = 50
) {
  try {
    const data = await GqlInclude("query")(
      {
        getTransactions: [
          {
            filter: $`filter`,
            limit: $`limit`,
            next: $`next`
          },
          {
            transactions: {
              createdAt: true,
              payload: true,
              recieveLm: true,
              status: true,
              uuid: true
            },
            next: true
          }
        ]
      },
      {
        variables: {
          filter,
          limit,
          next
        }
      }
    )

    return data.getTransactions
  } catch (err) {
    if (err instanceof GraphQLError && err.response?.errors) {
      return err.response.errors.map((e: any) => e.message).join("\n")
    }

    if (err instanceof TypeError) return "Please check your internet connection"
  }
}

const Transfers: NextPage = () => {
  useRequireAuth()
  useScrollBar()
  const user = useSelector(selectAuth)
  const limit = 50
  const [transactions, setTransactions] = useState<TransferBasic[]>([])
  const [loading, setLoading] = useState(true)
  const [next, setNext] = useState<string | null>(null)
  const [isMore, setMore] = useState(true)
  const isSmall = useMediaQuery(`(max-width: 65rem)`, false)

  useEffect(() => {
    fetchTransactions()
  }, [])

  async function fetchTransactions() {
    setLoading(true)

    const txns = await getTransactions(TransactionFilter.All, next, limit)

    if (typeof txns === "string") return setLoading(false)
    if (typeof txns === "object") {
      if (txns.transactions == null) {
        setMore(false)
        return
      }

      setTransactions(prev => [...prev, ...txns.transactions])

      if (txns.transactions.length < limit) {
        setMore(false)
      }

      setNext(txns.next || null)
    }

    setLoading(false)
  }

  if (user.isLoading) {
    return null
  }

  function reachedBottom() {
    if (!isMore || loading || !next) return
    console.log(`fetching more`)
    fetchTransactions()
  }

  return (
    <>
      <Head>
        <title>Solana Gateway - Transfers</title>
      </Head>
      <Wrapper>
        <ListHeader selectedRoute="transfers" />
        <Container
          margin="1rem .75rem 5rem .75rem"
          max="60rem"
          min="1px"
          value="100%"
        >
          <Browser
            direction={isSmall ? "column" : "row"}
            variants={fadeVariant}
            animate="visible"
            initial="hidden"
          >
            {loading && (
              <SpinnerWrapper>
                <Spinner />
              </SpinnerWrapper>
            )}
            
            {!loading && transactions.length === 0 && (
              <NoTransfersText>You haven&apos;t recieved any transfers yet.</NoTransfersText>
            )}

            {transactions.map((txn, i) => {
              const isLast = i === transactions.length - 1

              if (isLast) {
                return (
                  <Waypoint onEnter={reachedBottom} key={txn.uuid}>
                    <WaypointWrapper>
                      <BasicRowCard
                        key={txn.uuid}
                        fields={[
                          {
                            label: "amount",
                            value: `${txn.recieveLm * 0.000000001} SOL`
                          },
                          {
                            label: "data",
                            value: txn.payload || "No Payload"
                          },
                          {
                            label: "status",
                            value: txn.status
                          }
                        ]}
                        title="transfer"
                      >
                        <RightDiv>
                          <Link passHref href={`/transfer/${txn.uuid}`}>
                            <A margin="1.15rem 0 0 0">
                              <Button
                                margin=" 0 0 .7rem 0"
                                padding=".5rem 1rem"
                                variant="outline"
                              >
                                More
                              </Button>
                            </A>
                          </Link>
                        </RightDiv>
                      </BasicRowCard>
                    </WaypointWrapper>
                  </Waypoint>
                )
              }

              return (
                <BasicRowCard
                  key={txn.uuid}
                  fields={[
                    {
                      label: "amount",
                      value: `${txn.recieveLm * 0.000000001} SOL`
                    },
                    {
                      label: "data",
                      value: txn.payload || "No Payload"
                    },
                    {
                      label: "status",
                      value: txn.status
                    }
                  ]}
                  title="transfer"
                >
                  <RightDiv>
                    <Link passHref href={`/transfer/${txn.uuid}`}>
                      <A margin="1.15rem 0 0 0">
                        <Button
                          margin=" 0 0 .7rem 0"
                          padding=".5rem 1rem"
                          variant="outline"
                        >
                          More
                        </Button>
                      </A>
                    </Link>
                  </RightDiv>
                </BasicRowCard>
              )
            })}
          </Browser>
        </Container>
      </Wrapper>
    </>
  )
}

interface IDirection {
  direction?: "row" | "column"
}

const NoTransfersText = styled.p({
  color: "#000000",
  fontSize: "1.25rem",
  width: "100%",
  textAlign: "center",
  textShadow: "0px 1px 2px rgba(0, 0, 0, 0.25)"
})

const WaypointWrapper = styled.span({
  width: "100%",
  "@media (min-width: 65rem)": {
    width: "30rem"
  }
})

const Browser = styled(motion.div)(
  ({ direction: flexDirection = "row" }: IDirection) => ({
    flexDirection,
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-start"
  })
)

export const RightDiv = styled.div({
  display: "flex",
  justifyContent: "flex-end"
})

const ButtonRight = styled.a({
  display: "flex",
  justifyContent: "flex-end",
  textDecoration: "none"
})

export default Transfers
