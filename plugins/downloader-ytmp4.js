import fetch from 'node-fetch'
import ytSearch from 'yt-search'

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply('🎵 Ingresa el nombre del video\n\n📌 *Ejemplo:* .play3 bella wolfine')

  m.react('🎶')

  try {
    // 🔍 Buscar directo en YouTube con yt-search
    const { videos } = await ytSearch(text)
    if (!videos.length) return m.reply('❌ No se encontró el video.')

    const video = videos[0]
    const url = video.url

    // 🔽 Descargar con tu API
    const res = await fetch(`https://apiadonix.vercel.app/api/ytmp4?url=${encodeURIComponent(url)}`)
    const json = await res.json()

    if (!json.status || !json.result?.download) {
      return m.reply('📍 No se pudo enviar el video. Puede ser por tamaño o error en la URL.')
    }

    const { title, thumbnail, quality, download } = json.result

    await conn.sendMessage(m.chat, {
      video: { url: download },
      caption: `🎬 *${title}*\n📥 Calidad: ${quality}p\n\n🌐 By: @${m.sender.split('@')[0]}`,
      jpegThumbnail: await (await fetch(thumbnail)).buffer()
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('💥 Ocurrió un error al procesar tu solicitud.')
  }
}

handler.command = ['play3']
handler.help = ['play3 <nombre>']
handler.tags = ['downloader']

export default handler