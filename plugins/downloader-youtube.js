// ✰ Creado y editado para Michi wa ✰
// Dev: Erenxszy ⚔︎
// github.com/Ado-rgb 💻

import fetch from 'node-fetch'
import ytSearch from 'yt-search'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { pipeline } from 'stream'

const streamPipeline = promisify(pipeline)
const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

let handler = async (m, { conn, text, command, __dirname }) => {
  if (!text?.trim()) return m.reply('✰ *Por favor escribe el nombre o link del video* ❀')

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    // Determinar si es link o búsqueda
    let url = text
    if (!text.includes('youtube.com') && !text.includes('youtu.be')) {
      let search = await ytSearch(text)
      if (!search?.videos?.length) return m.reply('✦ *No se encontraron resultados* ✰')
      url = search.videos[0].url
    }

    // Obtener detalles para la vista previa
    const infoRes = await ytSearch(url)
    const videoInfo = infoRes.videos[0]
    if (!videoInfo) return m.reply('❀ *No encontré detalles del video* ✦')

    const { title, thumbnail, timestamp, views, ago, author } = videoInfo
    const vistas = formatViews(views)
    const canal = author?.name || 'Desconocido'

    const infoCaption =
      `✦ *${title}* ✰\n\n` +
      `» *Canal:* ${canal}\n` +
      `» *Vistas:* ${vistas}\n` +
      `» *Duración:* ${timestamp}\n` +
      `» *Publicado:* ${ago}\n` +
      `» *Link:* ${url}\n\n` +
      `❀ *Michi wa* ✦`

    await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: infoCaption }, { quoted: m })

    // Descargar según comando
    if (['play', 'playaudio', 'yta', 'ytmp3'].includes(command)) {
      const audioRes = await fetch(`https://apiadonix.vercel.app/api/ytmp3?url=${encodeURIComponent(url)}`)
      const audioJson = await audioRes.json()
      if (!audioJson?.result?.audio) throw new Error('La API no devolvió un audio válido')

      const tmpDir = path.join(__dirname, '../tmp')
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

      const tempFilePath = path.join(tmpDir, `audio_${Date.now()}.mp3`)
      const audioStream = await fetch(audioJson.result.audio)
      if (!audioStream.ok) throw new Error('Error al descargar el audio')

      await streamPipeline(audioStream.body, fs.createWriteStream(tempFilePath))

      await conn.sendMessage(m.chat, {
        audio: fs.readFileSync(tempFilePath),
        mimetype: 'audio/mpeg',
        fileName: audioJson.result.filename || `${audioJson.result.title}.mp3`,
        ptt: false,
        caption: `✦ *Descarga Completa* ✰\n\n❀ *${title}*`
      }, { quoted: m })

      fs.unlinkSync(tempFilePath)
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } else if (['ytvx', 'play2', 'mp4'].includes(command)) {
      const videoRes = await fetch(`https://apiadonix.vercel.app/api/ytmp4?url=${encodeURIComponent(url)}`)
      const videoJson = await videoRes.json()

      if (!videoJson.status || !videoJson.result?.download) {
        throw new Error('La API no devolvió un video válido')
      }

      await conn.sendMessage(m.chat, {
        video: { url: videoJson.result.download },
        caption: `✰ *${videoJson.result.title}* ❀`,
        mimetype: 'video/mp4'
      }, { quoted: m })

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    }

  } catch (err) {
    console.error('[MICHI-YT]', err)
    m.reply(`✰ *Error:* ${err.message} ✦`)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
  }
}

handler.command = ['play', 'playaudio', 'yta', 'ytmp3', 'ytvx', 'play2', 'mp4']
handler.help = ['play', 'playaudio', 'yta', 'ytmp3', 'ytvx', 'play2', 'mp4']
handler.tags = ['descargas']

export default handler

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1e9) return `${(views / 1e9).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1e6) return `${(views / 1e6).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1e3) return `${(views / 1e3).toFixed(1)}K (${views.toLocaleString()})`
  return views.toString()
}