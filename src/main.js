import logoMotion from './features/motion/logoMotion'
import worldHomeAdan from './features/world/adanMoreno/world'
// import worldHome from './features/world/world'

import './styles/style.css'

console.log('El ammmmmmorsito esta en el aire!')

//#region Adan Moreno
function runAdanMorenoWorld() {
  worldHomeAdan()
}
//#endregion

function runHomeFunctions() {
  // worldHome()
  logoMotion()
}

const body = document.body

if (body.classList.contains('body__home')) runHomeFunctions()
if (body.classList.contains('adan-moreno')) runAdanMorenoWorld()
