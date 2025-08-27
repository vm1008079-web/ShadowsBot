import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

// Propietarios
global.owner = [
  ['5356795360', 'un random (Propietario)', true],
  ['5214427727370','OmegaPhantom(Copropietario)'],
  ['584160592710', 'Kaede Zuzu',],
  ['5214428809790', 'Persona que no conozco',],
  ['103419121512549', 'lid1'],
]

// Otros ajustes de permisos
global.mods = []
global.suittag = ['5214428809790']
global.prems = []

global.namebot = '𝖠𝖨 | SHADOWS'
global.packname = 'SHADOWS ° 𝖶𝖺 👻'
global.author = 'OMEGA | © 2025 😈'
global.moneda = 'dark coin'



global.libreria = 'Baileys'
global.baileys = 'V 6.7.16'
global.vs = '2.2.0'
global.sessions = 'Sessions'
global.jadi = 'JadiBots'
global.yukiJadibts = true

global.namecanal = '❇️'
global.idcanal = '120363403739366547@newsletter'
global.idcanal2 = '120363403739366547@newsletter'
global.canal = 'https://whatsapp.com/channel/0029Vb5pM031CYoMvQi2I02D'
global.canalreg = '120363402895449162@newsletter'

global.ch = {
  ch1: '120363420941524030@newsletter'
}

global.multiplier = 69
global.maxwarn = 2

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("🔄 Se actualizó 'config.js'"))
  import(`file://${file}?update=${Date.now()}`)
})
