import gsap from 'gsap'

function menu() {
  const menuButton = document.querySelector('.hamburger-wrapper')
  const menuSection = document.querySelector('.menu__section')
  const menuItems = [...document.querySelectorAll('.menu-item')]
  const logo = document.querySelector('.logo-container')
  const lines = [...document.querySelectorAll('.line')]
  const heroSection = document.querySelector('.hero__section')
  const canvasSection = document.querySelector('.canvas__section')

  let isMenuOpen = false
  let isClickEnabled = true

  function openMenu() {
    isClickEnabled = false
    gsap.to(logo, {
      opacity: 0,
      duration: 0.8,
    })
    gsap.to(menuSection, {
      yPercent: 100,
      duration: 2,
      ease: 'expo.inOut',
    })
    gsap.to([canvasSection, heroSection], {
      delay: 0.2,
      y: 10,
      duration: 1.2,
    })
    gsap.to(menuItems, {
      delay: 0.32,
      yPercent: -100,
      duration: 2,
      ease: 'power2.inOut',
      onComplete: () => {
        isClickEnabled = true
        isMenuOpen = true
      },
    })
    gsap.to(lines[0], {
      y: 3,
      rotate: 45,
      delay: 0.2,
      duration: 0.6,
      backgroundColor: '#302f2f',
    })
    gsap.to(lines[1], {
      y: -3,
      rotate: 135,
      delay: 0.2,
      duration: 0.6,
      backgroundColor: '#302f2f',
    })
  }

  function closeMenu() {
    isClickEnabled = false
    gsap.to([canvasSection, heroSection], {
      delay: 0.6,
      y: 0,
      duration: 1.2,
    })
    gsap.to(menuItems, {
      yPercent: 100,
      duration: 2,
      ease: 'power2.inOut',
    })
    gsap.to(menuSection, {
      delay: 0.2,
      yPercent: -100,
      duration: 2,
      ease: 'expo.inOut',
      onComplete: () => {
        isClickEnabled = true
        isMenuOpen = false
      },
    })
    gsap.to(logo, {
      delay: 1.2,
      opacity: 1,
      duration: 0.8,
    })
    gsap.to(lines[0], {
      y: 0,
      delay: 0.2,
      rotate: 180,
      duration: 0.6,
      backgroundColor: '#e7fe53',
    })
    gsap.to(lines[1], {
      y: 0,
      delay: 0.2,
      rotate: 180,
      duration: 0.6,
      backgroundColor: '#e7fe53',
    })
  }

  function hoverHamburgerIn() {
    gsap.to(lines[0], {
      y: 1,
      duration: 0.2,
    })
    gsap.to(lines[0], {
      y: -1,
      duration: 0.2,
    })
  }

  function hoverCrossIn() {
    gsap.to(lines[0], {
      y: 3,
      rotate: -225,
      duration: 0.6,
    })
    gsap.to(lines[1], {
      y: -3,
      rotate: 45,
      duration: 0.6,
    })
  }

  function hoverHamburgerOut() {
    gsap.to(lines[0], {
      y: 0,
      duration: 0.2,
    })
    gsap.to(lines[0], {
      y: 0,
      duration: 0.2,
    })
  }

  function hoverCrossOut() {
    gsap.to(lines[0], {
      y: 3,
      rotate: 45,
      duration: 0.6,
    })
    gsap.to(lines[1], {
      y: -3,
      rotate: 135,
      duration: 0.6,
    })
  }

  menuButton.addEventListener('click', () => {
    if (!isClickEnabled) return
    if (!isMenuOpen) {
      openMenu()
    } else {
      closeMenu()
    }
  })

  menuButton.addEventListener('mouseenter', () => {
    if (!isClickEnabled) return
    if (!isMenuOpen) {
      hoverHamburgerIn()
    } else {
      hoverCrossIn()
    }
  })

  menuButton.addEventListener('mouseleave', () => {
    if (!isClickEnabled) return
    if (!isMenuOpen) {
      hoverHamburgerOut()
    } else {
      hoverCrossOut()
    }
  })
}

export default menu
