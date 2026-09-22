import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/src/all'

gsap.registerPlugin(ScrollTrigger)

const claimLines = [...document.querySelectorAll('.claim-h')]
const heroSection = document.querySelector('.hero__section')

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
}

export default scroll_hero
