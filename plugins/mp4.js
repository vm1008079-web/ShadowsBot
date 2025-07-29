import axios from 'axios'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('❌ Escribe el enlace del video')

  try {
    // 1. Analizar video en yt1s.com
    let analyze = await axios.post('https://yt1s.com/api/ajaxSearch/index', new URLSearchParams({
      q: text,
      vt: 'home'
    }), {
      headers: { 'content-type': 'application/x-www-form-urlencoded' }
    })

    if (!analyze.data || !analyze.data.links || !analyze.data.title) return m.reply('❌ No se pudo obtener información del video')

    let titulo = analyze.data.title
    let duracion = analyze.data.t
    let videoData = analyze.data.links.mp4['18'] || analyze.data.links.mp4['22'] // 360p o 720p
    if (!videoData || !videoData.dlink) return m.reply('❌ No se encontró un enlace válido')

    let calidad = videoData.q
    let peso = videoData.size
    let downloadUrl = videoData.dlink

    // Verificar duración (máximo 1 hora)
    const durSegundos = duracion.split(':').reduce((acc, val) => acc * 60 + parseInt(val), 0)
    if (durSegundos > 3600) return m.reply('⏳ El video pasa de 1 hora')

    // 2. Mensaje previo
    await conn.sendMessage(m.chat, {
      text: `「✧」 Descargando <${titulo}>\n\n` +
        `📺 Canal » YouTube\n` +
        `⏳ Duración » ${duracion}\n` +
        `📥 Calidad » ${calidad}\n` +
        `📦 Tamaño » ${peso}\n` +
        `🔗 Link » ${text}`
    }, { quoted: m })

    // 3. Descargar video
    const filePath = path.join('./tmp', `${titulo.replace(/[<>:"/\\|?*]+/g, '')}.mp4`)
    const writer = fs.createWriteStream(filePath)
    const download = await axios({ url: downloadUrl, method: 'GET', responseType: 'stream' })
    download.data.pipe(writer)

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })

    // 4. Enviar video
    await conn.sendMessage(m.chat, {
      video: { url: filePath },
      mimetype: 'video/mp4',
      fileName: `${titulo}.mp4`
    }, { quoted: m })

    fs.unlinkSync(filePath) // borrar archivo temporal
  } catch (e) {
    console.log(e)
    m.reply('❌ Error al descargar el video')
  }
}

handler.command = /^mp4$/i
export default handler