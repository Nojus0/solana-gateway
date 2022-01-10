import styled from "@emotion/styled"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { useSelector } from "react-redux"
import { selectAuth } from "../redux/store"
import Logo, { GatewayText } from "../svg/Logo"
import Button, { TextButton } from "./Button"
import Container from "./Container"
import Dropdown from "./Dropdown"
import { IJustifyContent, ISelected, IWrap } from "./interfaces"
import NetworkCard from "./NetworkCard"
import { Underline } from "./NormalHeader"
import ProfileCircle from "./ProfileCircle"
import { A } from "./Text"
import useMediaQuery from "./useMediaQuery"

interface IListHeaderProps {
  showLogo?: boolean
  showProfile?: boolean
  selectedRoute?: "transfers" | "webhooks" | "settings" | "none"
}

const ListHeader: React.FC<IListHeaderProps> = ({
  showLogo = true,
  showProfile = true,
  selectedRoute = "none",
  children
}) => {
  const isSmall = useMediaQuery("(max-width: 45rem)", false)
  const user = useSelector(selectAuth)
  const [isDrop, setDrop] = useState(false)

  return (
    <Header justifyContent={showLogo && !isSmall ? "center" : "flex-end"}>
      <Container margin="0 .75rem" max="60rem" min="1px" value="100%">
        <RightWrapper justifyContent={isSmall ? "flex-end" : "unset"}>
          <CustomLogo width="2.5rem" height="2.5rem" />
          <GatewayText>Gateway</GatewayText>

          <ProfileWrapper>
            <NetworkCard margin="0 1rem" network={user?.data?.network as any} selected>{user?.data?.network} net</NetworkCard>
            <ProfileCircle onClick={() => setDrop(prev => !prev)}>
              {user?.data?.email?.substring(0, 1)}
            </ProfileCircle>
            <Dropdown when={isDrop} setWhen={setDrop} />
          </ProfileWrapper>
        </RightWrapper>

        <Routes>
          <Link passHref href="/transfers">
            <RouteText selected={selectedRoute == "transfers"}>
              Transfers
            </RouteText>
          </Link>
          <Link passHref href="/webhooks">
            <RouteText selected={selectedRoute == "webhooks"}>
              Webhooks
            </RouteText>
          </Link>
          <Link passHref href="/settings">
            <RouteText selected={selectedRoute == "settings"}>
              Settings
            </RouteText>
          </Link>
        </Routes>
      </Container>
      <Underline />
      {children}
    </Header>
  )
}

const ProfileWrapper = styled.div({
  display: "flex",
  position: "relative",
  alignItems: "center"
})

const CustomLogo = styled(Logo)({
  width: "2.5rem",
  height: "2.5rem",
  minHeight: "2.5rem",
  minWidth: "2.5rem"
})

const Routes = styled("div")({
  display: "flex",
  width: "100%",
  flexWrap: "wrap",
  transform: "translateX(-1.1rem)",
  alignItems: "flex-start"
})

const RouteText = styled.p(({ selected }: ISelected) => ({
  color: "black",
  fontSize: "1rem",
  textDecoration: "none",
  cursor: "pointer",
  fontWeight: 400,
  borderRadius: ".4rem",
  margin: ".5rem",
  position: "relative",
  padding: ".6rem 1rem",
  transition: "background 100ms ease",
  "&:hover": {
    background: "rgba(0,0,0,0.05)"
  },
  "&::before": {
    content: selected ? '""' : "none",
    position: "absolute",
    bottom: "-.55rem",
    right: "50%",
    width: "75%",
    height: ".1rem",
    background: "black",
    transform: "translateX(50%)"
  }
}))

const RightWrapper = styled.div(
  ({ justifyContent = "center" }: IJustifyContent) => ({
    display: "flex",
    justifyContent,
    width: "100%"
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
    padding: "1.35rem 0 0 0",
    // height: "8rem",
    background: "white",
    flexDirection: "column",
    alignItems: "center"
  })
)

export default ListHeader
