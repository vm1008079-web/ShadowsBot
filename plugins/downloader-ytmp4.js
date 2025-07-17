import fetch from 'node-fetch'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text) return m.reply(`📍 Ingresa el enlace de YouTube.\n\nEjemplo:\n${usedPrefix + command} https://youtube.com/watch?v=UA0YaA06Puo`)
  
  try {
    const api = `https://apiadonix.vercel.app/api/ytmp4?url=${encodeURIComponent(text)}`
    const res = await fetch(api)
    const data = await res.json()

    if (!data.status || !data.result?.download) {
      return m.reply('📍 No se pudo obtener el video. Revisa el enlace o inténtalo más tarde.')
    }

    const { title, thumbnail, quality, download } = data.result

    await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key }}) // reacción antes

    await conn.sendMessage(m.chat, {
      video: { url: download },
      mimetype: 'video/mp4',
      caption: `🎬 *Título:* ${title}\n📥 *Calidad:* ${quality}p`,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: 'Descargado con Mai',
          thumbnailUrl: thumbnail,
          sourceUrl: text,
          mediaType: 2,
          showAdAttribution: true,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('📍 No se pudo enviar el video. Puede ser por tamaño o error en la URL.')
  }
}

handler.command = ['video']
handler.help = ['ytmp4 <url>']
handler.tags = ['downloader']
handler.limit = 1
handler.premium = false

export default handler