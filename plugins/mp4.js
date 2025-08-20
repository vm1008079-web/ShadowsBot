//--> Hecho por Ado-rgb (github.com/Ado-rgb)
// •|• No quites créditos we

import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { promisify } from 'util'
import { pipeline } from 'stream'
import yts from 'yt-search'

const streamPipeline = promisify(pipeline)

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`🎶 Ingresa el nombre del video que deseas descargar.\n\n*Ejemplo:* ${usedPrefix + command} Alan Walker Faded`)
  }

  await m.react('🎶')

  try {
    // Buscar en YouTube
    const search = await yts(text)
    const video = search.videos[0]
    if (!video) throw new Error(`❌ No se encontró ningún resultado para: *${text}*`)

    // Datos bonitos
    const caption = `
━━━━━━━━━━━━━━
🎬 *Título:* ${video.title}
👤 *Canal:* ${video.author.name}
⏱️ *Duración:* ${video.timestamp}
👁️ *Vistas:* ${video.views.toLocaleString()}
🔗 *Link:* ${video.url}
━━━━━━━━━━━━━━
`.trim()

    // Descargar con API de neoxr
    const apiURL = `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(video.url)}&type=video&quality=360p&apikey=russellxz`
    const res = await axios.get(apiURL)

    if (!res.data.status || !res.data.data?.url) throw new Error("No se pudo obtener el video")

    const videoURL = res.data.data.url

    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

    const finalPath = path.join(tmpDir, `${Date.now()}.mp4`)

    // Descargar archivo
    const videoRes = await axios.get(videoURL, { responseType: 'stream' })
    await streamPipeline(videoRes.data, fs.createWriteStream(finalPath))

    // Enviar miniatura + info
    await conn.sendMessage(m.chat, {
      image: { url: video.thumbnail },
      caption
    }, { quoted: m })

    // Enviar video como documento
    await conn.sendMessage(m.chat, {
      document: fs.readFileSync(finalPath),
      mimetype: 'video/mp4',
      fileName: `${video.title}.mp4`
    }, { quoted: m })

    // Limpiar archivo
    fs.unlinkSync(finalPath)

    await m.react('✅')
  } catch (err) {
    console.error(err)
    await m.react('✖️')
    await m.reply(`❌ Error: ${err.message}`)
  }
}

handler.help = ['play4 <búsqueda>']
handler.tags = ['downloader', 'tools']
handler.command = ['play4']
export default handler