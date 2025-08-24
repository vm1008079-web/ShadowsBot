// >>⟩ Creador original GianPoolS < github.com/GianPoolS >
// >>⟩ No quites los créditos

import fs from 'fs'

const handler = async (m, { conn, usedPrefix }) => {
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
> Comandos:
1- termux-setup-storage
2- apt update && apt upgrade -y
   pkg install -y git nodejs ffmpeg imagemagick
3- git clone https://github.com/Ado-rgb/Michi-WaBot.git
4- cd Michi-WaBot
5- npm install
6- npm start

------------------------------------

—◉ ✔️ ACTIVAR EN CASO DE DETENERSE EN TERMUX ✔️
ESCRIBE LOS SIGUIENTES COMANDOS UNO POR UNO:
> cd Michi-WaBot
> npm start

------------------------------------

—◉ 👽 OBTENER OTRO CODIGO QR EN TERMUX 👽
ESCRIBE LOS SIGUIENTES COMANDOS UNO POR UNO:
> cd Michi-WaBot
> rm -rf Sessions
> npm start`.trim()

    const namebot = 'MichiBot-MD' // fijo para evitar errores

    const buttonMessage = {
      document: { url: `https://github.com/Ado-Rgb` },
      mimetype: `application/${document}`,
      fileName: `「  𝑯𝒆𝒍𝒍𝒐 𝑾𝒐𝒓𝒍𝒅 」`,
      fileLength: 99999999999999,
      pageCount: 200,
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
          mediaType: 1, // <= con esto se activa la preview tipo video/enlace
          renderLargerThumbnail: true // <= hace la miniatura más grande
        }
      },
      caption: text,
      footer: namebot,
      headerType: 6
    }

    await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
    await m.react('✅') // reaccion si salió bien

  } catch (e) {
    console.error(e)
    await m.react('❌') // reaccion si hubo error
    await conn.reply(m.chat, `⚠️ Error al ejecutar el comando:\n\n${e.message}`, m)
  }
}

handler.command = ['instalarbot']
handler.help = ['instalarbot']
handler.tags = ['info']
export default handler
