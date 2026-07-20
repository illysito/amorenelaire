import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

// Shaders
// import frag from './shaders/gradient_fragShader'
import vert from './shaders/gradient_vertexShader'
// import vert_2 from './shaders/gradient_vertexShader_2'
import woodFrag from './shaders/wood_fragShader'

const UNIFORMS = {
  u_cycleSpeed: { value: 0.4 },
  u_cycleTime: { value: 0.8 },
  u_powerFactor: { value: 4.0 },
  u_blueFactor: { value: 0.4235 },
}

function isMobile() {
  return window.matchMedia('(max-width: 667px)').matches
}

async function worldHome() {
  //#region SETUP

  // -------------------------------------------------------------- Setup --------------------------------------------------------------

  const canvas = document.getElementById('canvas')

  // Scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x060606)

  let resolution = { x: 0, y: 0 }
  if (isMobile()) {
    resolution.x = canvas.clientWidth
    resolution.y = canvas.clientHeight
  } else {
    resolution.x = window.innerWidth
    resolution.y = window.innerHeight
  }

  // Camera
  const camera = new THREE.PerspectiveCamera(
    45,
    resolution.x / resolution.y,
    1,
    2000
  )
  console.log(canvas.clientHeight)
  camera.position.z = 600
  function updateCamera() {
    camera.fov =
      (2 * Math.atan(window.innerHeight / 2 / camera.position.z) * 180) /
      Math.PI
    camera.updateProjectionMatrix()
  }
  updateCamera()

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  })
  renderer.setSize(resolution.x, resolution.y)
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  //#endregion

  //#region TEXTURE
  const textureLoader = new THREE.TextureLoader()

  const woodTexture = textureLoader.load(
    'https://cdn.jsdelivr.net/gh/illysito/amorenelaire@3edaf63110d35612c3414658efee33dec37b9eef/textures/woodTexture.png'
  )

  const perlinTexture = textureLoader.load(
    'https://cdn.jsdelivr.net/gh/illysito/amorenelaire@0714d117d78e43ca5310ea45c9e93b48ece7e576/textures/perlinSquare.jpg'
  )

  woodTexture.wrapS = THREE.RepeatWrapping
  woodTexture.wrapT = THREE.RepeatWrapping
  woodTexture.colorSpace = THREE.SRGBColorSpace // if it's a color image

  //#endregion
  //#region BACKGROUND PLANE

  // -------------------------------------------------------------- Background Plane --------------------------------------------------------------

  const segments = isMobile() ? 60 : 200

  const verticalSegments = segments
  let horizontalSegments = 0

  if (isMobile()) {
    horizontalSegments = Math.round(
      (verticalSegments * window.innerWidth) / window.innerHeight
    )
  } else {
    horizontalSegments = 140
  }

  console.log('v ', verticalSegments)
  console.log('h ', horizontalSegments)

  const planeGeometry = new THREE.PlaneGeometry(
    canvas.clientWidth,
    canvas.clientWidth,
    horizontalSegments,
    verticalSegments
  )
  const seed = Math.random() * 20
  // console.log('Seed: ', seed)
  const planeMaterial = new THREE.ShaderMaterial({
    fragmentShader: woodFrag,
    vertexShader: vert,
    uniforms: {
      u_time: { value: 0 },
      u_seed: { value: seed },
      u_mouseX: { value: 0.0 },
      u_mouseY: { value: 0.0 },
      u_cycleTime: { value: UNIFORMS.u_cycleTime.value },
      u_cycleSpeed: { value: UNIFORMS.u_cycleSpeed.value },
      u_powerFactor: { value: UNIFORMS.u_powerFactor.value },
      u_blueFactor: { value: UNIFORMS.u_blueFactor.value },
      u_wood: { value: woodTexture },
      u_perlin: { value: perlinTexture },
      u_resolution: {
        value: new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
      },
    },
  })
  const plane = new THREE.Mesh(planeGeometry, planeMaterial)
  let planeScale = 1
  if (isMobile()) {
    planeScale = 1.8
  }
  // plane.rotation.x = 0.1
  plane.rotation.z = Math.PI / 2
  plane.position.z = 200
  plane.scale.set(planeScale, planeScale, planeScale)

  // Avoid the plane from going OVER the SPHERE
  plane.renderOrder = 0
  plane.material.depthWrite = false
  plane.material.depthTest = true

  scene.add(plane)

  //#endregion

  //#region LOOP

  // -------------------------------------------------------------- Loop --------------------------------------------------------------

  // normal counter
  let planeCounter = 0

  let targetX = 0
  let targetY = 0

  let currentX = 0
  let currentY = 0

  let lerpFactor = 0.002

  function lerp(start, end, t) {
    return start + (end - start) * t
  }

  function animate() {
    currentX = lerp(currentX, targetX, lerpFactor)
    currentY = lerp(currentY, targetY, lerpFactor)
    // Background plane
    planeCounter = (planeCounter + 0.002) % 5000 // safeguard to not let counter evolve endlessly
    planeMaterial.uniforms.u_time.value = planeCounter
    planeMaterial.uniforms.u_cycleSpeed.value = UNIFORMS.u_cycleSpeed.value
    planeMaterial.uniforms.u_cycleTime.value = UNIFORMS.u_cycleTime.value
    planeMaterial.uniforms.u_powerFactor.value = UNIFORMS.u_powerFactor.value
    planeMaterial.uniforms.u_blueFactor.value = UNIFORMS.u_blueFactor.value
    planeMaterial.uniforms.u_mouseX.value = currentX
    planeMaterial.uniforms.u_mouseY.value = currentY

    console.log(currentX, currentY)
    // if (!isMobile()) {
    //   plane.rotation.z = Math.PI * Math.cos(0.25 * planeCounter)
    // }

    // Render and RAF
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }
  animate()

  //#endregion

  //#region RESIZE

  // -------------------------------------------------------------- Resize --------------------------------------------------------------

  window.addEventListener('resize', () => {
    if (isMobile()) {
      resolution.x = canvas.clientWidth
      resolution.y = canvas.clientHeight
    } else {
      resolution.x = window.innerWidth
      resolution.y = window.innerHeight
    }
    camera.aspect = resolution.x / resolution.y
    camera.updateProjectionMatrix()
    renderer.setSize(resolution.x, resolution.y)
  })

  //#endregion

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX / window.innerWidth
    targetY = 1.0 - e.clientY / window.innerHeight
  })
}

export default worldHome
