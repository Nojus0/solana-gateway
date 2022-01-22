import styled from "@emotion/styled"
import { AnimatePresence } from "framer-motion"
import { NextPage } from "next"
import Head from "next/head"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import BasicRowCard, { ButtonRight } from "../src/components/BasicRowCard"
import Button from "../src/components/Button"
import Container from "../src/components/Container"
import ListHeader from "../src/components/ListHeader"
import { Underline } from "../src/components/NormalHeader"
import useMediaQuery from "../src/components/useMediaQuery"
import {
  AddButton,
  SubTitle,
  SubTitleWrapper,
  Wrapper
} from "../src/layout/dashboard/styled"
import useScrollBar from "../src/layout/dashboard/useScrollBar"
import { setWebhook, useRequireAuth } from "../src/redux/slices/authSlice"
import { selectAuth } from "../src/redux/store"
import { $, GraphQLError } from "../src/zeus"
import { GqlInclude } from "../src/zeus/custom"
import { ErrorText } from "./login"
import { RightDiv } from "./transfers"

const Webhooks: NextPage = () => {
  useRequireAuth()
  useScrollBar()
  const user = useSelector(selectAuth)
  const [add, setAdd] = useState(false)
  const [addUrl, setUrl] = useState("")
  const [addError, setAddErr] = useState("")
  const dispatch = useDispatch()
  const isSmall = useMediaQuery(`(max-width: 65rem)`, false)
  if (user.isLoading) return null

  async function submitRemoveWebhook(url: string) {
    try {
      const data = await GqlInclude("mutation")(
        {
          removeWebhook: [
            {
              removeUrl: $`removeUrl`
            },
            true
          ]
        },
        {
          operationName: "removeWebhook",
          variables: {
            removeUrl: url
          }
        }
      )

      dispatch(setWebhook(data.removeWebhook || []))
    } catch (err) {
      // Handle
    }
  }

  async function submitAddWebhook(url: string) {
    try {
      const data = await GqlInclude("mutation")(
        {
          addWebhook: [
            {
              newUrl: $`newUrl`
            },
            true
          ]
        },
        { operationName: "addWebhook", variables: { newUrl: url } }
      )

      setAdd(false)
      setAddErr("")
      dispatch(setWebhook(data.addWebhook || []))
    } catch (err) {
      if (err instanceof GraphQLError && err.response?.errors) {
        setAddErr(err.response.errors.map((e: any) => e.message).join("\n"))
      }

      if (err instanceof TypeError) {
        setAddErr("Please check your internet connection")
      }
    }
  }

  return (
    <>
      <Head>
        <title>Solana Gateway - Webhooks</title>
      </Head>
      <Wrapper>
        <ListHeader selectedRoute="webhooks">
          <SubTitleWrapper>
            <SubTitle>Webhooks</SubTitle>
            <AddButton
              onClick={() => setAdd(prev => !prev)}
              padding=".6rem 1.25rem"
            >
              Add
            </AddButton>
          </SubTitleWrapper>
          <Underline />
        </ListHeader>
        <Container max="60rem" min="1px" value="100%">
          <WebhookBox>
            <AnimatePresence>
              {user?.data?.webhooks?.map(webhook => (
                <TransferCard
                  key={webhook}
                  title="Webhook"
                  fields={[
                    {
                      label: "url",
                      value: webhook
                    }
                  ]}
                >
                  <ButtonRight>
                    <Button
                      onClick={() => submitRemoveWebhook(webhook)}
                      margin="1.25rem 0 0 0"
                      fontSize=".95rem"
                      padding=".425rem .9rem"
                      variant="outline"
                    >
                      Delete
                    </Button>
                  </ButtonRight>
                </TransferCard>
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {add && (
                <TransferCard
                  title="Webhook"
                  fields={[
                    {
                      label: "url",
                      value: addUrl,
                      onChange: e => setUrl(e.target.value)
                    }
                  ]}
                >
                  {addError && <ErrorText>{addError}</ErrorText>}
                  <ButtonRight>
                    <Button
                      onClick={() => {
                        setAdd(false)
                        setAddErr("")
                        setUrl("")
                      }}
                      margin="1.25rem 1rem 0 0"
                      fontSize=".95rem"
                      variant="outline"
                      padding=".425rem .9rem"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => submitAddWebhook(addUrl)}
                      margin="1.25rem 0 0 0"
                      fontSize=".95rem"
                      padding=".425rem .9rem"
                    >
                      Add
                    </Button>
                  </ButtonRight>
                </TransferCard>
              )}
            </AnimatePresence>
          </WebhookBox>
        </Container>
      </Wrapper>
    </>
  )
}

const TransferCard = styled(BasicRowCard)({
  width: "100%",
  height: "13.5rem"
})

const Text = styled.p({
  color: "black",
  fontSize: "1.25rem"
})

const WebhookBox = styled.div({
  display: "flex",
  flexWrap: "wrap"
})

export default Webhooks
