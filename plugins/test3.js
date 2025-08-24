// >>⟩ Creador original GianPoolS < github.com/GianPoolS >
// >>⟩ No quites los créditos

import fs from 'fs'

const handler = async (m, { conn, usedPrefix }) => {
  try {
    await m.react('🕓')

    // Tipos de documento aleatorios
    const docTypes = [
      'pdf',
      'zip',
      'vnd.openxmlformats-officedocument.presentationml.presentation',
      'vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    const document = docTypes[Math.floor(Math.random() * docTypes.length)]

    const text = `*—◉ 𝚃𝚄𝚃𝙾𝚁𝙸𝙰𝙻-𝚃𝙴𝚁𝙼𝚄𝚇*
> https://youtu.be

------------------------------------

*—◉ 𝙲𝙾𝙼𝙰𝙽𝙳𝙾𝚂 𝚃𝙴𝚁𝙼𝚄𝚇*
> Comandos:
- cd && termux-setup-storage
- apt-get update -y && apt-get upgrade -y
- pkg install -y git nodejs ffmpeg imagemagick && pkg install yarn 
- git clone https://github.com/
- yarn
- npm install
- npm update
- npm start

------------------------------------

—◉ ✔️ ACTIVAR EN CASO DE DETENERSE EN TERMUX ✔️
> cd 
> npm start

------------------------------------

—◉ 👽 OBTENER OTRO CODIGO QR EN TERMUX 👽
> cd 
> rm -rf sesion
> npm start`.trim()

    const namebot = 'Bot Oficial ✅'

    // Botones adicionales
    const buttons = [
      { buttonId: `${usedPrefix}opcion1`, buttonText: { displayText: "✅ Opción 1" }, type: 1 },
      { buttonId: `${usedPrefix}opcion2`, buttonText: { displayText: "❌ Opción 2" }, type: 1 },
      { buttonId: `${usedPrefix}menu`, buttonText: { displayText: "🔄 Menu" }, type: 1 }
    ]

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
          mediaUrl: 'https://github.com/Ado-Rgb',
          mediaType: 2,
          previewType: 'pdf',
          title: 'ᴇʟ ᴍᴇᴊᴏʀ ʙᴏᴛ ᴅᴇ ᴡʜᴀᴛsᴀᴘᴘ⁩',
          body: namebot,
          thumbnail: fs.readFileSync('./storage/img/menu.jpg'),
          sourceUrl: 'https://www.youtube.com/'
        }
      },
      caption: text,
      footer: namebot,
      headerType: 6,
      buttons: buttons
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


//botones funcionando

    /*const simpleHandler = async (m, { conn, usedPrefix }) => {
    const caption = `⚜️ Este es un mensaje con botones`;

    const buttons = [
        {
            buttonId: `${usedPrefix}opcion1`,
            buttonText: { displayText: "✅ Opción 1" },
            type: 1
        },
        {
            buttonId: `${usedPrefix}opcion2`,
            buttonText: { displayText: "❌ Opción 2" },
            type: 1
        },
        {
            buttonId: `${usedPrefix}menu`,
            buttonText: { displayText: "🔄 Menu" },
            type: 1
        }
    ];

    await conn.sendMessage(
        m.chat,
        {
            text: caption,
            buttons: buttons,
            viewOnce: true
        },
        { quoted: m }
    );
};

simpleHandler.command = /^(tes3)$/i;

export default simpleHandler;*/

