import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

global.owner = [
  ['50493732693', 'Wirk', true]
]

global.mods = []
global.prems = []

global.namebot = '❀ Michi - AI ❀'
global.packname = '➪ Michi - AI ✦'
global.author = '© ｍᥲძᥱ ᥕі𝗍һ 𝗪𝗶𝗿𝗸 ✧'
global.moneda = '⛁ ¥ Mangos ¥'

global.libreria = 'Baileys'
global.baileys = 'V 6.7.16'
global.vs = '2.2.0'
global.sessions = 'Sessions'
global.jadi = 'JadiBots'
global.yukiJadibts = true

global.namecanal = '🥚'
global.idcanal = '120363403739366547@newsletter'
global.canal = 'https://whatsapp.com/channel/0029Vb5pM031CYoMvQi2I02D'
global.canalreg = '120363402895449162@newsletter'

global.ch = {
  ch1: '120363420941524030@newsletter'
}

global.multiplier = 69
global.maxwarn = '2'

global.rcanal = {
  contextInfo: {
    isForwarded: true,
    forwardingScore: 200,
    forwardedNewsletterMessageInfo: {
      newsletterJid: global.idcanal,
      serverMessageId: 100,
      newsletterName: global.namecanal
    }
  }
}

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("🔄 Se actualizó 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})