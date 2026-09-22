import gsap from 'gsap'

const logo_1 = document.querySelector('.logo-img')
const logo_2 = document.querySelector('.logo-img.is--second')

function logoMotion() {
  gsap.to(logo_1, {
    opacity: 0,
    duration: 0,
    repeatDelay: 0.8,
    ease: 'none',
    repeat: -1,
    yoyo: true,
  })
  gsap.to(logo_2, {
    opacity: 1,
    duration: 0,
    repeatDelay: 0.8,
    ease: 'none',
    repeat: -1,
    yoyo: true,
  })
}

export default logoMotion
