//>>⟩ Creado por GianPoolS < github.com/GianPoolS >

import fg from 'api-dylux'

const twitterSessions = {}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    let text = (m.text || '').trim()

    // 📌 Caso 1: usuario responde con 1/2/3
    if (['1', '2', '3'].includes(text) && twitterSessions[m.sender]) {
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
      } else if (text === '2') {
        await conn.sendMessage(m.chat, { video: { url: HD }, caption }, { quoted: m })
      } else if (text === '3') {
        await conn.sendMessage(m.chat, { audio: { url: audio }, mimetype: 'audio/mp4' }, { quoted: m })
      }

      await m.react('✅')
      delete twitterSessions[m.sender] // limpiar sesión
      return
    }

    // 📌 Caso 2: usuario manda link con el comando
    if (command) {
      if (!args[0]) throw `💬 Ejemplo:\n${usedPrefix + command} https://twitter.com/...`

      await m.react('⏳')

      twitterSessions[m.sender] = args[0] // guardar url

      let { desc, thumb } = await fg.twitter(args[0])

      await conn.sendMessage(m.chat, {
        image: { url: thumb },
        caption: `
彡 T W I T T E R - D L

📌 Descripción: ${desc || 'Sin descripción'}
🔗 Link: ${args[0]}

👉 Responde con un número:
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
    m.reply('ⓘ Hubo un error al procesar tu solicitud.')
  }
}

handler.help = ['twitter <url>', 'x <url>']
handler.tags = ['downloader']
handler.command = ['twitter', 'tw', 'x']  // para el comando
handler.customPrefix = /^(1|2|3)$/i       // también acepta 1, 2, 3
handler.exp = 0

export default handler