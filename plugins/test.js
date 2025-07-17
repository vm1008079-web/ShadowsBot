// creado por github.com/Ado-rgb 💻
import fetch from 'node-fetch'
import yts from 'yt-search'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { tmpdir } from 'os'
import { pipeline } from 'stream'

const streamPipeline = promisify(pipeline)

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

const handler = async (m, { conn, text, command, __dirname }) => {
  try {
    if (!text.trim()) return m.reply('☁︎ Escribe el nombre o link del video maje')

    let videoIdToFind = text.match(youtubeRegexID)
    let ytplay2 = await yts(videoIdToFind ? `https://youtu.be/${videoIdToFind[1]}` : text)

    if (videoIdToFind) {
      const videoId = videoIdToFind[1]
      ytplay2 = ytplay2.all.find(v => v.videoId === videoId) || ytplay2.videos.find(v => v.videoId === videoId)
    }

    ytplay2 = ytplay2.all?.[0] || ytplay2.videos?.[0] || ytplay2
    if (!ytplay2) return m.reply('✧ No encontré nada bro')

    const { title, thumbnail, timestamp, views, ago, url, author } = ytplay2
    const vistas = formatViews(views)
    const canal = author?.name || 'Desconocido'

    const infoMessage = `✧ *<${title}>*\n\n` +
      `✦ Canal : ${canal}\n` +
      `✦ Vistas : ${vistas}\n` +
      `✦ Duración : ${timestamp}\n` +
      `✦ Publicado : ${ago}\n` +
      `✦ Link : ${url}`

    const thumb = (await conn.getFile(thumbnail))?.data
    await conn.sendMessage(m.chat, { image: thumb, caption: infoMessage }, { quoted: m })

    if (['play', 'playaudio', 'yta', 'ytmp3'].includes(command)) {
      await conn.sendMessage(m.chat, {
        react: { text: '🔄', key: m.key }
      })

      const res = await fetch(`https://apiadonix.vercel.app/api/ytmp3?url=${encodeURIComponent(url)}`)
      const json = await res.json()

      if (!json?.result?.audio) throw new Error('No se pudo obtener el audio')

      const tmpDir = path.join(__dirname, '../tmp')
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

      const tempFilePath = path.join(tmpDir, `audio_${Date.now()}.mp3`)
      const audioStream = await fetch(json.result.audio)
      if (!audioStream.ok) throw new Error('Error al descargar el audio')

      await streamPipeline(audioStream.body, fs.createWriteStream(tempFilePath))

      await conn.sendMessage(m.chat, {
        audio: fs.readFileSync(tempFilePath),
        mimetype: 'audio/mpeg',
        fileName: json.result.filename || `${json.result.title}.mp3`,
        ptt: false,
        caption: `✅ Audio descargado sin editar`
      }, { quoted: m })

      fs.unlinkSync(tempFilePath)

      await conn.sendMessage(m.chat, {
        react: { text: '✅', key: m.key }
      })
    }

  } catch (err) {
    console.error('[YT-DOWNLOAD]', err)
    await conn.sendMessage(m.chat, {
      text: `❌ Error: ${err.message}`,
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    })
  }
}

handler.command = ['play', 'playaudio', 'yta']
handler.help = ['play', 'playaudio', 'yta', 'ytmp3']
handler.tags = ['downloader']
export default handler

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1e9) return `${(views / 1e9).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1e6) return `${(views / 1e6).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1e3) return `${(views / 1e3).toFixed(1)}K (${views.toLocaleString()})`
  return views.toString()
}