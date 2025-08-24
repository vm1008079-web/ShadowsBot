// >>⟩ Creador original GianPoolS < github.com/GianPoolS >
// >>⟩ No quites los créditos

import fs from 'fs'

const handler = async (m, { conn, usedPrefix }) => {
  try {
    await m.react('🕓')

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

    const buttons = [
      { buttonId: `${usedPrefix}opcion1`, buttonText: { displayText: "✅ Opción 1" }, type: 1 },
      { buttonId: `${usedPrefix}opcion2`, buttonText: { displayText: "❌ Opción 2" }, type: 1 },
      { buttonId: `${usedPrefix}menu`, buttonText: { displayText: "🔄 Menu" }, type: 1 }
    ]

    await conn.sendMessage(m.chat, {
      text: text,
      buttons: buttons,
      footer: 'Bot Oficial ✅',
      headerType: 1
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    await conn.reply(m.chat, `⚠️ Error al ejecutar el comando:\n\n${e.message}`, m)
  }
}

handler.command = ['tes3']
//handler.help = ['instalarbot']
//handler.tags = ['info']
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



