// 📁 plugins/whatmusic.js
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import yts from 'yt-search'
import ffmpeg from 'fluent-ffmpeg'
import { pipeline } from 'stream'
import { promisify } from 'util'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import quAx from '../lib/upload.js' // ajustá si tenés otra ruta

const streamPipeline = promisify(pipeline)

const handler = async (m, { conn }) => {
  const quoted = m.quoted?.message || m.quoted
  const audioMsg = quoted?.audioMessage
  const videoMsg = quoted?.videoMessage

  if (!audioMsg && !videoMsg) {
    return await conn.reply(m.chat, '✳️ Responde a un *audio* o *video* para identificar la canción.', m)
  }

  await conn.sendMessage(m.chat, { react: { text: '🔎', key: m.key } })

  try {
    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

    const fileExtension = audioMsg ? 'mp3' : 'mp4'
    const inputPath = path.join(tmpDir, `${Date.now()}_input.${fileExtension}`)

    const stream = await downloadContentFromMessage(audioMsg || videoMsg, audioMsg ? 'audio' : 'video')
    const writable = fs.createWriteStream(inputPath)
    for await (const chunk of stream) writable.write(chunk)
    writable.end()

    const uploadResponse = await quAx(inputPath)
    if (!uploadResponse.status || !uploadResponse.result.url) throw new Error('No se pudo subir el archivo.')

    const apiKey = 'GataDios'
    const apiUrl = `https://api.neoxr.eu/api/whatmusic?url=${encodeURIComponent(uploadResponse.result.url)}&apikey=${apiKey}`
    const { data } = await axios.get(apiUrl)

    if (!data.status || !data.data) throw new Error('No se pudo identificar la canción.')

    const { title, artist, album, release } = data.data
    const search = await yts(`${title} ${artist}`)
    const video = search.videos[0]
    if (!video) throw new Error('No se encontró la canción en YouTube.')

    const videoUrl = video.url
    const thumbnail = video.thumbnail
    const fduration = video.timestamp
    const views = video.views.toLocaleString()
    const channel = video.author.name || 'Desconocido'

    const banner = `
🎵 *Canción detectada:*  
╭───────────────╮  
├ 📌 *Título:* ${title}
├ 👤 *Artista:* ${artist}
├ 💿 *Álbum:* ${album}
├ 📅 *Lanzamiento:* ${release}
├ 🔎 *YouTube:* ${video.title}
├ ⏱️ *Duración:* ${fduration}
├ 👁️ *Vistas:* ${views}
├ 📺 *Canal:* ${channel}
├ 🔗 *Link:* ${videoUrl}
╰───────────────╯

⏳ *Descargando la canción...*
`

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: banner
    }, { quoted: m })

    const res = await axios.get(`https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=audio&quality=128kbps&apikey=${apiKey}`)
    if (!res.data.status || !res.data.data?.url) throw new Error('No se pudo obtener el audio.')

    const audioUrl = res.data.data.url
    const downloadPath = path.join(tmpDir, `${Date.now()}_raw.mp3`)
    const finalPath = path.join(tmpDir, `${Date.now()}_fixed.mp3`)

    const audioRes = await axios.get(audioUrl, { responseType: 'stream' })
    const audioStream = fs.createWriteStream(downloadPath)
    await streamPipeline(audioRes.data, audioStream)

    await new Promise((resolve, reject) => {
      ffmpeg(downloadPath)
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .save(finalPath)
        .on('end', resolve)
        .on('error', reject)
    })

    await conn.sendMessage(m.chat, {
      audio: fs.readFileSync(finalPath),
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m })

    fs.unlinkSync(inputPath)
    fs.unlinkSync(downloadPath)
    fs.unlinkSync(finalPath)

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (err) {
    console.error(err)
    await conn.reply(m.chat, `❌ *Error:* ${err.message}`, m)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
  }
}

handler.command = /^whatmusic$/i
handler.register = true
handler.tags = ['tools']
handler.help = ['whatmusic']
export default handler