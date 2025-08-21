import axios from 'axios'
import * as cheerio from 'cheerio'

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

async function mfsearch(query) {
  if (!query) throw new Error('🪭 Debes escribir algo para buscar.')

  let html
  try {
    const resp = await axios.get(`https://mediafiretrend.com/?q=${encodeURIComponent(query)}&search=Search`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    })
    html = resp.data
  } catch {
    throw new Error('🦖 MediafireTrend no responde (Error 503)')
  }

  const $ = cheerio.load(html)
  const links = shuffle(
    $('tbody tr a[href*="/f/"]').map((_, el) => $(el).attr('href')).get()
  ).slice(0, 10)

  if (!links.length) throw new Error('🐛 No se encontraron resultados.')

  const result = await Promise.all(
    links.map(async (link) => {
      try {
        const { data } = await axios.get(`https://mediafiretrend.com${link}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        const $page = cheerio.load(data)
        const raw = $page('div.info tbody tr:nth-child(4) td:nth-child(2) script').text()
        const match = raw.match(/unescape\(['"`]([^'"`]+)['"`]\)/)
        const decodedUrl = match ? decodeURIComponent(match[1]) : null

        return {
          filename: $page('tr:nth-child(2) td:nth-child(2) b').text().trim() || 'Sin nombre',
          filesize: $page('tr:nth-child(3) td:nth-child(2)').text().trim() || 'Desconocido',
          url: decodedUrl || '',
          source_url: $page('tr:nth-child(5) td:nth-child(2)').text().trim() || '',
          source_title: $page('tr:nth-child(6) td:nth-child(2)').text().trim() || ''
        }
      } catch {
        return null
      }
    })
  )

  return result.filter(v => v && v.url)
}

let handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) return m.reply(`🍁 *Usa el comando así:* ${usedPrefix}mediafiresearch <nombre del archivo>`)

  await m.reply('> 🧃 Buscando archivos en *Mediafire*...', fkontak)

  try {
    const results = await mfsearch(text)

    if (!results.length) return m.reply('🐥 No se encontró nada con esa búsqueda.')

    const fkontak = {
      key: { 
        fromMe: false, 
        participant: "0@s.whatsapp.net", 
        remoteJid: "status@broadcast" 
      },
      message: {
        contactMessage: {
          displayName: "MediaFire Search 🍁",
          vcard: `BEGIN:VCARD
VERSION:3.0
N:;MediaFire Bot;;;
FN:MediaFire Bot
TEL;type=CELL;type=VOICE;waid=1234567890:+1234567890
EMAIL;type=INTERNET:fake@mediafire.com
END:VCARD`
        }
      }
    }

    let textResults = `🎋 *Resultados para:* ${text}\n\n🪭 Archivos encontrados en Mediafire:\n\n`
    results.slice(0, 10).forEach((v, i) => {
      textResults += `📦 ${i + 1}. ${v.filename}\n💾 Tamaño: ${v.filesize}\n🔗 URL: ${v.url}\n\n`
    })

    await conn.sendMessage(m.chat, { text: textResults, ...fkontak }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.help = ['mediafiresearch']
handler.tags = ['search']
handler.command = ['mediafiresearch']
handler.register = false
export default handler
