import styled from "@emotion/styled";
import GithubLogo from "../svg/GithubLogo";

const ContinueGithub: React.FC = () => {
  return (
    <GithubContinue>
      <GithubLogoCustom />
      Continue with Github
    </GithubContinue>
  );
};

const GithubLogoCustom = styled(GithubLogo)({
  margin: "0 .5rem",
});

const GithubContinue = styled.div({
  display: "flex",
  justifyContent: "center",
  margin: "1rem 0",
  alignItems: "center",
  userSelect: "none",
  textAlign: "center",
  cursor: "pointer",
  fontSize: "1.35rem",
  color: "white",
  background: "#24292E",
  borderRadius: ".5rem",
  padding: "1rem",
});

export default ContinueGithub;
