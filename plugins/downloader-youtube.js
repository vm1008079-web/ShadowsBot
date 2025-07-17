import ytSearch from 'yt-search'
import fetch from 'node-fetch'
import ffmpeg from 'fluent-ffmpeg'
import { join } from 'path'
import { tmpdir } from 'os'
import fs from 'fs'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('📍 Escribe el nombre de un video o pega el link de YouTube')

  try {
    // Buscar si es nombre
    let url = text
    if (!text.includes('youtube.com') && !text.includes('youtu.be')) {
      let search = await ytSearch(text)
      if (!search?.videos?.length) return m.reply('❌ No se encontraron resultados')
      url = search.videos[0].url
    }

    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    // Llamar a la API (que te da el .mp4)
    const apiUrl = `https://apiadonix.vercel.app/api/ytmp4?url=${encodeURIComponent(url)}`
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!json.status || !json.result?.download) {
      throw new Error('La API no devolvió un resultado válido')
    }

    let { title, thumbnail, download } = json.result

    // Descargar el video como buffer
    const videoRes = await fetch(download)
    const videoBuffer = await videoRes.buffer()

    // Guardar temporal el video
    const inputPath = join(tmpdir(), `input-${Date.now()}.mp4`)
    const outputPath = join(tmpdir(), `output-${Date.now()}.mp3`)
    fs.writeFileSync(inputPath, videoBuffer)

    // Convertir con ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioCodec('libmp3lame')
        .format('mp3')
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath)
    })

    const audioBuffer = fs.readFileSync(outputPath)

    // Mandar miniatura primero
    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: `🎧 *${title}*\n📥 Enviando audio...`
    }, { quoted: m })

    // Enviar el audio convertido
    await conn.sendMessage(m.chat, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      ptt: false, // o true si querés tipo nota de voz
      fileName: `${title}.mp3`
    }, { quoted: m })

    // Limpiar temporales
    fs.unlinkSync(inputPath)
    fs.unlinkSync(outputPath)

  } catch (e) {
    console.log('❌ Error al convertir o enviar el audio:', e)
    m.reply('❌ Error al convertir el video a audio')
  }
}

handler.help = ['ytmp3'].map(v => v + ' <nombre o link>')
handler.tags = ['descargas']
handler.command = /^(ytmp3|playaudio|yta)$/i

export default handler