import styled from "@emotion/styled"
import { NextPage } from "next"
import Head from "next/head"
import { useEffect } from "react"
import BasicRowCard, { ButtonRight } from "../src/components/BasicRowCard"
import Button from "../src/components/Button"
import Container from "../src/components/Container"
import ListHeader from "../src/components/ListHeader"
import { Underline } from "../src/components/NormalHeader"
import {
  AddButton,
  SubTitle,
  SubTitleWrapper,
  Wrapper
} from "../src/layout/dashboard/styled"
const Webhooks: NextPage = () => {
  // useEffect(() => {
  //   document.body.style.backgroundColor = "#F5F5F5";
  //   return () => {
  //     document.body.style.backgroundColor = "";
  //   };
  // }, []);

  return (
    <>
      <Head>
        <title>Transfers - Solana Gateway</title>
      </Head>
      <Wrapper>
        <ListHeader selectedRoute="webhooks">
          <SubTitleWrapper>
            <SubTitle>Webhooks</SubTitle>
            <AddButton padding=".6rem 1.25rem" fontSize=".9rem">
              Add
            </AddButton>
          </SubTitleWrapper>
          <Underline />
        </ListHeader>
        <Container max="60rem" min="1px" value="100%">
          <WebhookBox>
            <BasicRowCard
              title="Webhook"
              fields={[
                {
                  label: "url",
                  value: "https://example.com/webhook"
                }
              ]}
            >
              <ButtonRight>
                <Button margin="1.25rem 0 0 0" fontSize=".95rem" padding=".425rem .9rem" variant="outline">Delete</Button>
              </ButtonRight>
            </BasicRowCard>

            {/* <BasicRowCard title="new webhook" ></BasicRowCard> */}
          </WebhookBox>
        </Container>
      </Wrapper>
    </>
  )
}

const WebhookBox = styled.div({
  display: "flex"
})

export default Webhooks
