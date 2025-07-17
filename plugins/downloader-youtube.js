import axios from 'axios'
import ytSearch from 'yt-search'
import crypto from 'crypto'

const headers = {
  accept: '*/*',
  'content-type': 'application/json',
  origin: 'https://yt.savetube.me',
  referer: 'https://yt.savetube.me/',
  'user-agent': 'Postify/1.0.0'
}

const formats = ['144', '240', '360', '480', '720', '1080', 'mp3']

const isUrl = str => {
  try {
    const url = new URL(str)
    return url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')
  } catch {
    return false
  }
}

const youtube = url => {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

const hexToBuffer = hex => Buffer.from(hex.match(/.{1,2}/g).join(''), 'hex')

const decrypt = encrypted => {
  try {
    const key = hexToBuffer('C5D58EF67A7584E4A29F6C35BBC4EB12')
    const buffer = Buffer.from(encrypted, 'base64')
    const iv = buffer.slice(0, 16)
    const content = buffer.slice(16)

    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
    const decrypted = Buffer.concat([
      decipher.update(content),
      decipher.final()
    ])
    return JSON.parse(decrypted.toString())
  } catch (e) {
    return null
  }
}

const request = async (endpoint, data = {}, method = 'post') => {
  const base = 'https://media.savetube.me/api'
  try {
    const res = await axios({
      method,
      url: endpoint.startsWith('http') ? endpoint : base + endpoint,
      data: method === 'post' ? data : undefined,
      params: method === 'get' ? data : undefined,
      headers
    })
    return { status: true, data: res.data }
  } catch (e) {
    return { status: false, error: e.message }
  }
}

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply('📍 Poné un nombre o link de YouTube')

  try {
    let url = text
    if (!isUrl(url)) {
      // buscar video si es texto
      let search = await ytSearch(text)
      if (!search?.videos?.length) return m.reply('❌ No encontré videos')
      url = search.videos[0].url
    }

    const format = command.toLowerCase() === 'play' ? 'mp3' : '360'
    if (!formats.includes(format)) return m.reply(`❌ Formato no válido. Usa: ${formats.join(', ')}`)

    // Extraer ID
    const id = youtube(url)
    if (!id) return m.reply('❌ No pude sacar el ID del video')

    // Obtener CDN
    const cdnRes = await request('/random-cdn', {}, 'get')
    if (!cdnRes.status || !cdnRes.data?.cdn) throw new Error('❌ Falló obtener CDN')

    const cdn = cdnRes.data.cdn

    // Info del video
    const infoRes = await request(`https://${cdn}/v2/info`, {
      url: `https://www.youtube.com/watch?v=${id}`
    })
    if (!infoRes.status || !infoRes.data?.data) throw new Error('❌ No pude obtener info del video')

    const decrypted = decrypt(infoRes.data.data)
    if (!decrypted || !decrypted.key || !decrypted.title) throw new Error('❌ No pude descifrar info')

    // Descargar URL
    const downloadRes = await request(`https://${cdn}/download`, {
      id,
      downloadType: format === 'mp3' ? 'audio' : 'video',
      quality: format,
      key: decrypted.key
    })

    const downloadUrl = downloadRes?.data?.data?.downloadUrl
    if (!downloadRes.status || !downloadUrl || !downloadUrl.startsWith('http')) throw new Error('❌ No pude obtener link válido')

    // Enviar miniatura con título
    await conn.sendMessage(m.chat, {
      image: { url: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` },
      caption: `🎬 *${decrypted.title}*\n📥 Descargando ${format === 'mp3' ? 'audio' : 'video'}...`
    }, { quoted: m })

    await new Promise(r => setTimeout(r, 1200))

    // Enviar audio o video
    if (format === 'mp3') {
      await conn.sendMessage(m.chat, {
        audio: { url: downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: `${decrypted.title}.mp3`,
        ptt: false
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        video: { url: downloadUrl },
        mimetype: 'video/mp4',
        fileName: `${decrypted.title}.mp4`,
        caption: `🎬 *${decrypted.title}*`
      }, { quoted: m })
    }

  } catch (e) {
    console.error('❌ Error en yt plugin:', e)
    m.reply('❌ Error descargando, prueba con otro video o link')
  }
}

handler.help = ['play', 'ytvx']
handler.tags = ['descargas']
handler.command = /^(play|ytvx)$/i

export default handler