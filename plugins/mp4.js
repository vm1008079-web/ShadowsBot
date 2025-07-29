import ytdl from 'ytdl-core'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('❌ Escribe el enlace del video')

  try {
    let info = await ytdl.getInfo(text)
    let { title, lengthSeconds, ownerChannelName } = info.videoDetails
    let duration = parseInt(lengthSeconds)
    if (duration > 3600) return m.reply('⏳ El video pasa de 1 hora')

    let calidad = '360p' // puedes usar 480p o 720p según el tamaño
    let pesoAprox = (duration * 0.055).toFixed(2) // cálculo estimado MB

    // Mensaje previo
    await conn.sendMessage(m.chat, {
      text: `「✧」 Descargando <${title}>\n\n` +
        `📺 Canal » ${ownerChannelName}\n` +
        `⏳ Duración » ${Math.floor(duration / 60)} minutos ${duration % 60} segundos\n` +
        `📥 Calidad » ${calidad}\n` +
        `📦 Tamaño » ${pesoAprox} MB\n` +
        `🔗 Link » ${text}`
    }, { quoted: m })

    let filePath = path.join('./tmp', `${title}.mp4`)

    // Descarga del video
    await new Promise((resolve, reject) => {
      ytdl(text, { quality: '18' }) // calidad 360p
        .pipe(fs.createWriteStream(filePath))
        .on('finish', resolve)
        .on('error', reject)
    })

    // Enviar video
    await conn.sendMessage(m.chat, {
      video: { url: filePath },
      mimetype: 'video/mp4',
      fileName: `${title}.mp4`
    }, { quoted: m })

    fs.unlinkSync(filePath)
  } catch (e) {
    m.reply('❌ Error al descargar el video')
  }
}

handler.command = /^mp4$/i
export default handler