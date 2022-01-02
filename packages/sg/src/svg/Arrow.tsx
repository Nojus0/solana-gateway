import { SVGProps } from "react";

const Arrow: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="20"
      height="58"
      viewBox="0 0 20 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M10.7499 1.48853C10.7436 0.798206 10.1789 0.243719 9.48853 0.250053C8.79821 0.256386 8.24372 0.821141 8.25005 1.51147L10.7499 1.48853ZM9.12426 56.892C9.61688 57.3756 10.4083 57.3683 10.892 56.8757L18.7736 48.8481C19.2572 48.3555 19.25 47.5641 18.7574 47.0804C18.2648 46.5968 17.4733 46.6041 16.9897 47.0967L9.98378 54.2323L2.84814 47.2264C2.35553 46.7427 1.56411 46.75 1.08045 47.2426C0.596794 47.7352 0.604055 48.5267 1.09667 49.0103L9.12426 56.892ZM8.25005 1.51147L8.75005 56.0115L11.2499 55.9885L10.7499 1.48853L8.25005 1.51147Z"
        fill="black"
      />
    </svg>
  );
};

export default Arrow;
