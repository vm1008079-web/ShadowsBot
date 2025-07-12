import fetch from 'node-fetch'
import yts from 'yt-search'
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import { pipeline } from 'stream'
import { promisify } from 'util'
import { tmpdir } from 'os'

const streamPipeline = promisify(pipeline)

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `> ☁︎ Por favor, ingresa el nombre o enlace del video.`, m)
    }

    let videoIdToFind = text.match(youtubeRegexID) || null
    let ytplay2 = await yts(videoIdToFind === null ? text : 'https://youtu.be/' + videoIdToFind[1])

    if (videoIdToFind) {
      const videoId = videoIdToFind[1]
      ytplay2 = ytplay2.all.find(item => item.videoId === videoId) || ytplay2.videos.find(item => item.videoId === videoId)
    }

    ytplay2 = ytplay2.all?.[0] || ytplay2.videos?.[0] || ytplay2
    if (!ytplay2 || ytplay2.length === 0) {
      return m.reply('✧ No se encontraron resultados para tu búsqueda.')
    }

    let { title, thumbnail, timestamp, views, ago, url, author } = ytplay2
    title = title || 'no encontrado'
    thumbnail = thumbnail || 'no encontrado'
    timestamp = timestamp || 'no encontrado'
    views = views || 'no encontrado'
    ago = ago || 'no encontrado'
    url = url || 'no encontrado'
    author = author || 'no encontrado'

    const vistas = formatViews(views)
    const canal = author.name ? author.name : 'Desconocido'
    const infoMessage = `✧ *<${title}>*\n\n` +
      ` • Canal : ${canal}\n` +
      ` • Vistas : ${vistas}\n` +
      ` • Duración : ${timestamp}\n` +
      ` • Publicado : ${ago}\n` +
      ` • Link : ${url}`

    const thumb = (await conn.getFile(thumbnail))?.data
    const JT = {
      contextInfo: {
        externalAdReply: {
          title: '✧ Music ● Youtube ᰔᩚ',
          body: '',
          mediaType: 1,
          previewType: 0,
          mediaUrl: url,
          sourceUrl: 'theadonix-api.vercel.app',
          thumbnail: thumb,
          renderLargerThumbnail: true,
        },
      },
    }

    await conn.reply(m.chat, infoMessage, m, JT)

    if (['paudio', 'yta', 'ytmp3', 'playaudio'].includes(command)) {
      try {
        const r = await fetch(`https://theadonix-api.vercel.app/api/ytmp3?url=${encodeURIComponent(url)}`)
        const json = await r.json()
        if (!json?.result?.audio) throw new Error('> No se pudo generar el audio.')

        // Bajamos el audio al tmp
        const tmpPathIn = path.join(tmpdir(), `audioin_${Date.now()}.mp3`)
        const tmpPathOut = path.join(tmpdir(), `audioout_${Date.now()}.mp3`)
        const response = await fetch(json.result.audio)
        if (!response.ok) throw new Error('Error al descargar el audio.')
        const stream = response.body
        await streamPipeline(stream, fs.createWriteStream(tmpPathIn))

        // Procesamos para darle bass con ffmpeg
        await new Promise((resolve, reject) => {
          ffmpeg(tmpPathIn)
            .audioFilter('equalizer=f=40:width_type=o:width=2:g=30')
            .audioCodec('libmp3lame')
            .audioBitrate('128k')
            .format('mp3')
            .save(tmpPathOut)
            .on('end', resolve)
            .on('error', reject)
        })

        // Leemos y enviamos el audio ya con bass
        const buffer = fs.readFileSync(tmpPathOut)
        await conn.sendMessage(m.chat, {
          audio: buffer,
          mimetype: 'audio/mpeg',
          fileName: json.result.filename || `${json.result.title}.mp3`,
          ptt: true,
        }, { quoted: m })

        // Limpieza
        fs.unlinkSync(tmpPathIn)
        fs.unlinkSync(tmpPathOut)

      } catch (e) {
        return conn.reply(m.chat, '> No se pudo enviar el audio con efecto bass. Tal vez es muy pesado.', m)
      }

    } else if (['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)) {
      try {
        const r = await fetch(`https://theadonix-api.vercel.app/api/ytmp4?url=${encodeURIComponent(url)}`)
        const json = await r.json()
        if (!json?.result?.video) throw new Error('❌ No se pudo generar el video.')

        await conn.sendMessage(m.chat, {
          video: { url: json.result.video },
          mimetype: 'video/mp4',
          fileName: json.result.filename || `${json.result.title}.mp4`,
          caption: `*「⭐」* ${json.result.title || 'Video'}`
        }, { quoted: m })

      } catch (e) {
        return conn.reply(m.chat, '📍 No se pudo enviar el video. Puede ser por tamaño o error en la URL.', m)
      }
    } else {
      return conn.reply(m.chat, '✧︎ Comando no reconocido.', m)
    }

  } catch (error) {
    return m.reply(`⚠︎ Ocurrió un error: ${error.message}`)
  }
}

handler.command = handler.help = ['play2', 'ytv', 'ytmp4', 'paudio', 'mp4']
handler.tags = ['downloader']
handler.register = true
export default handler

function formatViews(views) {
  if (views === undefined) return "No disponible"
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}Billons (${views.toLocaleString()})`
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}Millons (${views.toLocaleString()})`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}Mil (${views.toLocaleString()})`
  return views.toString()
}