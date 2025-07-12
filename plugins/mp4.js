import axios from 'axios'
import cheerio from 'cheerio'
import qs from 'qs'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const url = args[0]
  if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
    return m.reply(`✨ Usa el comando así:\n*${usedPrefix}${command} <enlace de YouTube>*`)
  }

  try {
    await conn.react(m.chat, m.key, '🎥')

    const base = 'https://www.y2mate.com'

    // Paso 1: Analizar el video
    const res = await axios.post(`${base}/mates/en68/analyze/ajax`, qs.stringify({
      url,
      q_auto: 0,
      ajax: 1
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    })

    const $ = cheerio.load(res.data.result)
    const token = $('input[name="_id"]').attr('value')
    const v_id = url.includes('v=') ? url.split('v=')[1] : url.split('/').pop()

    let ftype = null, fquality = null
    $('table tbody tr').each((i, el) => {
      const format = $(el).find('td:nth-child(2)').text().trim()
      const quality = $(el).find('td:nth-child(3)').text().trim()
      if (format === 'mp4' && quality === '480p') {
        ftype = $(el).find('a').attr('data-ftype')
        fquality = $(el).find('a').attr('data-fquality')
      }
    })

    if (!ftype || !fquality) return m.reply('❌ No encontré MP4 480p en ese video.')

    // Paso 2: Convertir para sacar el link
    const conv = await axios.post(`${base}/mates/en68/convert`, qs.stringify({
      type: 'youtube',
      _id: token,
      v_id,
      ftype,
      fquality
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    })

    const $$ = cheerio.load(conv.data.result)
    const dlLink = $$('a[href^="https://"]').attr('href')
    if (!dlLink) return m.reply('❌ No se pudo sacar el link directo.')

    await conn.sendMessage(m.chat, {
      video: { url: dlLink },
      caption: `🎬 *Video descargado en 480p*\n📥 Desde: ${url}`
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Ocurrió un error al descargar el video.')
  }
}

handler.command = ['video']
handler.help = ['video <url>']
handler.tags = ['descargas']
handler.register = true

export default handler