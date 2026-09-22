import logoMotion from './features/motion/logoMotion'
import menu from './features/motion/menu'
import scroll_hero from './features/motion/scroll_HOME'
import worldHomeAdan from './features/world/adanMoreno/world'
import worldHome from './features/world/worldHome'

import './styles/style.css'

console.log('El ammmmmmorsito esta en el aire!')

//#region Adan Moreno
function runAdanMorenoWorld() {
  worldHomeAdan()
}
//#endregion

function runHomeFunctions() {
  new worldHome()
  logoMotion()
  menu()
  scroll_hero()
}

const body = document.body

if (body.classList.contains('body__home')) runHomeFunctions()
if (body.classList.contains('adan-moreno')) runAdanMorenoWorld()
