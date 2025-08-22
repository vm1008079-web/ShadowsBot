import fs from 'fs'
import path from 'path'

export async function before(m, { conn }) {
  try {
    let nombreBot = global.namebot || 'Bot'
    let bannerFinal = 'https://raw.githubusercontent.com/AdonixServices/Files/main/1754310580366-xco6p1-1754310544013-6cc3a6.jpg'

    const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
    const configPath = path.join('./JadiBots', botActual, 'config.json')

    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath))
        if (config.name) nombreBot = config.name
        if (config.banner) bannerFinal = config.banner
      } catch (err) {
        console.log('⚠️ No se pudo leer config del subbot en rcanal:', err)
      }
    }

    const canales = [global.idcanal, global.idcanal2]
    const newsletterJidRandom = canales[Math.floor(Math.random() * canales.length)]


    const isForwardedRandom = Math.random() < 0.5

    global.rcanal = {
      contextInfo: {
        isForwarded: isForwardedRandom,
        forwardingScore: 1,
        forwardedNewsletterMessageInfo: {
          newsletterJid: newsletterJidRandom,
          serverMessageId: 100,
          newsletterName: nombreBot
        }
      }
    }
  } catch (e) {
    console.log('Error al generar rcanal:', e)
  }
}