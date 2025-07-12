import axios from 'axios'
import cheerio from 'cheerio'
import qs from 'qs'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const url = args[0]
  if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
    return m.reply(`✨ Usa el comando así:\n*${usedPrefix}${command} <enlace de YouTube>*`)
  }

  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '🎥',
        key: m.key
      }
    })

    const base = 'https://www.y2mate.com'

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

    // 📼 Buscar todos los MP4 disponibles
    const opciones = []
    $('table tbody tr').each((i, el) => {
      const format = $(el).find('td:nth-child(2)').text().trim()
      const quality = $(el).find('td:nth-child(3)').text().trim()
      const ftype = $(el).find('a').attr('data-ftype')
      const fquality = $(el).find('a').attr('data-fquality')
      if (format === 'mp4' && ftype && fquality) {
        opciones.push({ quality, ftype, fquality })
      }
    })

    if (opciones.length === 0) return m.reply('❌ No se encontró ningún MP4 disponible.')

    // 🧠 Buscar 480p primero, si no, el más cercano inferior
    const preferidas = ['480p', '360p', '240p']
    let opcion = opciones.find(o => o.quality === '480p')
    if (!opcion) {
      opcion = opciones.find(o => preferidas.includes(o.quality)) || opciones[0]
    }

    const conv = await axios.post(`${base}/mates/en68/convert`, qs.stringify({
      type: 'youtube',
      _id: token,
      v_id,
      ftype: opcion.ftype,
      fquality: opcion.fquality
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
      caption: `🎬 *Video descargado: ${opcion.quality}*\n📥 Desde: ${url}`
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