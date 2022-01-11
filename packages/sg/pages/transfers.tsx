import styled from "@emotion/styled"
import { NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import Button from "../src/components/Button"
import Container from "../src/components/Container"
import ListHeader from "../src/components/ListHeader"
import { A } from "../src/components/Text"
import BasicRowCard, { BasicWrapper } from "../src/components/BasicRowCard"
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

const useComponentWillMount = (cb: () => void) => {
  const willMount = useRef(true)

  if (willMount.current) cb()

  willMount.current = false
}

const Transfers: NextPage = () => {
  const router = useRouter()
  useRequireAuth()
  useScrollBar()
  const user = useSelector(selectAuth)
  const limit = 50
  const [transactions, setTransactions] = useState<TransferBasic[]>([])
  const [loading, setLoading] = useState(true)
  const [next, setNext] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [isMore, setMore] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  async function fetchTransactions() {
    setLoading(true)
    const txns = await getTransactions(TransactionFilter.All, next, limit)

    if (typeof txns === "string") return setError(txns)
    if (typeof txns === "object") {
      setError("")
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
        <title>Transfers - Solana Gateway</title>
      </Head>
      <Wrapper>
        <ListHeader selectedRoute="transfers" />
        <Container margin="0 .75rem" max="60rem" min="1px" value="100%">
          <Browser variants={fadeVariant} animate="visible" initial="hidden">
            {loading && (
              <SpinnerWrapper>
                <Spinner />
              </SpinnerWrapper>
            )}
            {transactions.map((txn, i) => {
              const isLast = i === transactions.length - 1

              if (isLast) {
                return (
                  <Waypoint onEnter={reachedBottom} key={txn.uuid}>
                    <BasicWrapper>
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
                        <Link passHref href={`/transfer/${txn.uuid}`}>
                          <ButtonRight>
                            <Button
                              margin="1.15rem 0 0 0"
                              fontSize=".95rem"
                              padding=".35rem 1rem"
                              variant="outline"
                            >
                              More
                            </Button>
                          </ButtonRight>
                        </Link>
                      </BasicRowCard>
                    </BasicWrapper>
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
                  <Link passHref href={`/transfer/${txn.uuid}`}>
                    <ButtonRight>
                      <Button
                        margin="1.15rem 0 0 0"
                        fontSize=".95rem"
                        padding=".35rem 1rem"
                        variant="outline"
                      >
                        More
                      </Button>
                    </ButtonRight>
                  </Link>
                </BasicRowCard>
              )
            })}
          </Browser>
        </Container>
      </Wrapper>
    </>
  )
}

const Browser = styled(motion.div)({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
  justifyContent: "flex-start"
})

const ButtonRight = styled.a({
  display: "flex",
  justifyContent: "flex-end",
  textDecoration: "none"
})

export default Transfers
