import fetch from 'node-fetch';
import moment from 'moment-timezone';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;

let handler = async (m, { conn }) => {
  m.react('🐢');
  if (!global.menutext) await global.menu();

  let time = moment.tz('America/Lima').format('HH:mm:ss');
  let date = moment.tz('America/Lima').format('DD/MM/YYYY');
  let week = moment.tz('America/Lima').format('dddd');

  // solo info de fecha
  let txt = `╭┈ ↷
│ 🕒 Hora: ${time}
│ 📅 Fecha: ${date}
│ 🗓️ Día: ${week}
╰──────────────`;

  try {
    const imageUrl = 'https://iili.io/FpAsm5N.jpg';

    // lista preview
    const listSections = [
      {
        title: "ᴍᴇɴᴜ ᴘʀɪɴᴄɪᴘᴀʟ",
        rows: [{ title: "🌐 Ver todos los comandos", id: ".allmenu" }]
      },
      {
        title: "ɪɴғᴏʀᴍᴀᴄɪóɴ",
        rows: [
          { title: "🤖 Info Bot", id: ".infobot" },
          { title: "📶 Estado", id: ".estado" }
        ]
      },
      {
        title: "ᴄᴏɴᴛᴀᴄᴛᴏs",
        rows: [
          { title: "👤 Creador", id: ".owner" },
          { title: "📢 Cuentas oficiales", id: ".cuentasoficiales" },
          { title: "👥 Grupos oficiales", id: ".grupos" }
        ]
      }
    ];

    const listMessage = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: { text: txt },
            footer: { text: "Pulsa aquí 👇" },
            header: {
              hasMediaAttachment: true,
              imageMessage: (await conn.sendMessage(
                m.chat,
                { image: { url: imageUrl } },
                { quoted: m }
              )).message.imageMessage
            },
            nativeFlowMessage: {
              buttons: [],
              messageParamsJson: JSON.stringify({
                title: "🫧 𝙎𝙀𝙇𝙀𝘾𝙏 𝙈𝙀𝙉𝙐",
                sections: listSections
              })
            }
          })
        }
      }
    }, { quoted: m });

    await conn.relayMessage(m.chat, listMessage.message, { messageId: listMessage.key.id });

  } catch (error) {
    console.error(error);
    m.reply('❌ Error al procesar el menú.');
  }
};

// comandos que lo activan
handler.command = ['test5', 'tes5'];
export default handler;