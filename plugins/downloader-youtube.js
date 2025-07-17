import ytSearch from 'yt-search'
import fetch from 'node-fetch'

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
    console.log('🔗 URL usada para API:', apiUrl)

    const res = await fetch(apiUrl)
    const json = await res.json()

    console.log('🧾 Respuesta de la API:', json)

    if (!json.status || !json.result?.audio) {
      throw new Error('La API no devolvió un resultado válido')
    }

    let { title, thumbnail, audio } = json.result

    // Validar que el audio sea un link funcional
    if (!/^https?:\/\//.test(audio)) throw new Error('La URL del audio no es válida')

    // Enviar miniatura con detalles
    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: `🎵 *${title}*\n📥 Descargando audio...`
    }, { quoted: m })

    // Espera un poco para que el mensaje se vea antes
    await new Promise(r => setTimeout(r, 1000))

    // Enviar audio
    await conn.sendMessage(m.chat, {
      audio: { url: audio.toString().trim() },
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: m })

  } catch (e) {
    console.log('❌ Error al descargar el audio:', e)
    m.reply('❌ Error al descargar el audio, puede que el archivo esté corrupto o el link sea inválido')
  }
}

handler.help = ['play'].map(v => v + ' <nombre o link>')
handler.tags = ['descargas']
handler.command = /^play$/i

export default handler