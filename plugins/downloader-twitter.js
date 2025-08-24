//>>⟩ Creado por GianPoolS < github.com/GianPoolS >

import fg from 'api-dylux'

const twitterSessions = {}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    let text = (m.text || '').trim()

    // ✅ Caso: usuario responde con 1/2/3
    if (twitterSessions[m.sender] && ['1','2','3'].includes(text)) {
      let url = twitterSessions[m.sender]
      await m.react('⏳')

      let { SD, HD, desc, audio } = await fg.twitter(url)

      let caption = `
彡 T W I T T E R - D L

📌 Descripción: ${desc || 'Sin descripción'}
🔗 Link: ${url}
`

      if (text === '1') {
        await conn.sendMessage(m.chat, { video: { url: SD }, caption }, { quoted: m })
      }
      if (text === '2') {
        await conn.sendMessage(m.chat, { video: { url: HD }, caption }, { quoted: m })
      }
      if (text === '3') {
        await conn.sendMessage(m.chat, { audio: { url: audio }, mimetype: 'audio/mp4' }, { quoted: m })
      }

      await m.react('✅')
      delete twitterSessions[m.sender] // limpiar después de usar
      return
    }

    // ✅ Caso: comando con link
    if (args[0]) {
      await m.react('⏳')
      twitterSessions[m.sender] = args[0] // guardamos la url

      let { desc, thumb } = await fg.twitter(args[0])

      await conn.sendMessage(m.chat, {
        image: { url: thumb },
        caption: `
彡 T W I T T E R - D L

📌 Descripción: ${desc || 'Sin descripción'}
🔗 Link: ${args[0]}

👉 Responde con el número:
1️⃣ SD (calidad normal)
2️⃣ HD (alta calidad)
3️⃣ MP3 (solo audio)
        `
      }, { quoted: m })

      await m.react('✅')
      return
    }

    // Si no manda nada válido
    if (!args[0]) {
      throw `💬 Ejemplo de uso:\n${usedPrefix + command} https://twitter.com/...`
    }

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('ⓘ Hubo un error al procesar tu solicitud.')
  }
}

handler.help = ['twitter <url>', 'x <url>']
handler.tags = ['downloader']
handler.command = ['twitter', 'tw', 'x']

export default handler