import fetch from 'node-fetch'
import yts from 'yt-search'
import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream'
import { promisify } from 'util'
import { tmpdir } from 'os'

const streamPipeline = promisify(pipeline)

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `> ☁︎ Por favor, ingresa el nombre o enlace del video.`, m)
    }

    let videoIdToFind = text.match(youtubeRegexID)
    let ytplay2 = await yts(videoIdToFind ? `https://youtu.be/${videoIdToFind[1]}` : text)

    if (videoIdToFind) {
      const videoId = videoIdToFind[1]
      ytplay2 = ytplay2.all.find(v => v.videoId === videoId) || ytplay2.videos.find(v => v.videoId === videoId)
    }

    ytplay2 = ytplay2.all?.[0] || ytplay2.videos?.[0] || ytplay2
    if (!ytplay2) return m.reply('✧ No se encontraron resultados para tu búsqueda.')

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

    await conn.sendMessage(m.chat, {
      image: thumb,
      caption: infoMessage
    }, { quoted: m })

    if (['play', 'playaudio', 'yta', 'ytmp3'].includes(command)) {
      const res = await fetch(`https://theadonix-api.vercel.app/api/ytmp3?url=${encodeURIComponent(url)}`)
      const json = await res.json()
      if (!json?.result?.audio) throw new Error('No se pudo generar el audio.')

      const tmpPath = path.join(tmpdir(), `audio_${Date.now()}.mp3`)
      const audioStream = await fetch(json.result.audio)

      if (!audioStream.ok) throw new Error('Error al descargar el audio.')

      await streamPipeline(audioStream.body, fs.createWriteStream(tmpPath))

      const audioBuffer = fs.readFileSync(tmpPath)
      await conn.sendMessage(m.chat, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: json.result.filename || `${json.result.title}.mp3`,
        ptt: true
      }, { quoted: m })

      fs.unlinkSync(tmpPath)
    }

  } catch (err) {
    console.error(err)
    return m.reply(`⚠︎ Ocurrió un error: ${err.message}`)
  }
}

handler.command = handler.help = ['play', 'playaudio', 'yta', 'ytmp3']
handler.tags = ['downloader']
handler.register = true
export default handler

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1e9) return `${(views / 1e9).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1e6) return `${(views / 1e6).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1e3) return `${(views / 1e3).toFixed(1)}K (${views.toLocaleString()})`
  return views.toString()
}