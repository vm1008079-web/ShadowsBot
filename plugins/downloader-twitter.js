//>>⟩ Creado por GianPoolS < github.com/GianPoolS >

import fg from 'api-dylux'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `*💬 Ejemplo de uso:*\n${usedPrefix + command} https://twitter.com/fernandavasro/status/1569741835555291139`

  await m.react('⏳') // reacción de espera

  try {
    // Obtener datos del tweet
    let { SD, HD, desc, thumb, audio } = await fg.twitter(args[0])
    let type = (args[1] || '').toLowerCase()

    // Guardamos temporalmente la URL en la sesión del usuario para que pueda elegir 1/2/3 después
    conn.twitterDL = conn.twitterDL || {}
    if (!['hd', 'sd', 'audio', '1', '2', '3'].includes(type)) {
      conn.twitterDL[m.sender] = args[0] // guardamos la url con el usuario

      return await conn.sendMessage(m.chat, {
        image: { url: thumb },
        caption: `
```彡 T W I T T E R - D L```

📌 Descripción: ${desc || 'Sin descripción'}
🔗 Link: ${args[0]}
------------------------------
👉 Elige una opción de descarga
respondiendo con el número:
1️⃣ SD (calidad normal)
2️⃣ HD (alta calidad)
3️⃣ MP3 (solo audio`,
        footer: "",
      }, { quoted: m })
    }

    // Mapear números a formatos
    if (type === '1') type = 'sd'
    if (type === '2') type = 'hd'
    if (type === '3') type = 'audio'

    // Recuperar la URL si solo manda número
    let url = args[0]
    if (['sd', 'hd', 'audio'].includes(type) && !url.startsWith('http')) {
      url = conn.twitterDL?.[m.sender]
      if (!url) throw 'ⓘ Primero envía el link del tweet para elegir calidad.'
      ;({ SD, HD, desc, thumb, audio } = await fg.twitter(url))
    }

    let caption = `
彡 T W I T T E R - D L

📌 Descripción: ${desc || 'Sin descripción'}
🔗 Link: ${url}
`

    // Enviar archivo según lo elegido
    if (type === 'hd') {
      await conn.sendMessage(m.chat, { video: { url: HD }, caption }, { quoted: m })
    } else if (type === 'sd') {
      await conn.sendMessage(m.chat, { video: { url: SD }, caption }, { quoted: m })
    } else if (type === 'audio') {
      await conn.sendMessage(m.chat, { audio: { url: audio }, mimetype: 'audio/mp4' }, { quoted: m })
    }

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    await m.reply('ⓘ Hubo un error al descargar el tweet.')
  }
}

handler.help = ['twitter <url>', 'x <url>']
handler.tags = ['downloader']
handler.command = ['twitter', 'tw', 'x']

export default handler