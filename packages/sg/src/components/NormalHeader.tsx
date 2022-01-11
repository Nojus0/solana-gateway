import styled from "@emotion/styled"
import Link from "next/link"
import Logo, { GatewayText } from "../svg/Logo"
import Button, { TextButton } from "./Button"
import Container from "./Container"
import { IMargin } from "./interfaces"
import { A } from "./Text"
import useMediaQuery from "./useMediaQuery"

interface INormalHeaderProps {
  showLogo?: boolean
  showButton?: boolean
}

const NormalHeader: React.FC<INormalHeaderProps> = ({
  showLogo = true,
  showButton = true
}) => {
  const isSmall = useMediaQuery("(max-width: 45rem)", false)
  return (
    <Header justifyContent={showLogo && !isSmall ? "center" : "flex-end"}>
      {showLogo && !isSmall && (
        <Link passHref href="/">
          <LogoBoxWrapper>
            <Logo width="2.5rem" height="2.5rem" />
            <GatewayText>Gateway</GatewayText>
          </LogoBoxWrapper>
        </Link>
      )}

      {showButton && (
        <HeaderButtons>
          <Link href="/login" passHref>
            <A>
              <TextButton>Login</TextButton>
            </A>
          </Link>
          <Link passHref href="/signup">
            <A>
              <Button fontSize=".85rem" padding="0.8rem 1rem">
                Sign Up
              </Button>
            </A>
          </Link>
        </HeaderButtons>
      )}
    </Header>
  )
}

export const LogoBoxWrapper = styled.a({
  display: "flex",
  flexGrow: 1,
  textDecoration: "none"
})

interface IUnderline {
  height?: string
  width?: string
  color?: string
}

export const Underline = styled.div(
  ({
    color = "#E8E8E8",
    height = "0.1rem",
    width = "100%",
    margin = "0"
  }: IUnderline & IMargin) => ({
    width,
    height,
    margin,
    background: color,
    borderRadius: "9rem"
  })
)

const HeaderButtons = styled.div({
  display: "flex",
  alignItems: "center"
})
interface IHeaderButtonProps {
  justifyContent?: string
}
const Header = styled.div(
  ({ justifyContent = "center" }: IHeaderButtonProps) => ({
    justifyContent,
    display: "flex",
    userSelect: "none",
    zIndex: 1,
    margin: "1.35rem 0",
    height: "3rem",
    alignItems: "center"
  })
)

export default NormalHeader
