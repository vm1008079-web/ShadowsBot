// >>⟩ Creador original GianPoolS < github.com/GianPoolS >
// >>⟩ No quites los créditos

import fs from 'fs'

const handler = async (m, { conn }) => {
  try {
    await m.react('🕓') // reaccion inicial "cargando"

    const doc = [
      'pdf',
      'zip',
      'vnd.openxmlformats-officedocument.presentationml.presentation',
      'vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    const document = doc[Math.floor(Math.random() * doc.length)]

    const text = `*—◉ 𝚃𝚄𝚃𝙾𝚁𝙸𝙰𝙻-𝚃𝙴𝚁𝙼𝚄𝚇*
> https://youtu.be/Sn6nGxKA4YI

------------------------------------

*—◉ 𝙲𝙾𝙼𝙰𝙽𝙳𝙾𝚂 𝚃𝙴𝚁𝙼𝚄𝚇*
1- termux-setup-storage
2- apt update && apt upgrade -y
   pkg install -y git nodejs ffmpeg imagemagick
3- git clone https://github.com/Ado-rgb/Michi-WaBot.git
4- cd Michi-WaBot
5- npm install
6- npm start

------------------------------------

—◉ ✔️ ACTIVAR EN CASO DE DETENERSE EN TERMUX ✔️
> cd Michi-WaBot
> npm start

------------------------------------

—◉ 👽 OBTENER OTRO CODIGO QR EN TERMUX 👽
> cd Michi-WaBot
> rm -rf Sessions
> npm start`.trim()

    const namebot = 'MichiBot-MD'

    const message = {
      // 📌 1. Imagen visible en el chat
      image: fs.readFileSync('./storage/img/menu.jpg'),

      // 📌 2. Documento adjunto
      document: { url: `https://github.com/Ado-Rgb` },
      mimetype: `application/${document}`,
      fileName: `「  𝑯𝒆𝒍𝒍𝒐 𝑾𝒐𝒓𝒍𝒅 」`,
      fileLength: 99999999999999,
      pageCount: 200,

      // 📌 3. Texto
      caption: text,
      footer: namebot,

      // 📌 4. Previsualización grande
      contextInfo: {
        forwardingScore: 200,
        isForwarded: true,
        externalAdReply: {
          showAdAttribution: true,
          title: 'ᴇʟ ᴍᴇᴊᴏʀ ʙᴏᴛ ᴅᴇ ᴡʜᴀᴛsᴀᴘᴘ⁩',
          body: namebot,
          thumbnail: fs.readFileSync('./storage/img/menu.jpg'),
          sourceUrl: 'https://www.youtube.com/',
          mediaUrl: 'https://youtu.be/Sn6nGxKA4YI',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      },
      headerType: 6
    }

    await conn.sendMessage(m.chat, message, { quoted: m })
    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    await conn.reply(m.chat, `⚠️ Error:\n\n${e.message}`, m)
  }
}

handler.command = ['instalarbot',instalar bot']
handler.help = ['instalarbot']
handler.tags = ['info']
export default handler