import styled from "@emotion/styled"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/router"
import { useDispatch } from "react-redux"
import fadeVariant, { fadeVariantSlow } from "../animations/fadeVariant"
import { setLoggedOut } from "../redux/slices/authSlice"
import { GqlInclude } from "../zeus/custom"
import NetworkCard from "./NetworkCard"
import { A } from "./Text"
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

  async function submitLogout() {
    if (await logout()) {
      dispatch(setLoggedOut())
      router.push("/login")
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
          <BoxEntry>Network</BoxEntry>
          <BoxEntry>
            <BoxText>Switch to</BoxText>
            <NetworkCard network="main">Main net</NetworkCard>
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
