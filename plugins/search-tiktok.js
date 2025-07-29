import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      return conn.reply(m.chat, `💜 Ejemplo de uso: ${usedPrefix + command} Mini Dog`, m)
    }
    m.react('🕒')

    const res = await ttks(text)
    const videos = res.data
    if (!videos.length) {
      return conn.reply(m.chat, "No se encontraron videos.", m)
    }

    const cap = `◜ 𝗧𝗶𝗸𝘁𝗼𝗸 ◞\n\n`
               + `≡ 🎋 𝖳𝗂́𝗍𝗎𝗅𝗈  : ${videos[0].title}\n`
               + `≡ ⚜️ 𝖡𝗎́𝗌𝗊𝗎𝖾𝖽𝖺 : ${text}`

    // Mandar todos los videos directamente por URL sin descarga
    for (let i = 0; i < videos.length; i++) {
      await conn.sendMessage(m.chat, {
        video: { url: videos[i].no_wm },
        caption: i === 0 ? cap : `👤 Titulo: ${videos[i].title}`
      }, { quoted: m })
    }

    m.react('✅')
  } catch (e) {
    return conn.reply(m.chat, `Ocurrió un problema al obtener los videos:\n\n${e}`, m)
  }
}

handler.command = ["ttsesearch", "tiktoks", "ttrndm", "ttks", "tiktoksearch"]
handler.help = ["tiktoksearch"]
handler.tags = ["search"]
export default handler

async function ttks(query) {
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://tikwm.com/api/feed/search',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Cookie': 'current_language=en',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
      },
      data: {
        keywords: query,
        count: 20,
        cursor: 0,
        HD: 1
      }
    })

    const videos = response.data.data.videos
    if (videos.length === 0) throw new Error("⚠️ No se encontraron videos para esa búsqueda.")

    const shuffled = videos.sort(() => 0.5 - Math.random()).slice(0, 5)
    return {
      status: true,
      creator: "Made with Ado",
      data: shuffled.map(video => ({
        title: video.title,
        no_wm: video.play,
        watermark: video.wmplay,
        music: video.music
      }))
    }
  } catch (error) {
    throw error
  }
}