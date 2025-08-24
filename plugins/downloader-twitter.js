//>>⟩ Creado por GianPoolS < github.com/GianPoolS >

import fg from 'api-dylux'

// Guardar URLs por mensaje del bot
const twitterSessions = {}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    let text = (m.text || '').trim()

    // 📌 Caso 1: comando con link
    if (args[0]) {
      await m.react('⏳')

      let { desc, thumb } = await fg.twitter(args[0])

      // Guardamos la URL usando la key del mensaje futuro (temporal)
      // Se usará key del mensaje que vamos a enviar
      let sentMsg = await conn.sendMessage(m.chat, {
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

      // Guardamos URL con el id del mensaje enviado
      twitterSessions[sentMsg.key.id] = args[0]

      await m.react('✅')
      return
    }

    // 📌 Caso 2: respuesta al menú con 1/2/3
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
      } else if (text === '2') {
        await conn.sendMessage(m.chat, { video: { url: HD }, caption }, { quoted: m })
      } else if (text === '3') {
        await conn.sendMessage(m.chat, { audio: { url: audio }, mimetype: 'audio/mp4' }, { quoted: m })
      }

      await m.react('✅')
      delete twitterSessions[msgId] // limpiar sesión después de usar
      return
    }

    // Si no manda nada válido
    if (!args[0]) {
      throw `💬 Ejemplo:\n${usedPrefix + command} https://twitter.com/...`
    }

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('ⓘ Error al procesar tu solicitud.')
  }
}

handler.help = ['x']
handler.tags = ['downloader']
handler.command = ['twitter','tw','x']

export default handler