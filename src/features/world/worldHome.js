import gsap from 'gsap'
import * as THREE from 'three'

import frag from './shaders/homeFrag'
import vert from './shaders/vertexShader'

const canvas = document.getElementById('three-canvas')
const wrapper = document.querySelector('.canvas')
const dpr = Math.min(window.devicePixelRatio || 1, 2)

function githubToJsDelivr(permalink) {
  return permalink
    .replace('github.com', 'cdn.jsdelivr.net/gh')
    .replace('/blob/', '@')
}

export default class WorldHome {
  constructor() {
    this.lastTime = performance.now()
    this.frameCount = 0

    this.time = 0
    this.scrollValue = 0
    this.mouseX = 0
    this.mouseY = 0
    this.targetMouseX = 0
    this.targetMouseY = 0
    this.lerpFactor = 0.05
    this.isScrolling = false
    this.isResizing = false

    // sizes
    this.w = canvas.clientWidth
    this.h = canvas.clientHeight

    // scene
    this.scene = new THREE.Scene()

    // camera
    this.fov = 45
    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      this.w / this.h,
      100,
      2000
    )
    this.camera.position.z = 600
    this.updateCamera()

    // images
    this.domImageWrappers = [
      ...document.querySelectorAll('.content-img-wrapper'),
    ]
    this.domImageWrappers.forEach((w) => {
      gsap.set(w, {
        opacity: 0,
      })
    })

    // renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      // antialias: true,
      alpha: true,
    })
    this.renderer.setSize(this.w, this.h)
    this.renderer.setPixelRatio(dpr)
    this.renderer.setClearColor(0x000000, 0)

    this.resize()
    this.init()
  }

  lerp(start, end, t) {
    return start + (end - start) * t
  }

  async init() {
    // await this.loadTextures()
    // await this.addImages()
    // await this.addPlane()
    // this.setupObserver()
    this.setupListeners()
    // this.setImagePositions()
    // this.addObjects()
    this.render()
    this.resize()
    // this.gsap()

    setTimeout(async () => {
      await this.addImages()
      // this.setupObserver()
      this.setImagePositions()
      this.resize()
    }, 600) // tweak: 300–1500ms depending on feel
  }

  setupObserver() {
    this.io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const item = entry.target.__threeItem
          item.isVisible = entry.isIntersecting
          item.mesh.visible = entry.isIntersecting

          // optional: if it just became visible, you can force a one-time rect update
          if (entry.isIntersecting) {
            item.needsRect = true
            const dly = 0.2 * Math.random()
            // IMAGE LIQUID REVEAL
            gsap.to(item.mesh.material.uniforms.u_scroll, {
              delay: 0.2 + dly,
              value: 2.0,
              duration: 1.2,
              ease: 'power2.inOut',
            })
          }
        }
      },
      {
        root: null,
        rootMargin: '20px', // pre-activate before it appears
        threshold: 0,
      }
    )

    this.imageStore.forEach((item) => {
      item.img.__threeItem = item
      this.io.observe(item.img)
    })
  }

  setupListeners() {
    let scrollTimeout
    let resizeTimeout
    // window.addEventListener('resize', this.resize.bind(this))
    window.addEventListener('resize', () => {
      this.resize()
      this.isResizing = true

      clearTimeout(resizeTimeout)

      resizeTimeout = setTimeout(() => {
        this.isResizing = false
        // run heavy resize logic once
      }, 100) // adjust if needed
    })

    window.addEventListener(
      'scroll',
      () => {
        this.isScrolling = true

        clearTimeout(scrollTimeout)

        this.scrollValue = window.scrollY * 0.0005

        scrollTimeout = setTimeout(() => {
          this.isScrolling = false
        }, 100) // 100ms after last scroll event = stopped
      },
      { passive: true }
    )

    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = (0.1 * e.clientX) / window.innerWidth
      this.targetMouseY = (0.1 * e.clientY) / window.innerHeight
    })
  }

  resize() {
    this.w = wrapper.clientWidth
    this.h = wrapper.clientHeight
    this.renderer.setPixelRatio(dpr)
    const pr = this.renderer.getPixelRatio()

    // update canvas resolutions (only need it for the big one, the others are always squares)
    if (this.mainMesh) {
      this.mainMesh.material.uniforms.u_resolution.value.set(
        this.w * pr,
        this.h * pr
      )
      this.mainMesh.scale.set(this.w, this.h, 1)
    }

    if (this.imageStore) {
      this.imageStore.forEach((item) => {
        const rect = item.img.getBoundingClientRect()
        item.mesh.material.uniforms.u_resolution.value.set(
          rect.width * pr,
          rect.height * pr
        )
        console.log('res:', item.mesh.material.uniforms.u_resolution.value)
        item.mesh.scale.set(rect.width, rect.height, 1)
      })
    }

    this.renderer.setSize(this.w, this.h)
    this.camera.aspect = this.w / this.h
    this.updateCamera()
    this.camera.updateProjectionMatrix()
  }

  render() {
    this.time += 0.5

    this.mouseX = this.lerp(this.mouseX, this.targetMouseX, this.lerpFactor)
    this.mouseY = this.lerp(this.mouseY, this.targetMouseY, this.lerpFactor)

    // FPS
    this.frameCount++
    const now = performance.now()
    if (now - this.lastTime >= 1000) {
      console.log('FPS:', this.frameCount)
      this.frameCount = 0
      this.lastTime = now
    }

    // time for main canvas
    if (this.imageStore) {
      this.imageStore.forEach((img) => {
        img.mesh.material.uniforms.u_time.value = 0.002 * this.time
        img.mesh.material.uniforms.u_scroll.value = this.scrollValue
        img.mesh.material.uniforms.u_mouseX.value = this.mouseX
        img.mesh.material.uniforms.u_mouseY.value = this.mouseY
      })
    }
    // time for image canvas
    if ((this.isScrolling || this.isResizing) && this.imageStore) {
      this.setImagePositions()
    }
    // render & loop
    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(this.render.bind(this))
  }

  updateCamera() {
    this.fov =
      (2 * Math.atan(window.innerHeight / 2 / this.camera.position.z) * 180) /
      Math.PI
    this.camera.fov = this.fov
    // console.log(this.camera.fov)
  }

  // main plane
  async loadMainTextures() {
    const loader = new THREE.TextureLoader()
    const perlin = await loader.loadAsync(
      // githubToJsDelivr(
      //   'https://github.com/illysito/peso/blob/0294519c879b1beb194295665bea435293f643fa/imgs/perlinSquare.jpg'
      // )
      githubToJsDelivr(
        'https://github.com/illysito/peso/blob/59ffea901601114acb6e3a6daaea6ff12c9721c5/imgs/displacementSquare4.jpg'
      )
    )

    return perlin
  }

  // images
  async loadTextures() {
    const loader = new THREE.TextureLoader()
    const perlin = await loader.loadAsync(
      githubToJsDelivr(
        'https://github.com/illysito/peso/blob/0294519c879b1beb194295665bea435293f643fa/imgs/perlinSquare.jpg'
      )
    )

    const texturesFront = await Promise.all([
      // Pau
      loader.loadAsync(
        githubToJsDelivr(
          'https://github.com/illysito/amorenelaire/blob/a47abeea57421b9e374b64aa899759c80c8b164a/textures/PaulaAzul.webp'
        )
      ),
      loader.loadAsync(
        githubToJsDelivr(
          'https://github.com/illysito/amorenelaire/blob/44eca4a8fb8e32abfba307dd01b8e441d4b04c8b/textures/IMG_0045.webp'
        )
      ),
      loader.loadAsync(
        githubToJsDelivr(
          'https://github.com/illysito/amorenelaire/blob/44eca4a8fb8e32abfba307dd01b8e441d4b04c8b/textures/IMG_7675.webp'
        )
      ),
      loader.loadAsync(
        githubToJsDelivr(
          'https://github.com/illysito/amorenelaire/blob/44eca4a8fb8e32abfba307dd01b8e441d4b04c8b/textures/BODA_M%26J-590.webp'
        )
      ),
    ])
    return { perlin, texturesFront }
  }

  async addImages() {
    const { perlin, texturesFront } = await this.loadTextures()

    const parameters = [
      {
        amp: 18,
        freq: 6,
        offset: 0.04,
        offsetFactor: 0.8,
        edgeIsDown: true,
        needsDistortion: true,
      },
      {
        amp: 2,
        freq: 3,
        offset: 1.14,
        offsetFactor: 2.52,
        edgeIsDown: false,
        needsDistortion: false,
      },
      {
        amp: 3,
        freq: 3,
        offset: 1.14,
        offsetFactor: 2.52,
        edgeIsDown: false,
        needsDistortion: false,
      },
      {
        amp: 2.5,
        freq: 3,
        offset: 1.14,
        offsetFactor: 2.52,
        edgeIsDown: false,
        needsDistortion: false,
      },
    ]

    this.imageStore = this.domImageWrappers.map((img, index) => {
      const actualImg = img.querySelector('img')
      const imageResolution = new THREE.Vector2(
        actualImg.naturalWidth,
        actualImg.naturalHeight
      )
      console.log('image RES:', imageResolution.x, imageResolution.y)

      let bounds = img.getBoundingClientRect()

      let seed = Math.random() * 20

      // create a mesh for each image
      // let geometry = new THREE.PlaneGeometry(bounds.width, bounds.height, 1, 1)
      let geometry = new THREE.PlaneGeometry(1, 1, 1, 1)
      let material = new THREE.ShaderMaterial({
        fragmentShader: frag,
        vertexShader: vert,
        uniforms: {
          u_time: { value: 0 },
          u_resolution: { value: new THREE.Vector2(1, 1) },
          u_imgResolution: {
            value: new THREE.Vector2(imageResolution.x, imageResolution.y),
          },
          u_seed: { value: seed },
          u_offset: { value: parameters[index].offset },
          u_offsetFactor: { value: parameters[index].offsetFactor },
          u_amp: { value: parameters[index].amp },
          u_freq: { value: parameters[index].freq },
          u_edgeIsDown: { value: parameters[index].edgeIsDown },
          u_needsDistortion: { value: parameters[index].needsDistortion },
          u_scroll: { value: 0.0 },
          u_mouseX: { value: 0.0 },
          u_mouseY: { value: 0.0 },
          u_image_1: { value: texturesFront[index] },
          u_displacement: { value: perlin },
        },
      })
      // material.transparent = true
      let mesh = new THREE.Mesh(geometry, material)

      this.scene.add(mesh)

      return {
        img: img,
        mesh: mesh,
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height,
        isVisible: true,
      }
    })

    this.renderer.compile(this.scene, this.camera)
    this.renderer.render(this.scene, this.camera)
  }

  setImagePositions() {
    // console.log(this.imageStore)
    this.imageStore.forEach((item) => {
      if (!item.isVisible) return
      const rect = item.img.getBoundingClientRect()

      item.mesh.position.x = rect.left - this.w / 2 + rect.width / 2 // operating with img width and screen width shift coord system from DOM to three.js
      item.mesh.position.y = -rect.top + this.h / 2 - rect.height / 2
    })
  }

  // gsap
  // gsap() {
  //   const dur = 1.2
  //   const offsetColors = [0.0, 0.0, 0.0]

  //   this.domImageWrappers.forEach((img, index) => {
  //     img.addEventListener('mouseenter', () => {
  //       const randomIndex = Math.floor(Math.random() * offsetColors.length)
  //       const randomOffset = 0.02 + Math.random() * 0.08
  //       offsetColors[randomIndex] = randomOffset
  //       const tl = gsap.timeline({
  //         onComplete: () => {
  //           offsetColors.forEach((_, i) => {
  //             offsetColors[i] = 0.0
  //           })
  //         },
  //       })

  //       tl.to(this.imageStore[index].mesh.material.uniforms.u_offset, {
  //         value: 1,
  //         duration: dur,
  //         ease: 'power3.inOut',
  //       })
  //         .to(
  //           this.imageStore[index].mesh.material.uniforms.u_red,
  //           {
  //             value: offsetColors[0],
  //             duration: dur / 2,
  //             ease: 'power2.inOut',
  //             onComplete: () => {
  //               gsap.to(this.imageStore[index].mesh.material.uniforms.u_red, {
  //                 value: 0,
  //                 duration: dur / 2,
  //                 ease: 'power2.inOut',
  //               })
  //             },
  //           },
  //           '<0'
  //         )
  //         .to(
  //           [this.imageStore[index].mesh.material.uniforms.u_green],
  //           {
  //             value: offsetColors[1],
  //             duration: dur / 2,
  //             ease: 'power2.inOut',
  //             onComplete: () => {
  //               gsap.to(this.imageStore[index].mesh.material.uniforms.u_green, {
  //                 value: 0,
  //                 duration: dur / 2,
  //                 ease: 'power2.inOut',
  //               })
  //             },
  //           },
  //           '<0'
  //         )
  //         .to(
  //           this.imageStore[index].mesh.material.uniforms.u_blue,
  //           {
  //             value: offsetColors[2],
  //             duration: dur / 2,
  //             ease: 'power2.inOut',
  //             onComplete: () => {
  //               gsap.to(this.imageStore[index].mesh.material.uniforms.u_blue, {
  //                 value: 0,
  //                 duration: dur / 2,
  //                 ease: 'power2.inOut',
  //               })
  //             },
  //           },
  //           '<0'
  //         )
  //     })

  //     img.addEventListener('mouseleave', () => {
  //       const randomIndex = Math.floor(Math.random() * offsetColors.length)
  //       offsetColors[randomIndex] = 0.1
  //       const tl = gsap.timeline({
  //         onComplete: () => {
  //           offsetColors.forEach((_, i) => {
  //             offsetColors[i] = 0.0
  //           })
  //         },
  //       })
  //       tl.to(this.imageStore[index].mesh.material.uniforms.u_offset, {
  //         value: 0,
  //         duration: dur,
  //         ease: 'power3.inOut',
  //       })
  //         .to(
  //           this.imageStore[index].mesh.material.uniforms.u_red,
  //           {
  //             value: offsetColors[0],
  //             duration: dur / 2,
  //             ease: 'power2.inOut',
  //             onComplete: () => {
  //               gsap.to(this.imageStore[index].mesh.material.uniforms.u_red, {
  //                 value: 0,
  //                 duration: dur / 2,
  //                 ease: 'power2.inOut',
  //               })
  //             },
  //           },
  //           '<0'
  //         )
  //         .to(
  //           this.imageStore[index].mesh.material.uniforms.u_green,
  //           {
  //             value: offsetColors[1],
  //             duration: dur / 2,
  //             ease: 'power2.inOut',
  //             onComplete: () => {
  //               gsap.to(this.imageStore[index].mesh.material.uniforms.u_green, {
  //                 value: 0,
  //                 duration: dur / 2,
  //                 ease: 'power2.inOut',
  //               })
  //             },
  //           },
  //           '<0'
  //         )
  //         .to(
  //           this.imageStore[index].mesh.material.uniforms.u_blue,
  //           {
  //             value: offsetColors[2],
  //             duration: dur / 2,
  //             ease: 'power2.inOut',
  //             onComplete: () => {
  //               gsap.to(this.imageStore[index].mesh.material.uniforms.u_blue, {
  //                 value: 0,
  //                 duration: dur / 2,
  //                 ease: 'power2.inOut',
  //               })
  //             },
  //           },
  //           '<0'
  //         )
  //     })
  //   })

  //   // navLink.addEventListener('mouseenter', () => {
  //   //   gsap.to(this.mainMesh.material.uniforms.u_offset, {
  //   //     value: 1,
  //   //     duration: 1.4 * dur,
  //   //     ease: 'power2.inOut',
  //   //   })
  //   // })
  //   // navLink.addEventListener('mouseleave', () => {
  //   //   gsap.to(this.mainMesh.material.uniforms.u_offset, {
  //   //     value: 0,
  //   //     duration: 1.4 * dur,
  //   //     ease: 'power2.inOut',
  //   //   })
  //   // })
  // }
}
