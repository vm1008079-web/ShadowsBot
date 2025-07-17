import fetch from "node-fetch"
import yts from "yt-search"
import axios from "axios"

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text.trim()) return conn.reply(m.chat, `> ☁︎ Ingresa el nombre o enlace del video.`, m)

    let videoIdToFind = text.match(youtubeRegexID) || null
    let ytplay2 = await yts(videoIdToFind === null ? text : 'https://youtu.be/' + videoIdToFind[1])

    if (videoIdToFind) {
      const videoId = videoIdToFind[1]
      ytplay2 = ytplay2.all.find(item => item.videoId === videoId) || ytplay2.videos.find(item => item.videoId === videoId)
    }

    ytplay2 = ytplay2.all?.[0] || ytplay2.videos?.[0] || ytplay2
    if (!ytplay2 || ytplay2.length === 0) return m.reply('✧ No se encontraron resultados para tu búsqueda.')

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
          title: '✧ Youtube ᰔᩚ',
          body: '',
          mediaType: 1,
          previewType: 0,
          mediaUrl: url,
          sourceUrl: 'https://theadonix-api.vercel.app',
          thumbnail: thumb,
          renderLargerThumbnail: true,
        },
      },
    }

    await conn.reply(m.chat, infoMessage, m, JT)

    if (['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)) {
      try {
        const r = await fetch(`https://apiadonix.vercel.app/api/ytmp4?url=${encodeURIComponent(url)}`)
        const json = await r.json()

        if (!json?.status || !json?.result?.download) {
          throw new Error('❌ No se pudo generar el video.')
        }

        // Verificar tamaño del video antes de enviar
        const head = await axios.head(json.result.download)
        const fileSize = parseInt(head.headers['content-length'] || 0)
        const fileSizeMB = fileSize / (1024 * 1024)

        if (fileSizeMB > 100) {
          return conn.reply(m.chat, `📦 El video pesa *${fileSizeMB.toFixed(2)} MB* y es muy grande para enviarlo.`, m)
        }

        await conn.sendMessage(m.chat, {
          video: { url: json.result.download },
          mimetype: 'video/mp4',
          fileName: `${json.result.title}.mp4`,
          caption: `🎬 *${json.result.title}*\n📥 Calidad: ${json.result.quality}`
        }, { quoted: m })

      } catch (e) {
        console.error(e)
        return conn.reply(m.chat, '📍 No se pudo enviar el video. Puede ser por tamaño o error en la URL.', m)
      }

    } else {
      return conn.reply(m.chat, '✧︎ Comando no reconocido para esta función.', m)
    }

  } catch (error) {
    console.error(error)
    return m.reply(`⚠︎ Ocurrió un error: ${error.message}`)
  }
}

handler.command = handler.help = ['play2', 'ytv', 'ytmp4', 'mp4']
handler.tags = ['downloader']
handler.register = true
export default handler

function formatViews(views) {
  if (views === undefined) return "No disponible"
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)} Billones (${views.toLocaleString()})`
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)} Millones (${views.toLocaleString()})`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)} Mil (${views.toLocaleString()})`
  return views.toString()
}