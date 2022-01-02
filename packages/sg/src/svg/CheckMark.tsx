import { SVGProps } from "react";

const CheckMark: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="13" cy="13" r="13" fill="black" />
      <path
        d="M7.69739 13.6842C7.69739 13.6842 11.0901 16.7348 11.1184 16.7632C11.1468 16.7915 18.3027 9.23684 18.3027 9.23684"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default CheckMark;
