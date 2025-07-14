import adonixScraper from 'adonix-scraper'

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid

  if (!args || args.length === 0) {
    await conn.sendMessage(chatId, { text: 'Pásame el link de YouTube para descargar audio pue' }, { quoted: msg })
    return
  }

  const url = args[0]

  await conn.sendMessage(chatId, { react: { text: '🛠️', key: msg.key } })
  await conn.sendMessage(chatId, { text: '⏳ Buscando y descargando audio...' }, { quoted: msg })

  try {
    const formato = '320' // calidad fija para audio
    const result = await adonixScraper.download(url, formato, 'audio')

    if (!result.status) {
      if(result.code === 429) {
        await conn.sendMessage(chatId, { text: '🚫 Límite diario o saturación, prueba más tarde' }, { quoted: msg })
      } else {
        await conn.sendMessage(chatId, { text: `❌ Error: ${result.error}` }, { quoted: msg })
      }
      return
    }

    await conn.sendMessage(chatId, {
      audio: { url: result.result.download },
      mimetype: 'audio/mpeg',
      fileName: `${result.result.title}.mp3`
    }, { quoted: msg })

  } catch (e) {
    await conn.sendMessage(chatId, { text: '❌ Algo salió mal al descargar el audio' }, { quoted: msg })
  }
}

handler.command = ['descargaraudio', 'audget']
handler.group = false
handler.private = true

export default handler