// >>⟩ Creador original GianPoolS < github.com/GianPoolS >
// >>⟩ No quites los créditos

import fs from 'fs'

const handler = async (m, { conn }) => {
  try {
    await m.react('🕓')

    const docTypes = [
      'pdf',
      'zip',
      'vnd.openxmlformats-officedocument.presentationml.presentation',
      'vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    const document = docTypes[Math.floor(Math.random() * docTypes.length)]

    const text = `*—◉ 📥 DESCARGAR TERMUX AQUI 📥*
> 1- termux.uptodown.com/android
    
------------------------------------

*—◉ 🧿 INSTALACION EN TERMUX 🧿*
ESCRIBE LOS SIGUIENTES COMANDOS UNO POR UNO:
> 1- termux-setup-storage
> 2- apt update && apt upgrade -y
> pkg install -y git nodejs ffmpeg imagemagick
> 3- git clone https://github.com/Ado-rgb/Michi-WaBot.git
> 4- cd Michi-WaBot
> 5- npm install
> 6- npm start

------------------------------------

*—◉ ✔️ ACTIVAR EN CASO DE DETENERSE EN TERMUX ✔️*
ESCRIBE LOS SIGUIENTES COMANDOS UNO POR UNO:
> 1- cd Michi-WaBot
> 2- npm start

------------------------------------

*—◉ 👽 OBTENER OTRO CODIGO QR EN TERMUX 👽*
ESCRIBE LOS SIGUIENTES COMANDOS UNO POR UNO:
> 1- cd Michi-WaBot
> 2- rm -rf Sessions
> 3- npm start`.trim()

    const namebot = '𝖠𝖨 | 𝖬𝗂𝖼𝗁𝗂 🧃'

    const buttonMessage = {
      document: Buffer.from("MichiBot Tutorial"), // 👈 falso archivo
      mimetype: `application/${document}`,
      fileName: `「  𝑯𝒆𝒍𝒍𝒐 𝑾𝒐𝒓𝒍𝒅 」`,
      fileLength: 99999999999999,
      pageCount: 200,
      contextInfo: {
        forwardingScore: 200,
        isForwarded: true,
        externalAdReply: {
          mediaUrl: 'https://youtu.be/nUSEEmlZw2g',
          mediaType: 2,
          previewType: 'pdf',
          title: 'ᴇʟ ᴍᴇᴊᴏʀ ʙᴏᴛ ᴅᴇ ᴡʜᴀᴛsᴀᴘᴘ⁩',
          body: namebot,
          thumbnail: fs.readFileSync('./storage/img/menu.jpg'), // 👈 preview como JPG
          sourceUrl: 'https://youtu.be/nUSEEmlZw2g/'
        }
      },
      caption: text,
      footer: namebot,
      headerType: 6
    }

    await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
    await m.react('✅')

  } catch (e) {
    await m.react('❌')
    await conn.reply(m.chat, `⚠️ Error al ejecutar el comando:\n\n${e.message}`, m)
  }
}

handler.command = ['instalarbot']
handler.help = ['instalarbot']
handler.tags = ['info']
export default handler
