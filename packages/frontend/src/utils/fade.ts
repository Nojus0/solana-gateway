import { SimpleAnimation } from "./types"

const fade: SimpleAnimation = (duration = 200, easing = "ease") => ({
  appear: true,
  onEnter: (el, done) => {
    el.animate(
      [
        {
          opacity: 0
        },
        {
          opacity: 1
        }
      ],
      { duration, easing }
    ).finished.then(done)
  },
  onExit: (el, done) => {
    el.animate(
      [
        {
          opacity: 1
        },
        {
          opacity: 0
        }
      ],
      { duration, easing }
    ).finished.then(done)
  }
})

export default fade
