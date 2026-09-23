import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/src/all'

gsap.registerPlugin(ScrollTrigger)

const claimLines = [...document.querySelectorAll('.claim-h')]
const heroSection = document.querySelector('.hero__section')

const subClaimLines = [...document.querySelectorAll('.claim-sub-h')]
const claimSection = document.querySelector('.claim__section')

const imageWrappers = [
  ...document.querySelectorAll('.content-img-wrapper.is--gallery'),
]
const gallerySection = document.querySelector('.gallery__section')

const hamburgerLines = [...document.querySelectorAll('.line')]
const logoWrappers = [...document.querySelectorAll('.logo-wrapper')]

function scroll_hero() {
  claimLines.forEach((line) => {
    gsap.to(line, {
      yPercent: 100,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: heroSection,
        start: 'bottom 99%',
        end: 'bottom 60%',
        scrub: 1.2,
        // markers: true,
      },
    })
  })

  subClaimLines.forEach((line) => {
    gsap.to(line, {
      yPercent: -100,
      ease: 'power2.out',
      duration: 1.6,
      scrollTrigger: {
        trigger: claimSection,
        start: 'bottom 99%',
        // markers: true,
      },
    })
  })

  imageWrappers.forEach((w) => {
    const offset = -32 * Math.random()
    gsap.to(w, {
      yPercent: offset,
      ease: 'none',
      scrollTrigger: {
        trigger: gallerySection,
        start: 'top 99%',
        // end:'top 0%',
        scrub: true,
        // markers: true,
      },
    })
  })

  gsap.to(hamburgerLines, {
    backgroundColor: '#302f2f',
    ease: 'power2.inOut',
    scrollTrigger: {
      trigger: heroSection,
      start: 'bottom 32%',
      end: 'bottom 20%',
      scrub: 1.2,
      // markers: true,
    },
  })

  gsap.to(logoWrappers[0], {
    opacity: 0,
    ease: 'power2.inOut',
    scrollTrigger: {
      trigger: heroSection,
      start: 'bottom 32%',
      end: 'bottom 20%',
      scrub: 1.2,
      // markers: true,
    },
  })
  gsap.to(logoWrappers[1], {
    opacity: 1,
    ease: 'power2.inOut',
    scrollTrigger: {
      trigger: heroSection,
      start: 'bottom 32%',
      end: 'bottom 20%',
      scrub: 1.2,
      // markers: true,
    },
  })
}

export default scroll_hero
