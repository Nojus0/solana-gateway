import styled from "@emotion/styled"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/router"
import { useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import fadeVariant, { fadeVariantSlow } from "../animations/fadeVariant"
import { setLoggedOut } from "../redux/slices/authSlice"
import { selectAuth } from "../redux/store"
import { GqlInclude } from "../zeus/custom"
import NetworkCard from "./NetworkCard"
interface IDropdownProps {
  when: boolean
  setWhen: React.Dispatch<React.SetStateAction<boolean>>
}

async function logout() {
  const data = await GqlInclude("mutation")({
    signOut: true
  })

  return data.signOut || false
}

const Dropdown: React.FC<IDropdownProps> = p => {
  const router = useRouter()
  const dispatch = useDispatch()
  const user = useSelector(selectAuth)

  const oppositeNetwork = useMemo(() => {
    return user?.data?.network == "main"
      ? "dev"
      : user?.data?.network == "dev"
      ? "main"
      : "unknown"
  }, [user])

  async function submitLogout() {
    if (await logout()) {
      router.push("/login")
      dispatch(setLoggedOut())
    }
  }

  async function switchNetwork() {
    if (await logout()) {
      router.push({
        pathname: `/login`,
        query: {
          network: oppositeNetwork
        }
      })
      dispatch(setLoggedOut())
    }
  }

  return (
    <AnimatePresence>
      {p.when && (
        <Box
          variants={fadeVariantSlow}
          animate="visible"
          initial="hidden"
          exit="hidden"
        >
          <BoxEntry onClick={switchNetwork}>
            <BoxText>Switch to</BoxText>
            <NetworkCard network={oppositeNetwork as any}>
              {oppositeNetwork} net
            </NetworkCard>
          </BoxEntry>
          <Link href="/settings" passHref>
            <AnoDecoration>
              <BoxEntry>Settings</BoxEntry>
            </AnoDecoration>
          </Link>
          <BoxEntry onClick={submitLogout}>Log out</BoxEntry>
        </Box>
      )}
    </AnimatePresence>
  )
}

const AnoDecoration = styled.a({
  textDecoration: "none"
})

const BoxText = styled.p({
  fontWeight: 500,
  color: "black",
  margin: 0,
  flexGrow: 1
})

const BoxEntry = styled.div({
  display: "flex",
  padding: "1rem",
  alignItems: "center",
  justifyContent: "flex-start",
  color: "black",
  fontSize: ".95rem",
  cursor: "pointer",
  "&:hover": {
    background: "#F8F8F8",
    transition: "background 200ms ease"
  }
})

const Box = styled(motion.div)({
  display: "flex",
  flexDirection: "column",
  minWidth: "15rem",
  borderRadius: ".5rem",
  background: "white",
  position: "absolute",
  zIndex: 10,
  top: "calc(100% + 1rem)",
  right: 0,
  boxShadow: "0px 0px 20px rgba(69, 69, 69, 0.25)"
})

export default Dropdown
