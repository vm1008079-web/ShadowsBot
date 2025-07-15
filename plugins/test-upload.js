import yts from 'yt-search'
import adonixScraper from 'adonix-scraper'

const handler = async (msg, { conn, args, command }) => {
  const chatId = msg.key.remoteJid
  if (!args || args.length === 0) {
    await conn.sendMessage(chatId, {
      text: `🎵 Escribe el nombre o link del video pa descargar ${command == 'play3' ? 'video' : 'audio'}`,
    }, { quoted: msg })
    return
  }

  const query = args.join(' ')
  const isAudio = command === 'play4'
  const formato = isAudio ? '320' : '720'

  try {
    await conn.sendMessage(chatId, { react: { text: isAudio ? '🎧' : '🎥', key: msg.key } })

    const search = await yts(query)
    const video = search.videos[0]
    if (!video) {
      await conn.sendMessage(chatId, { text: '❌ No encontré nada pa eso' }, { quoted: msg })
      return
    }

    const { title, url, timestamp, author, views, ago, image } = video

    await conn.sendMessage(chatId, {
      image: { url: image },
      caption: `📹 *${title}*\n\n⏱️ Duración: ${timestamp}\n👤 Canal: ${author.name}\n👁️ Vistas: ${views}\n📅 Subido: ${ago}\n🔗 URL: ${url}`,
    }, { quoted: msg })

    const result = await adonixScraper.download(url, formato, isAudio ? 'audio' : 'video')
    if (!result.status) {
      if (result.code === 429) {
        await conn.sendMessage(chatId, { text: '🚫 Saturación o límite diario, probá luego' }, { quoted: msg })
      } else {
        await conn.sendMessage(chatId, { text: `❌ Error al descargar: ${result.error}` }, { quoted: msg })
      }
      return
    }

    const media = {
      [isAudio ? 'audio' : 'video']: { url: result.result.download },
      mimetype: isAudio ? 'audio/mpeg' : 'video/mp4',
      fileName: `${result.result.title}.${isAudio ? 'mp3' : 'mp4'}`,
    }

    await conn.sendMessage(chatId, media, { quoted: msg })

  } catch (err) {
    console.error(err)
    await conn.sendMessage(chatId, { text: '❌ Error inesperado al procesar' }, { quoted: msg })
  }
}

handler.command = ['play4', 'play3']
handler.private = false
handler.group = false

export default handler