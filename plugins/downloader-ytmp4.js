import ytSearch from 'yt-search'
import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply('📍 Escribe el nombre de un video o pega el link de YouTube')

  try {
    // Buscar si es nombre
    let url = text
    if (!text.includes('youtube.com') && !text.includes('youtu.be')) {
      let search = await ytSearch(text)
      if (!search?.videos?.length) return m.reply('❌ No se encontraron resultados')
      url = search.videos[0].url
    }

    // Llamar a la API  
    const apiUrl = `https://apiadonix.vercel.app/api/ytmp4?url=${encodeURIComponent(url)}`  
    console.log('🔗 URL usada para API:', apiUrl)  

    const res = await fetch(apiUrl)  
    const json = await res.json()  

    console.log('🧾 Respuesta de la API:', json)  

    if (!json.status || !json.result?.download) {  
      throw new Error('La API no devolvió un resultado válido')  
    }  

    let { title, thumbnail, download, size } = json.result

    // Primero enviamos detalles con la miniatura  
    await conn.sendMessage(m.chat, {  
      image: { url: thumbnail },  
      caption: `🎬 *${title}*\n📦 Tamaño: ${size || 'Desconocido'}\n🔗 Link: ${url}`,  
    }, { quoted: m })

    // Luego enviamos el video  
    await conn.sendMessage(m.chat, {  
      video: { url: download },  
      caption: `🎬 Aquí está tu video *${title}*`,  
      mimetype: 'video/mp4'  
    }, { quoted: m })

  } catch (e) {
    console.log('❌ Error al descargar el video:', e)
    m.reply('❌ Error al descargar el video')
  }
}

handler.help = ['ytvx', 'play2', 'mp4'].map(v => v + ' <nombre o link>')
handler.tags = ['descargas']
handler.command = /^(ytvx|play2|mp4)$/i

export default handler