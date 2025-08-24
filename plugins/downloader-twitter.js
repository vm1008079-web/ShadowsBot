//>>⟩ Creado por GianPoolS < github.com/GianPoolS >

import fg from 'api-dylux'

const twitterSessions = {}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    let text = (m.text || '').trim()

    // 1️⃣ Caso: comando con link
    if (args[0]) {
      await m.react('⏳')

      let { desc, thumb } = await fg.twitter(args[0])

      // Guardamos URL en sesión con key del mensaje
      twitterSessions[m.key.id] = args[0]

      await conn.sendMessage(m.chat, {
        image: { url: thumb },
        caption: `
彡 T W I T T E R - D L

📌 Descripción: ${desc || 'Sin descripción'}
🔗 Link: ${args[0]}

👉 Responde a este mensaje con:
1️⃣ SD
2️⃣ HD
3️⃣ MP3
        `
      }, { quoted: m })

      await m.react('✅')
      return
    }

    // 2️⃣ Caso: respuesta al mensaje del menú con 1/2/3
    if (m.quoted && ['1','2','3'].includes(text)) {
      let msgId = m.quoted.key.id
      let url = twitterSessions[msgId]

      if (!url) return m.reply('ⓘ Primero usa el comando con el link de Twitter.')

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
      delete twitterSessions[msgId] // limpiar después de usar
      return
    }

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('ⓘ Error al procesar tu solicitud.')
  }
}

handler.help = ['twitter <url>', 'x <url>']
handler.tags = ['downloader']
handler.command = ['twitter', 'tw', 'x']

export default handler