// >>⟩ Creador original GianPoolS < github.com/GianPoolS >
// >>⟩ No quites los creditos

import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `❌ Debes proporcionar un enlace válido de Instagram.\n\n` +
      `Ejemplo:\n${usedPrefix + command} https://www.instagram.com/stories/username/123456/`
    )
  }

  try {
    await m.react('🕓')

    const response = await fetch(`https://api.dorratz.com/igdl?url=${encodeURIComponent(text)}`)
    const json = await response.json()

    if (!json.data || !Array.isArray(json.data) || json.data.length === 0) {
      return m.reply('⚠️ No se encontraron archivos para descargar.')
    }

    for (const media of json.data) {
      const fileUrl = media.url
      const fileType = fileUrl.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg'
      const thumbnailBuffer = media.thumbnail
        ? await (await fetch(media.thumbnail)).buffer()
        : null

      await conn.sendFile(
        m.chat,
        fileUrl,
        fileType === 'video/mp4' ? 'video.mp4' : 'imagen.jpg',
        `✅ Aquí tienes tu historia.`,
        m,
        false,
        {
          mimetype: fileType,
          thumbnail: thumbnailBuffer
        }
      )
    }

    m.reply('✅ Historia enviadas correctamente.')

  } catch (error) {
    console.error('Error en descarga de Instagram:', error)
    m.reply('❌ Ocurrió un error al intentar descargar el contenido. Intenta nuevamente más tarde.')
  }
}

handler.help = ['igstory <url>']
handler.tags = ['downloader']
handler.command = ['igstory', 'igstori', 'ighistoria', 'ighistorias']

export default handler
