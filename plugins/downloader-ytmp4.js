import fetch from 'node-fetch'
import yts from 'yt-search'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text) return m.reply(`✳️ Ingresa el título o link de YouTube\n\n📌 Ejemplo:\n${usedPrefix + command} bella wolfine`)
  
  m.react('🎬')
  m.reply(`📥 *Buscando el video...*`)

  let url = ''
  if (text.includes('youtube.com') || text.includes('youtu.be')) {
    url = text
  } else {
    let yt = await yts(text)
    let vid = yt.videos[0]
    if (!vid) return m.reply('❌ No se encontró el video')
    url = vid.url
  }

  try {
    let api = await fetch(`https://apiadonix.vercel.app/api/ytmp4?url=${encodeURIComponent(url)}`)
    let res = await api.json()

    if (!res.status) throw '❌ No se pudo descargar el video'

    let { title, thumbnail, download } = res.result
    let videoBuffer = await fetch(download).then(v => v.arrayBuffer())

    await conn.sendMessage(m.chat, {
      video: Buffer.from(videoBuffer),
      caption: `🎬 *${title}*`,
      jpegThumbnail: await (await fetch(thumbnail)).buffer()
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Error al descargar el video')
  }
}

handler.command = ['video']
handler.help = ['ytmp4 <texto o link>']
handler.tags = ['downloader']

export default handler