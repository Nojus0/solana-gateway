import styled from "@emotion/styled";
import { ISize } from "./interfaces";

const ProfileCircle = styled.button(({ size = "3.25rem" }: ISize) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: size,
  height: size,
  borderRadius: "50%",
  position: "relative",
  cursor: "pointer",
  minWidth: size,
  minHeight: size,
  background: "#E95420",
  outline: "none",
  border: ".1rem solid #FFB59B",
  fontSize: "1.5rem",
  fontWeight: 500,
  margin: 0,
  color: "white",
}));

export default ProfileCircle;
