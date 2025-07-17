import fetch from 'node-fetch'

const handler = async (m, { conn, text, args, command }) => {
  if (!text) throw '🔍 Ingresa el nombre de un video porfa'

  await conn.sendMessage(m.chat, { react: { text: '🎶', key: m.key }})

  m.reply('⏳ *Buscando...*')

  try {
    // 🔎 Buscar video con la API de Delirius
    const searchRes = await fetch(`https://delirius-api-oficial.vercel.app/api/ytsearch?q=${encodeURIComponent(text)}`)
    const searchData = await searchRes.json()

    if (!searchData?.result?.length) {
      throw '❌ No se encontró ningún video'
    }

    const video = searchData.result[0]
    const videoUrl = `https://www.youtube.com/watch?v=${video.id}`

    // 🎬 Descargar usando tu API personalizada
    const apiRes = await fetch(`https://apiadonix.vercel.app/api/ytmp4?url=${videoUrl}`)
    const apiData = await apiRes.json()

    if (!apiData.status) {
      throw '❌ Error al obtener el video.'
    }

    await conn.sendMessage(m.chat, {
      video: { url: apiData.result.download },
      mimetype: 'video/mp4',
      fileName: `${apiData.result.title}.mp4`,
      caption: `✅ *Título:* ${apiData.result.title}\n🎞️ *Calidad:* ${apiData.result.quality}`,
      thumbnail: await (await fetch(apiData.result.thumbnail)).buffer()
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    throw '❌ Error inesperado al procesar'
  }
}

handler.command = ['play3']
handler.help = ['play3 <nombre>']
handler.tags = ['downloader']
handler.register = true
handler.limit = true

export default handler