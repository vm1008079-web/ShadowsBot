import adonixScraper from 'adonix-scraper'

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid

  if (!args || args.length === 0) {
    await conn.sendMessage(chatId, { text: 'Pásame el link de YouTube para descargar video pue' }, { quoted: msg })
    return
  }

  const url = args[0]

  await conn.sendMessage(chatId, { react: { text: '🛠️', key: msg.key } })
  await conn.sendMessage(chatId, { text: '⏳ Buscando y descargando video...' }, { quoted: msg })

  try {
    const formato = '720' // calidad fija para video
    const result = await adonixScraper.download(url, formato, 'video')

    if (!result.status) {
      await conn.sendMessage(chatId, { text: `❌ Error: ${result.error}` }, { quoted: msg })
      return
    }

    await conn.sendMessage(chatId, {
      video: { url: result.result.download },
      mimetype: 'video/mp4',
      fileName: `${result.result.title}.mp4`
    }, { quoted: msg })

  } catch (e) {
    await conn.sendMessage(chatId, { text: '❌ Algo salió mal al descargar el video' }, { quoted: msg })
  }
}

handler.command = ['descargarvideo', 'vidget']


export default handler