import fs from 'fs'
import path from 'path'

export async function before(m, { conn }) {
  try {
    let nombreBot = global.namebot || 'Bot'
    const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
    const configPath = path.join('./JadiBots', botActual, 'config.json')

    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath))
        if (config.name) nombreBot = config.name
      } catch (err) {
        console.log('⚠️ No se pudo leer config del subbot:', err)
      }
    }

    global.rcanal = {
      key: { fromMe: false, participant: '0@s.whatsapp.net', ...(m.chat ? { remoteJid: m.chat } : {}) },
      message: {
        contactMessage: {
          displayName: nombreBot,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${nombreBot}\nORG:${global.author || 'Bot'};\nTEL;type=CELL;type=VOICE;waid=${botActual}:${botActual}\nEND:VCARD`
        }
      }
    }
  } catch (e) {
    console.log('Error al generar rcanal:', e)
  }
}