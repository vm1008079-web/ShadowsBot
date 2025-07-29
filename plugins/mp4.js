import axios from 'axios'
import cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('❌ Escribe el enlace del video')

  try {
    // 1. Hace POST al backend de y2mate
    let res = await axios.post(
      'https://www.y2mate.com/mates/analyze/ajax',
      new URLSearchParams({ url: text, q_auto: 0, ajax: 1 }),
      { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
    )

    // 2. Parsear HTML
    const $ = cheerio.load(res.data.result)
    let titulo = $('b').first().text() || 'Video'
    let duracion = $('span:contains("Duration")').text().replace('Duration: ', '')
    let urlDescarga = $('a[href*="download"]').attr('href')

    if (!urlDescarga) return m.reply('❌ No se pudo obtener el enlace de descarga')

    // 3. Mensaje previo
    await conn.sendMessage(m.chat, {
      text: `「✧」 Descargando <${titulo}>\n\n` +
        `📺 Canal » YouTube\n` +
        `⏳ Duración » ${duracion}\n` +
        `📥 Calidad » 360p\n` +
        `📦 Tamaño » ~Desconocido\n` +
        `🔗 Link » ${text}`
    }, { quoted: m })

    // 4. Descargar el video
    const filePath = path.join('./tmp', `${titulo}.mp4`)
    const writer = fs.createWriteStream(filePath)
    const download = await axios({ url: urlDescarga, method: 'GET', responseType: 'stream' })
    download.data.pipe(writer)

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })

    // 5. Enviar video
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