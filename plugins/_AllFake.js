import fs from 'fs'
import path from 'path'

export async function before(m, { conn }) {
  try {
    // Datos base
    let nombreBot = global.namebot || 'Bot'
    let bannerFinal = './storage/img/menu.jpg'

    // Obtener datos del subbot
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

    // Crear rcanal global
    global.rcanal = {
      contextInfo: {
        isForwarded: true,
        forwardingScore: 1,
        forwardedNewsletterMessageInfo: {
          newsletterJid: global.idcanal,
          serverMessageId: 100,
          newsletterName: global.namecanal, // Nombre personalizado
        },
        externalAdReply: {
          title: nombreBot,
          body: global.author,
          thumbnailUrl: bannerFinal, // Imagen personalizada o por defecto
          sourceUrl: 'https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O',
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    }
  } catch (e) {
    console.log('Error al generar rcanal:', e)
  }
}