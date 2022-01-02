import styled from "@emotion/styled"
import { motion } from "framer-motion"
import { NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import { useEffect } from "react"
import fadeVariant from "../src/animations/fadeVariant"
import Button from "../src/components/Button"
import Container from "../src/components/Container"
import ListHeader from "../src/components/ListHeader"
import NormalHeader, { Underline } from "../src/components/NormalHeader"
import { A } from "../src/components/Text"
import BasicRowCard from "../src/components/BasicRowCard"
import { Wrapper } from "../src/layout/dashboard/styled"

const Transfers: NextPage = () => {
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
        <ListHeader selectedRoute="transfers" />
        <Container margin="0 .75rem" max="60rem" min="1px" value="100%">
          <Browser>
            <BasicRowCard
              fields={[
                {
                  label: "amount",
                  value: "0.00 SOL"
                },
                {
                  label: "data",
                  value: "u=2"
                }
              ]}
              title="transfer"
            >
              <Link passHref href={`/transfer/uuid`}>
                <ButtonRight>
                  <A>
                    <Button
                      margin="1.15rem 0 0 0"
                      fontSize=".95rem"
                      padding=".35rem 1rem"
                      variant="outline"
                    >
                      More
                    </Button>
                  </A>
                </ButtonRight>
              </Link>
            </BasicRowCard>
          </Browser>
        </Container>
      </Wrapper>
    </>
  )
}

const Browser = styled.div({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "flex-start"
})

const ButtonRight = styled.div({
  display: "flex",
  justifyContent: "flex-end"
})

export default Transfers
