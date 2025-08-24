//>>⟩ Creado por GianPoolS < github.com/GianPoolS >

import fg from 'api-dylux'

// Objeto global para almacenar URLs temporales por usuario
const twitterSessions = {}

// Handler principal: recibe el link
let twitterHandler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `*💬 Ejemplo de uso:*\n${usedPrefix + command} https://twitter.com/...`

  await m.react('⏳')

  twitterSessions[m.sender] = args[0] // Guardar URL para este usuario

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
twitterHandler.help = ['twitter <url>', 'x <url>']
twitterHandler.tags = ['downloader']
twitterHandler.command = ['twitter', 'tw', 'x']

// Handler secundario: captura respuestas 1/2/3
let replyHandler = async (m, { conn }) => {
  if (!['1', '2', '3'].includes((m.text || '').trim())) return
  if (!m.quoted) return // debe ser respuesta a un mensaje
  if (!twitterSessions[m.sender]) return m.reply('ⓘ Primero envía un link de Twitter con el comando.')

  let url = twitterSessions[m.sender]

  try {
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
    delete twitterSessions[m.sender] // borrar sesión después de usar

  } catch (e) {
    console.error(e)
    await m.react('❌')
    await m.reply('ⓘ Hubo un error al procesar tu solicitud.')
  }
}
replyHandler.customPrefix = /^(1|2|3)$/i
replyHandler.command = new RegExp // <- truco: lo hace funcionar sin prefijo
replyHandler.exp = 0

export default handler