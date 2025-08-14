import fs from 'fs'
import path from 'path'

/**
 * Genera la configuración de mensaje para canales de newsletter.
 * @param {Object} m - Mensaje recibido
 * @param {Object} conn - Conexión del bot
 */
export async function before(m, { conn }) {
  try {
    // Nombre del bot por defecto
    let nombreBot = global.namebot || 'Bot'

    // Banner por defecto
    let bannerFinal = 'https://raw.githubusercontent.com/AdonixServices/Files/main/1754310580366-xco6p1-1754310544013-6cc3a6.jpg'

    // Número del bot actual
    const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')

    // Ruta de configuración del sub-bot
    const configPath = path.join('./JadiBots', botActual, 'config.json')

    // Leer configuración si existe
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        if (config.name) nombreBot = config.name
        if (config.banner) bannerFinal = config.banner
      } catch (err) {
        console.log('⚠️ No se pudo leer config del subbot en rcanal:', err)
      }
    }

    // Selección aleatoria de canal
    const canales = [global.idcanal, global.idcanal2]
    const newsletterJidRandom = canales[Math.floor(Math.random() * canales.length)]

    // Configuración global del mensaje del canal
    global.rcanal = {
      contextInfo: {
        isForwarded: true,
        forwardingScore: 1,
        forwardedNewsletterMessageInfo: {
          newsletterJid: newsletterJidRandom,
          serverMessageId: 100,
          newsletterName: nombreBot,
        },
        // External Ad Reply profesional y ordenado
        externalAdReply: {
          title: nombreBot,                  // Título visible
          body: global.author || '',         // Autor o descripción breve
          thumbnailUrl: bannerFinal,        // Imagen del banner
          sourceUrl: 'https://myapiadonix.vercel.app', // URL a la fuente
          mediaType: 1,                      // Tipo de media (1 = link con miniatura)
          renderLargerThumbnail: true,       // Miniatura más grande y nítida
          showAdAttribution: true,           // Atributo de publicidad visible (opcional)
          previewType: 'DEFAULT'             // Tipo de vista previa, limpio y profesional
        }
      }
    }

  } catch (e) {
    console.log('❌ Error al generar rcanal:', e)
  }
}