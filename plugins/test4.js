// >>⟩ Creador original GianPoolS < github.com/GianPoolS >
// >>⟩ No quites los créditos

import fs from 'fs'

const handler = async (m, { conn }) => {
  try {
    await m.react('🕓') // reaccion inicial "cargando"

    // Documentos que sí generan preview
    const docsConPreview = [
      'pdf',
      'vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
      'vnd.openxmlformats-officedocument.spreadsheetml.sheet' // xlsx
    ]

    // Documentos que no generan preview
    const docsSinPreview = [
      'zip',
      'x-rar-compressed',
      'x-7z-compressed',
      'octet-stream'
    ]

    // Mezclar ambas listas
    const todosDocs = [...docsConPreview, ...docsSinPreview]
    const document = todosDocs[Math.floor(Math.random() * todosDocs.length)]

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

    await conn.sendMessage(m.chat, {
      document: { url: `https://github.com/Ado-Rgb` },
      mimetype: `application/${document}`,
      fileName: `「  𝑯𝒆𝒍𝒍𝒐 𝑾𝒐𝒓𝒍𝒅 」`,
      fileLength: 99999999999999,
      pageCount: 200,
      caption: text,
      footer: namebot,
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
      }
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    await conn.reply(m.chat, `⚠️ Error:\n\n${e.message}`, m)
  }
}

handler.command = ['instalarbot']
handler.help = ['instalarbot']
handler.tags = ['info']
export default handler