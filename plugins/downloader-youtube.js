import ytSearch from 'yt-search'
import fetch from 'node-fetch'
import axios from 'axios'

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply('📍 Escribe el nombre de una canción o pega el link de YouTube')

  try {
    // Buscar si es nombre
    let url = text
    if (!text.includes('youtube.com') && !text.includes('youtu.be')) {
      let search = await ytSearch(text)
      if (!search?.videos?.length) return m.reply('❌ No se encontraron resultados')
      url = search.videos[0].url
    }

    // Llamar a la API
    const apiUrl = `https://apiadonix.vercel.app/api/ytmp3?url=${encodeURIComponent(url)}`
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!json.status || !json.result?.audio) throw new Error('La API no devolvió un audio válido')

    let { title, thumbnail, audio } = json.result

    // Validar que el enlace de audio sea válido (HEAD request)
    let check = await axios.head(audio).catch(() => null)
    if (!check || check.status !== 200 || !check.headers['content-type']?.includes('audio')) {
      throw new Error('⚠️ El enlace de audio no es válido o no es un archivo de audio directo')
    }

    // Enviar miniatura con texto antes
    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: `🎵 *${title}*\n📥 Descargando audio...`
    }, { quoted: m })

    await new Promise(r => setTimeout(r, 1000))

    // Enviar el audio real
    await conn.sendMessage(m.chat, {
      audio: { url: audio.trim() },
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: m })

  } catch (e) {
    console.log('❌ Error:', e)
    m.reply('❌ No se pudo enviar el audio. Es posible que el archivo esté dañado o el link no sea válido.')
  }
}

handler.help = ['play'].map(v => v + ' <nombre o link>')
handler.tags = ['descargas']
handler.command = /^play$/i

export default handler