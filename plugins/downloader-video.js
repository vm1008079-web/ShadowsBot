import fetch from 'node-fetch'
import yts from 'yt-search'

const pendingJobs = {}

let handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) {
    return m.reply(`🛠 *Uso correcto:*\n${usedPrefix}play8 <nombre o enlace>\n\n💡 Ejemplo:\n${usedPrefix}play8 despacito`)
  }

  await m.react('🕓')

  // búsqueda de video
  let search = await yts(text)
  let video = search.videos[0]
  if (!video) {
    return m.reply('❌ No se encontraron resultados.')
  }

  let { url, title, timestamp: duration, views, author, thumbnail } = video
  let viewsFmt = views.toLocaleString()

  // mensaje decorado
  let caption = `
〔🎵 𝗣𝗟𝗔𝗬𝟴 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 🎥〕
┃ 📌 *Título:* ${title}
┃ ⏱ *Duración:* ${duration}
┃ 👀 *Vistas:* ${viewsFmt}
┃ 👤 *Autor:* ${author.name}
┃ 🔗 *Enlace:* ${url}

🎋 *Reacciona para descargar:*
❤️ ⟩ Audio MP3
🦞 ⟩ Video MP4
👾 ⟩ Audio como Documento
⚡ ⟩ Video como Documento
`.trim()

  // enviar preview
  let preview = await conn.sendMessage(
    m.chat,
    { image: { url: thumbnail }, caption },
    { quoted: m }
  )

  // guardamos usando stanzaId que es el real para reacciones
  let jobKey = preview.key.id
  pendingJobs[jobKey] = {
    chatId: m.chat,
    videoUrl: url,
    title,
    cmdMsg: m
  }

  await m.react('✅')

  // listener único para reacciones
  if (!conn._play8ReactionListener) {
    conn._play8ReactionListener = true
    conn.ev.on("messages.upsert", async ev => {
      for (let rx of ev.messages) {
        if (rx.message?.reactionMessage) {
          let emoji = rx.message.reactionMessage.text
          let reactedId = rx.message.reactionMessage.key.id
          let job = pendingJobs[reactedId]
          if (job) {
            if (emoji === "❤️") {
              await downloadAudio(conn, job, false, job.cmdMsg)
            } else if (emoji === "🦞") {
              await downloadVideo(conn, job, false, job.cmdMsg)
            } else if (emoji === "👾") {
              await downloadAudio(conn, job, true, job.cmdMsg)
            } else if (emoji === "⚡") {
              await downloadVideo(conn, job, true, job.cmdMsg)
            }
          }
        }
      }
    })
  }
}

async function downloadAudio(conn, job, asDoc, quoted) {
  try {
    await conn.sendMessage(job.chatId, { text: `> 🌤 Procesando audio...` }, { quoted })
    let api = `https://myapiadonix.vercel.app/api/ytmp3?url=${encodeURIComponent(job.videoUrl)}`
    let res = await fetch(api)
    let json = await res.json()
    if (!json.success) {
      return conn.sendMessage(job.chatId, { text: '❌ No se pudo obtener el audio.' }, { quoted })
    }
    let { title, download } = json.data
    await conn.sendMessage(job.chatId, {
      [asDoc ? "document" : "audio"]: { url: download },
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`
    }, { quoted })
  } catch (e) {
    await conn.sendMessage(job.chatId, { text: '❌ Error al descargar audio.' }, { quoted })
  }
}

async function downloadVideo(conn, job, asDoc, quoted) {
  try {
    await conn.sendMessage(job.chatId, { text: `> 🦖 Procesando video...` }, { quoted })
    let api = `https://myapiadonix.vercel.app/api/ytmp4?url=${encodeURIComponent(job.videoUrl)}`
    let res = await fetch(api)
    let json = await res.json()
    if (!json.success) {
      return conn.sendMessage(job.chatId, { text: '❌ No se pudo obtener el video.' }, { quoted })
    }
    let { title, download } = json.data
    await conn.sendMessage(job.chatId, {
      [asDoc ? "document" : "video"]: { url: download },
      mimetype: "video/mp4",
      fileName: `${title}.mp4`,
      caption: asDoc ? null : `*Aquí tienes tu video.*`
    }, { quoted })
  } catch (e) {
    await conn.sendMessage(job.chatId, { text: '❌ Error al descargar video.' }, { quoted })
  }
}

handler.help = ['play8']
handler.tags = ['downloader']
handler.command = ['play8']

export default handler