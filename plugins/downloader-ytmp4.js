import ytSearch from 'yt-search'
import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply('📍 Escribe el nombre de un video o pega el link de YouTube')

  try {
    // Mandar reacción de carga rápido
    await conn.sendReact(m.chat, '⏳', m.key)

    let url = text
    if (!text.includes('youtube.com') && !text.includes('youtu.be')) {
      let search = await ytSearch(text)
      if (!search?.videos?.length) return m.reply('❌ No se encontraron resultados')
      url = search.videos[0].url
    }

    const apiUrl = `https://apiadonix.vercel.app/api/ytmp4?url=${encodeURIComponent(url)}`
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!json.status || !json.result?.download) throw new Error('La API no devolvió un resultado válido')

    let { title, thumbnail, download } = json.result

    // Buscar detalles con yt-search
    let videoInfo = await ytSearch(url)
    let vid = videoInfo.videos.find(v => v.url === url) || videoInfo.videos[0]

    // Caption con detalles
    let caption = `🎬 *Título:* ${title}
⏱️ *Duración:* ${vid.timestamp || 'Desconocida'}
👤 *Canal:* ${vid.author?.name || 'Desconocido'}
👀 *Vistas:* ${vid.views?.toLocaleString() || 'N/A'}
📅 *Publicado:* ${vid.ago || 'N/A'}
🔗 *URL:* ${url}`

    // Envía primero la imagen con la info (await para que llegue rápido)
    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: caption
    }, { quoted: m })

    // Luego manda el video sin await para no bloquear
    conn.sendMessage(m.chat, {
      video: { url: download },
      caption: `🎬 *${title}*`,
      mimetype: 'video/mp4'
    }, { quoted: m })

  } catch (e) {
    console.log('❌ Error al descargar el video:', e)
    m.reply('❌ Error al descargar el video')
  }
}

handler.help = ['ytmp4', 'play2', 'mp4'].map(v => v + ' <nombre o link>')
handler.tags = ['descargas']
handler.command = /^(ytmp4|play2|mp4)$/i

export default handler