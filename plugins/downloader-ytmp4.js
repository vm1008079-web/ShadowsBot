import ytSearch from 'yt-search'
import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply('📍 Escribe el nombre de un video o pega el link de YouTube')

  try {
    // Buscar si es nombre o link
    let url = text
    if (!text.includes('youtube.com') && !text.includes('youtu.be')) {
      let res = await ytSearch(text)
      let vid = res.videos[0]
      if (!vid) return m.reply('❌ No encontré resultados para eso.')
      url = vid.url
    }

    // Reacción y mensaje de espera
    if (conn.sendMessage) conn.sendMessage(m.chat, { react: { text: '📥', key: m.key }})
    await m.reply('⏳ Buscando y procesando video...\n\n🔗 *URL:* ' + url)

    // Llamar a tu API
    let api = await fetch(`https://apiadonix.vercel.app/api/ytmp4?url=${encodeURIComponent(url)}`)
    let json = await api.json()

    if (!json.status) {
      return m.reply('❌ No se pudo obtener el video.\n\n' + json.message || 'Error desconocido')
    }

    let { title, thumbnail, quality, download } = json.result

    // Enviar primero miniatura y detalles
    await conn.sendFile(m.chat, thumbnail, 'thumb.jpg', `🎬 *Título:* ${title}\n🎥 *Calidad:* ${quality}`, m)

    // Luego enviar video
    await conn.sendFile(m.chat, download, 'video.mp4', null, m)

  } catch (e) {
    console.error('[❌ ERROR]', e)
    return m.reply('❌ Error al procesar el video.')
  }
}

handler.command = /^(play2|mp4|ytmp4)$/i
handler.register = true

export default handler