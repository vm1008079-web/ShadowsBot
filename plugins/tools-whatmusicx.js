//--> Hecho por Ado-rgb (github.com/Ado-rgb)
// 🍂 WHATMUSIC TOOL 🎶
// •|• No quites créditos..

import fs from 'fs'
import path from 'path'
import axios from 'axios'
import ffmpeg from 'fluent-ffmpeg'
import FormData from 'form-data'
import { promisify } from 'util'
import { pipeline } from 'stream'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import yts from 'yt-search'

const streamPipeline = promisify(pipeline)

const handler = async (msg, { conn }) => {
  const rawID = conn.user?.id || ""
  const subbotID = rawID.split(":")[0] + "@s.whatsapp.net"

  const prefixPath = path.resolve("prefixes.json")
  let prefixes = {}
  if (fs.existsSync(prefixPath)) {
    prefixes = JSON.parse(fs.readFileSync(prefixPath, "utf-8"))
  }
  const usedPrefix = prefixes[subbotID] || "."

  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
  if (!quotedMsg || (!quotedMsg.audioMessage && !quotedMsg.videoMessage)) {
    await conn.sendMessage(msg.key.remoteJid, {
      text: `🌤️ Responde a una *nota de voz*, *audio* o *video* para identificar la canción.`
    }, { quoted: msg })
    return
  }

  
  let fkontak = {
    key: { participant: "0@s.whatsapp.net" },
    message: {
      contactMessage: {
        displayName: "🍂 WHATMUSIC TOOL 🧃",
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:WHATMUSIC TOOL\nORG:WHATMUSIC TOOL\nTEL;type=CELL;type=VOICE;waid=${msg.sender.replace(/[^0-9]/g, '')}:${msg.sender}\nEND:VCARD`
      }
    }
  }

  await conn.sendMessage(msg.key.remoteJid, {
    react: { text: '🕓', key: msg.key }
  })

  try {
    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)
    const fileExt = quotedMsg.audioMessage ? 'mp3' : 'mp4'
    const inputPath = path.join(tmpDir, `${Date.now()}.${fileExt}`)

    const stream = await downloadContentFromMessage(
      quotedMsg.audioMessage || quotedMsg.videoMessage,
      quotedMsg.audioMessage ? 'audio' : 'video'
    )
    const writer = fs.createWriteStream(inputPath)
    for await (const chunk of stream) writer.write(chunk)
    writer.end()

    const form = new FormData()
    form.append('file', fs.createReadStream(inputPath))
    form.append('expiry', '3600')

    const upload = await axios.post('https://cdn.russellxz.click/upload.php', form, {
      headers: form.getHeaders()
    })

    if (!upload.data || !upload.data.url) throw new Error('No se pudo subir el archivo')
    const fileUrl = upload.data.url

    const apiURL = `https://api.neoxr.eu/api/whatmusic?url=${encodeURIComponent(fileUrl)}&apikey=russellxz`
    const res = await axios.get(apiURL)
    if (!res.data.status || !res.data.data) throw new Error('No se pudo identificar la canción')

    const { title, artist, album, release } = res.data.data
    const ytSearch = await yts(`${title} ${artist}`)
    const video = ytSearch.videos[0]
    if (!video) throw new Error("No se encontró la canción en YouTube")

    const banner = `━━━━━━━━━━
📌 *Título:* ${title}
👤 *Artista:* ${artist}
💿 *Álbum:* ${album}
📅 *Lanzamiento:* ${release}

> 🔎 *Coincidencia en YouTube:* ${video.title}
> ⏱️ *Duración:* ${video.timestamp}
> 👁️ *Vistas:* ${video.views.toLocaleString()}
> 📺 *Canal:* ${video.author.name}
> 🔗 *Link:* ${video.url}`

    await conn.sendMessage(msg.key.remoteJid, {
      image: { url: video.thumbnail },
      caption: banner
    }, { quoted: fkontak })

    const ytRes = await axios.get(`https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(video.url)}&type=audio&quality=128kbps&apikey=russellxz`)
    const audioURL = ytRes.data.data.url

    const rawPath = path.join(tmpDir, `${Date.now()}_raw.m4a`)
    const finalPath = path.join(tmpDir, `${Date.now()}_final.mp3`)

    const audioRes = await axios.get(audioURL, { responseType: 'stream' })
    await streamPipeline(audioRes.data, fs.createWriteStream(rawPath))

    await new Promise((resolve, reject) => {
      ffmpeg(rawPath)
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .save(finalPath)
        .on('end', resolve)
        .on('error', reject)
    })

    await conn.sendMessage(msg.key.remoteJid, {
      audio: fs.readFileSync(finalPath),
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: fkontak })

    fs.unlinkSync(inputPath)
    fs.unlinkSync(rawPath)
    fs.unlinkSync(finalPath)

    await conn.sendMessage(msg.key.remoteJid, {
      react: { text: '✅', key: msg.key }
    })

  } catch (err) {
    console.error(err)
    await conn.sendMessage(msg.key.remoteJid, {
      text: `❌ *Error:* ${err.message}`
    }, { quoted: msg })
    await conn.sendMessage(msg.key.remoteJid, {
      react: { text: '❌', key: msg.key }
    })
  }
}

handler.command = ['whatmusic']
export default handler