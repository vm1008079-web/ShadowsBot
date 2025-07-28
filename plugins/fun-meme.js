import axios from 'axios'

const handler = async (m, { conn }) => {
  try {
    const res = await axios.get('https://g-mini-ia.vercel.app/api/meme')
    const memeUrl = res.data.url

    if (!memeUrl) {
      return m.reply('❌ No se pudo obtener el meme.')
    }

    await conn.sendMessage(m.chat, {
      image: { url: memeUrl },
      caption: `> ✿ *Meme de Hoy*`,
      footer: '¿Quieres otro?',
      buttons: [
        {
          buttonId: '.meme',
          buttonText: { displayText: '🔰 Siguiente Meme' },
          type: 1
        }
      ],
      headerType: 4
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('⚠️ Hubo un error al intentar obtener el meme.')
  }
}

handler.command = ['meme']
handler.help = ['meme']
handler.tags = ['fun']
export default handler