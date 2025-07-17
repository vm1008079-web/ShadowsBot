import ytSearch from 'yt-search'
import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply('📍 Escribe el nombre de una canción o pega el link de YouTube')

  try {
    let url = text
    if (!text.includes('youtube.com') && !text.includes('youtu.be')) {
      let search = await ytSearch(text)
      if (!search?.videos?.length) return m.reply('❌ No se encontraron resultados')
      url = search.videos[0].url
    }

    const apiUrl = `https://apiadonix.vercel.app/api/ytmp3?url=${encodeURIComponent(url)}`
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!json.status || !json.result?.audio) throw new Error('❌ No se pudo obtener el audio')

    let { title, thumbnail, audio } = json.result

    console.log('🔍 audio raw:', audio)
    if (!audio || typeof audio !== 'string') throw new Error('❌ Audio no es string o está vacío')

    // Limpieza ligera (quitar espacios)
    audio = audio.trim()

    // Validar url
    if (!audio.startsWith('http')) throw new Error('❌ URL de audio no comienza con http')

    console.log('🔍 audio limpio:', audio)

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: `🎵 *${title}*\n📥 Descargando audio...`
    }, { quoted: m })

    await new Promise(r => setTimeout(r, 1200))

    await conn.sendMessage(m.chat, {
      audio: { url: audio },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      ptt: false
    }, { quoted: m })

  } catch (e) {
    console.error('❌ Error en play:', e)
    m.reply('❌ Error al procesar el audio. Puede que el archivo esté corrupto o el link no sirva.')
  }
}

handler.help = ['play'].map(v => v + ' <nombre o link>')
handler.tags = ['descargas']
handler.command = /^play$/i

export default handler