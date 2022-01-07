import styled from "@emotion/styled";
import { SVGProps } from "react";

const Logo: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M28 14C28 21.732 21.732 28 14 28C6.26801 28 0 21.732 0 14C0 6.26801 6.26801 0 14 0C17.9174 0 14.959 8.4069 17.5 11C19.9744 13.5251 28 8 28 14Z"
        fill="black"
      />
    </svg>
  );
};

export const GatewayText = styled.h1({
  fontWeight: 500,
  margin: "0 .85rem",
  color: "black",
  flexGrow: 1,
  fontSize: "2.15rem",
});

export default Logo;
