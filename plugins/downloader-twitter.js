//>>⟩ Creado por GianPoolS < github.com/GianPoolS >

import fg from 'api-dylux'

// Objeto global para almacenar URLs temporales por usuario
const twitterSessions = {}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Si responde al menú con 1/2/3
    if (m.quoted && twitterSessions[m.sender] && ['1', '2', '3'].includes((m.text || '').trim())) {
      let url = twitterSessions[m.sender]

      await m.react('⏳')
      let { SD, HD, desc, audio } = await fg.twitter(url)

      let caption = `
彡 T W I T T E R - D L

📌 Descripción: ${desc || 'Sin descripción'}
🔗 Link: ${url}
`

      if (m.text.trim() === '1') {
        await conn.sendMessage(m.chat, { video: { url: SD }, caption }, { quoted: m })
      } else if (m.text.trim() === '2') {
        await conn.sendMessage(m.chat, { video: { url: HD }, caption }, { quoted: m })
      } else if (m.text.trim() === '3') {
        await conn.sendMessage(m.chat, { audio: { url: audio }, mimetype: 'audio/mp4' }, { quoted: m })
      }
      await m.react('✅')

      delete twitterSessions[m.sender] // borrar sesión
      return
    }

    // Si manda el comando con link
    if (command) {
      if (!args[0]) throw `*💬 Ejemplo de uso:*\n${usedPrefix + command} https://twitter.com/...`

      await m.react('⏳')

      twitterSessions[m.sender] = args[0] // guardar URL

      let { desc, thumb } = await fg.twitter(args[0])

      await conn.sendMessage(m.chat, {
        image: { url: thumb },
        caption: `
彡 T W I T T E R - D L

📌 Descripción: ${desc || 'Sin descripción'}
🔗 Link: ${args[0]}

👉 Responde a este mensaje con un número:
1️⃣ SD (calidad normal)
2️⃣ HD (alta calidad)
3️⃣ MP3 (solo audio)
        `
      }, { quoted: m })

      await m.react('✅')
    }

  } catch (e) {
    console.error(e)
    await m.react('❌')
    await m.reply('ⓘ Hubo un error al procesar tu solicitud.')
  }
}

// captura tanto comandos como respuestas
handler.command = ['twitter', 'tw', 'x']
handler.customPrefix = /^([1-3])$/  // detecta 1, 2 o 3
handler.exp = 0

export default handler