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
        console.log('⚠️ No se pudo leer config del subbot en rcanal:', err)
      }
    }

    const botJid = conn.user?.jid || '0000000000@s.whatsapp.net'

    global.rcanal = {
      key: {
        remoteJid: 'status@broadcast',
        participant: `${botJid.split('@')[0]}@s.whatsapp.net`,
      },
      message: {
        contactMessage: {
          displayName: nombreBot,
          vcard: `BEGIN:VCARD
VERSION:3.0
N:${nombreBot};;;;
FN:${nombreBot}
TEL;type=CELL;type=VOICE;waid=${botJid.split('@')[0]}:+${botJid.split('@')[0]}
END:VCARD`
        }
      }
    }
  } catch (e) {
    console.log('Error al generar fkontak:', e)
  }
}