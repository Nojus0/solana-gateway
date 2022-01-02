import styled from "@emotion/styled";
import { ISize } from "./interfaces";

interface IProfileCircleProps {
  size?: string;
  name?: string;
}

const ProfileCircle: React.FC<IProfileCircleProps> = (props) => {
  return <Circle size={props.size}>{props.name?.charAt(0)}</Circle>;
};

const Circle = styled.button(({ size = "3.25rem" }: ISize) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: size,
  height: size,
  borderRadius: "50%",
  cursor: "pointer",
  minWidth: size,
  minHeight: size,
  background: "#E95420",


  border: ".1rem solid #FFB59B",
  fontSize: "1.5rem",
  fontWeight: 500,
  margin: 0,
  color: "white",
}));

export default ProfileCircle;
