import fs from 'fs'
import path from 'path'
import axios from 'axios'
import yts from 'yt-search'
import ffmpeg from 'fluent-ffmpeg'
import { promisify } from 'util'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import crypto from 'crypto'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'

const streamPipeline = promisify(require('stream').pipeline)

async function catbox(content) {
  const { ext, mime } = (await fileTypeFromBuffer(content)) || {}
  const blob = new Blob([content.buffer ? content.buffer : await content.arrayBuffer()], { type: mime })
  const formData = new FormData()
  const randomBytes = crypto.randomBytes(5).toString('hex')
  formData.append('reqtype', 'fileupload')
  formData.append('fileToUpload', blob, randomBytes + '.' + ext)

  const response = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: formData,
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)'
    }
  })

  return await response.text()
}

const handler = async (m, { conn }) => {
  if (!m.quoted) return conn.reply(m.chat, '✳️ Responde a un *audio* o *video* para identificar la canción.', m)

  const mime = m.quoted.mimetype || ''
  const isAudio = mime.startsWith('audio')
  const isVideo = mime.startsWith('video')

  if (!isAudio && !isVideo) return conn.reply(m.chat, '✳️ Responde a un *audio* o *video* válido.', m)

  const mediaMsg = m.quoted.mediaMessage?.audioMessage || m.quoted.mediaMessage?.videoMessage
  if (!mediaMsg) return conn.reply(m.chat, '❌ No se pudo acceder al contenido multimedia.', m)

  await conn.sendMessage(m.chat, { react: { text: '🔎', key: m.key } })

  try {
    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

    const ext = isAudio ? 'mp3' : 'mp4'
    const inputPath = path.join(tmpDir, `${Date.now()}.${ext}`)

    // Descargar el contenido multimedia
    const mediaType = isAudio ? 'audio' : 'video'
    const stream = await downloadContentFromMessage(mediaMsg, mediaType)
    const file = fs.createWriteStream(inputPath)
    for await (const chunk of stream) file.write(chunk)
    file.end()

    await new Promise((resolve, reject) => {
      file.on('finish', resolve)
      file.on('error', reject)
    })

    // Leer archivo para subir a catbox
    const fileBuffer = fs.readFileSync(inputPath)
    const uploadUrl = await catbox(fileBuffer)

    if (!uploadUrl || !uploadUrl.startsWith('http')) throw new Error('No se pudo subir el archivo a Catbox.')

    // Aquí sigue la lógica de la API whatmusic con uploadUrl
    const apiKey = 'GataDios'
    const apiUrl = `https://api.neoxr.eu/api/whatmusic?url=${encodeURIComponent(uploadUrl)}&apikey=${apiKey}`
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
    const rawPath = path.join(tmpDir, `${Date.now()}_raw.mp3`)
    const fixedPath = path.join(tmpDir, `${Date.now()}_fixed.mp3`)

    const audioStream = fs.createWriteStream(rawPath)
    const response = await axios.get(audioUrl, { responseType: 'stream' })
    await streamPipeline(response.data, audioStream)

    await new Promise((resolve, reject) => {
      ffmpeg(rawPath)
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .save(fixedPath)
        .on('end', resolve)
        .on('error', reject)
    })

    await conn.sendMessage(m.chat, {
      audio: fs.readFileSync(fixedPath),
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m })

    // Limpieza
    fs.unlinkSync(inputPath)
    fs.unlinkSync(rawPath)
    fs.unlinkSync(fixedPath)

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