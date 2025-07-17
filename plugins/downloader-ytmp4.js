import fetch from 'node-fetch'
import yts from 'yt-search'

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🚫 Ingresa el nombre de la canción\n\n*Ejemplo:* ${usedPrefix + command} pintao`)
  
  try {
    m.react('🎧')
    m.reply('🔍 Buscando canción, espérate un toque...')

    let search = await yts(text)
    let vid = search.videos[0]
    if (!vid) return m.reply('❌ No encontré nada con ese nombre')

    let url = `https://apiadonix.vercel.app/api/ytmp4?url=${vid.url}`
    let res = await fetch(url)
    let json = await res.json()

    if (!json.status || !json.result || !json.result.downloadUrl) {
      return m.reply('❌ No se pudo obtener el video\nIntenta con otro nombre')
    }

    await conn.sendMessage(m.chat, {
      video: { url: json.result.downloadUrl },
      caption: `🎬 *${vid.title}*\n📥 Descargado con *Adonix API*`
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('💥 Falló la descarga, intenta otra vez')
  }
}

handler.help = ['play3'].map(v => v + ' <texto>')
handler.tags = ['downloader']
handler.command = /^play3$/i

export default handler