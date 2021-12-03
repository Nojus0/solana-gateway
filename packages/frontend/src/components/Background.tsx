import { Component } from "solid-js";
import { styled } from "solid-styled-components";

function animateRandom(element: HTMLElement) {
  element.animate(
    [
      {
        transform: "rotate(360deg)",
      },
    ],
    {
      iterations: Infinity,
      easing: "linear",
      duration: 10000 + Math.round(Math.random() * 10000),
    }
  );
}

const Background: Component = () => {
  return (
    <Wrapper>
      <Sun ref={animateRandom} />
      <Mars />
      <Neptune ref={animateRandom} />
      <Star ref={animateRandom} x="20vw" y="85vh" />
      <Star ref={animateRandom} x="10vw" y="75vh" />
      <Star x="3vw" y="85vh" ref={animateRandom} />
      <Star x="80vw" y="85vh" ref={animateRandom} />
      <Star x="84vw" y="72vh" ref={animateRandom} />
      <Star x="70vw" y="72vh" ref={animateRandom} />
      <Star x="90vw" y="72vh" ref={animateRandom} />
    </Wrapper>
  );
};

export default Background;

const Wrapper = styled("div")({
  position: "absolute",
  top: 0,
  left: 0,
  height: "100vh",
  overflow: "hidden",
  width: "100vw",
});

interface ISize {
  size?: string;
}

const Mars = styled("div")(({ size = "15rem" }: ISize) => ({
  borderRadius: "50%",
  background: "linear-gradient(217.75deg, #FF5C00 13.19%, #0E0E0E 78.83%);",
  position: "absolute",
  top: "5%",
  zIndex: 2,
  left: "50%",
  transformOrigin: "20vw -150vh",
  transform: "translate(-50%, -5%)",
  minHeight: size,
  minWidth: size,
  maxHeight: size,
  maxWidth: size,
}));

const Sun = styled("div")(({ size = "2rem" }: ISize) => ({
  borderRadius: "50%",
  background:
    "linear-gradient(221.54deg, rgba(255, 153, 0, 0.73) 14.85%, rgba(80, 80, 80, 0) 84.97%)",
  position: "absolute",
  top: "1.5rem",
  zIndex: 1,
  left: "25rem",
  minHeight: size,
  transformOrigin: "20vw 60vh",
  minWidth: size,
  maxHeight: size,
  maxWidth: size,
}));

const Neptune = styled("div")(({ size = "1.85rem" }: ISize) => ({
  background:
    "linear-gradient(236.31deg, rgba(0, 148, 255, 0.67) 4.5%, rgba(80, 80, 80, 0) 89%)",
  borderRadius: "50%",
  position: "absolute",
  top: "8.5rem",
  left: "85vw",
  transformOrigin: "-25vh 50vw",
  minHeight: size,
  minWidth: size,
  zIndex: 0,
  maxHeight: size,
  maxWidth: size,
}));

interface VectorSize extends ISize {
  x: string;
  y: string;
}

const Star = styled("div")(({ size = ".45rem", x, y }: VectorSize) => ({
  borderRadius: "50%",
  position: "absolute",
  background: "white",
  filter: "blur(.15rem)",
  top: y,
  left: x,
  transformOrigin: "40vw 150vh",
  minHeight: size,
  minWidth: size,
  maxHeight: size,
  maxWidth: size,
}));

// const BigAsteroid = styled("div")(({ size = "50rem", x, y }: VectorSize) => ({
//   borderRadius: "50%",
//   background: "rgba(255, 255, 255, 0.1)",
//   position: "absolute",
//   top: y,
//   left: x,
//   minHeight: size,
//   minWidth: size,
//   maxHeight: size,
//   maxWidth: size,
// }));
