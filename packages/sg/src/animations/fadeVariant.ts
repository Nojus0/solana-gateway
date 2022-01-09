const fadeVariant = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      delay: 0
    }
  }
}

export const fadeVariantSlow = {
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: "linear"
    }
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.15,
      ease: "linear"
    }
  }
}
export default fadeVariant
