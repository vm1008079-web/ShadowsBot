import fetch from 'node-fetch'
import yts from 'yt-search'

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply('🔍 Ingresa el nombre de un video para buscar.')

  try {
    // Buscar en YouTube
    let search = await yts(text)
    let video = search.videos[0]
    if (!video) return m.reply('❌ No encontré el video.')

    let ytUrl = video.url
    let title = video.title

    // Llamar tu API personalizada
    let api = `https://apiadonix.vercel.app/api/ytmp4?url=${encodeURIComponent(ytUrl)}`
    let res = await fetch(api)
    let json = await res.json()

    if (!json.status) return m.reply('❌ Error al obtener el video.')

    let { download, thumbnail, quality } = json.result

    await conn.sendMessage(m.chat, {
      video: { url: download },
      caption: `✅ *${title}*\n📥 Calidad: ${quality}`,
      thumbnail: await (await fetch(thumbnail)).buffer()
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Error inesperado al procesar.')
  }
}

handler.command = /^play3$/i
handler.help = ['play3 <nombre>']
handler.tags = ['descargas']
export default handler