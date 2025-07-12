import fetch from 'node-fetch'
import cheerio from 'cheerio'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const url = args[0]
  if (!url || !url.includes('youtu')) {
    return m.reply(`✨ Usa el comando así:\n*${usedPrefix}${command} <enlace de YouTube>*`)
  }

  try {
    await conn.sendMessage(m.chat, {
      react: { text: '🎥', key: m.key }
    })

    const video = await getYTVideo(url)
    if (!video.link) throw '❌ No se encontró link de descarga'

    await conn.sendMessage(m.chat, {
      video: { url: video.link },
      caption: `🎬 *${video.title}*\n📥 Calidad: ${video.quality}\n📦 Tamaño: ${video.size}`,
      jpegThumbnail: await (await fetch(video.thumb)).buffer()
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ Error al descargar el video.\nAsegúrate que sea un video válido.')
  }
}

handler.command = ['video']
handler.help = ['video <url>']
handler.tags = ['descargas']
handler.register = true
export default handler

// FUNCIONES INTERNAS
async function getYTVideo(yutub) {
  const fetchPost = (url, form) => fetch(url, {
    method: 'POST',
    headers: {
      accept: "*/*",
      'accept-language': "en-US,en;q=0.9",
      'content-type': "application/x-www-form-urlencoded; charset=UTF-8"
    },
    body: new URLSearchParams(Object.entries(form))
  })

  const ytIdRegex = /(?:youtube(?:-nocookie)?\.com\/(?:watch\?.*v=|embed\/|v\/)|youtu\.be\/)([-_a-zA-Z0-9]{11})/
  const ytId = ytIdRegex.exec(yutub)?.[1]
  if (!ytId) throw '❌ ID de YouTube no válido'
  const url = 'https://youtu.be/' + ytId

  const analyzeRes = await fetchPost('https://www.y2mate.com/mates/en68/analyze/ajax', {
    url,
    q_auto: 0,
    ajax: 1
  })
  const analyzeData = await analyzeRes.json()
  const $ = cheerio.load(analyzeData.result)

  const title = $('b').text().trim()
  const thumb = $('.thumbnail.cover img').attr('src')
  const id = /var k__id = "(.*?)"/.exec(analyzeData.result)?.[1]
  if (!id) throw '❌ No se pudo obtener ID interno de Y2mate'

  // Buscar el video MP4 480p o el más cercano
  let found = null
  $('#mp4 table tbody tr').each((i, el) => {
    const q = $(el).find('td:nth-child(3)').text().trim()
    const btn = $(el).find('a')
    const ftype = btn.attr('data-ftype')
    const fquality = btn.attr('data-fquality')
    const size = $(el).find('td:nth-child(2)').text().trim()

    if ((q === '480p' || q === '360p' || q === '240p') && ftype === 'mp4' && !found) {
      found = { ftype, fquality, size }
    }
  })

  if (!found) throw '❌ No se encontró formato MP4 disponible'

  const convertRes = await fetchPost('https://www.y2mate.com/mates/en68/convert', {
    type: 'youtube',
    _id: id,
    v_id: ytId,
    ajax: '1',
    token: '',
    ftype: found.ftype,
    fquality: found.fquality
  })
  const convertData = await convertRes.json()
  const $$ = cheerio.load(convertData.result)
  const link = $$('a[href^="https://"]').attr('href')

  return {
    title,
    thumb,
    quality: found.fquality,
    size: found.size,
    format: found.ftype,
    link
  }
}