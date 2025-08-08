import axios from 'axios'
import cheerio from 'cheerio'

// Función para mezclar los resultados (shuffle)
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Buscar en MediaFireTrend
async function mfsearch(query) {
  if (!query) throw new Error('❗ Se necesita una búsqueda.')

  const { data: html } = await axios.get(`https://mediafiretrend.com/?q=${encodeURIComponent(query)}&search=Search`)
  const $ = cheerio.load(html)
  const links = shuffle(
    $('tbody tr a[href*="/f/"]').map((_, el) => $(el).attr('href')).get()
  ).slice(0, 10)

  const result = await Promise.all(links.map(async (link) => {
    const { data } = await axios.get(`https://mediafiretrend.com${link}`)
    const $ = cheerio.load(data)
    const raw = $('div.info tbody tr:nth-child(4) td:nth-child(2) script').text()
    const match = raw.match(/unescape\(['"`]([^'"`]+)['"`]\)/)
    const decoded = cheerio.load(decodeURIComponent(match?.[1] || ''))

    return {
      filename: $('tr:nth-child(2) td:nth-child(2) b').text().trim(),
      filesize: $('tr:nth-child(3) td:nth-child(2)').text().trim(),
      url: decoded('a').attr('href'),
      source_url: $('tr:nth-child(5) td:nth-child(2)').text().trim(),
      source_title: $('tr:nth-child(6) td:nth-child(2)').text().trim()
    }
  }))

  return result.filter(v => v.url)
}

// Handler para el comando
let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply('🧩 *Ejemplo:* .mediafiresearch config ff')

  await m.reply('🔍 Buscando archivos en *Mediafire*...')

  try {
    let results = await mfsearch(text)

    if (!results.length) return m.reply('❌ No se encontraron resultados bro')

    conn.mfsearch = conn.mfsearch || {}
    conn.mfsearch[m.sender] = {
      data: results,
      timeout: setTimeout(() => delete conn.mfsearch[m.sender], 10 * 60 * 1000)
    }

    let rows = results.map((v, i) => ({
      title: `${i + 1}. ${v.filename.slice(0, 30)}`,
      description: `📦 ${v.filesize} | 🌐 ${v.source_title}`,
      rowId: `${usedPrefix}mediafire ${v.url}`
    }))

    let listMessage = {
      text: `📁 Resultados de búsqueda para: *${text}*`,
      footer: '✨ Selecciona uno para descargar vía .mediafire',
      title: '🧭 Mediafire Downloader',
      buttonText: '🗂️ Ver resultados',
      sections: [
        {
          title: '📄 Archivos encontrados:',
          rows
        }
      ],
      ...global.rcanal
    }

    await conn.sendMessage(m.chat, listMessage, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.help = ['mediafiresearch']
handler.tags = ['search']
handler.command = ['mediafiresearch']
handler.register = true
export default handler