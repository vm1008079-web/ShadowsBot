import { proto } from '@whiskeysockets/baileys'

let handler = async (m, { conn, command }) => {
  await m.react('🕓') // reacción de carga

  const listMessage = {
    text: 'Selecciona una opción del menú:',
    footer: 'Creador: GianPool',
    title: '📜 MENÚ PRINCIPAL',
    buttonText: 'Abrir menú',
    sections: [
      {
        title: `ᴍᴇɴᴜ ᴘʀɪɴᴄɪᴘᴀʟ`,
        highlight_label: `.ᴍᴇɴᴜ`,
        rows: [
          {
            header: "🌐 ᴛᴏᴅᴏ ᴇʟ ᴍᴇɴᴜ",
            title: "ᴠᴇʀ ᴛᴏᴅᴏs ʟᴏs ᴄᴏᴍᴀɴᴅᴏs",
            rowId: `.allmenu`
          }
        ]
      },
      {
        title: `ɪɴғᴏʀᴍᴀᴄɪóɴ ᴅᴇʟ ʙᴏᴛ`,
        highlight_label: ``,
        rows: [
          {
            header: "🤖 ɪɴғᴏ ʙᴏᴛ",
            title: "ɪɴғᴏʀᴍᴀᴄɪóɴ ᴅᴇʟ ʙᴏᴛ",
            rowId: `.infobot`
          },
          {
            header: "📶 ᴇsᴛᴀᴅᴏ",
            title: "ᴠᴇʀ ᴇsᴛᴀᴅᴏ ᴅᴇʟ ʙᴏᴛ",
            rowId: `.estado`
          }
        ]
      },
      {
        title: `ᴄᴏɴᴛᴀᴄᴛᴏs`,
        highlight_label: `ᴄᴏɴᴛᴀᴄᴛᴏs`,
        rows: [
          {
            header: "👤 ᴄʀᴇᴀᴅᴏʀ",
            title: "ᴄᴏɴᴛᴀᴄᴛᴀʀ ᴀʟ ᴄʀᴇᴀᴅᴏʀ",
            rowId: `.owner`
          },
          {
            header: "📢 ᴄᴜᴇɴᴛᴀs",
            title: "ᴄᴜᴇɴᴛᴀs oғɪᴄɪᴀʟᴇs",
            rowId: `.cuentasoficiales`
          },
          {
            header: "👥 ɢʀᴜᴘᴏs",
            title: "ɢʀᴜᴘᴏs oғɪᴄɪᴀʟᴇs",
            rowId: `.grupos`
          }
        ]
      }
    ],
    viewOnce: true
  }

  await conn.sendMessage(m.chat, listMessage)
}

// comandos válidos
handler.command = /^(tes5|test5)$/i  

export default handler




/*sections: [{
            title: `ᴍᴇɴᴜ ᴘʀɪɴᴄɪᴘᴀʟ`,
            highlight_label: `.ᴍᴇɴᴜ`,
            rows: [{
              header: "🌐 ᴛᴏᴅᴏ ᴇʟ ᴍᴇɴᴜ",
              title: "ᴠᴇʀ ᴛᴏᴅᴏs ʟᴏs ᴄᴏᴍᴀɴᴅᴏs",
              id: `.allmenu`
            }]
          }, {
            title: `ɪɴғᴏʀᴍᴀᴄɪóɴ ᴅᴇʟ ʙᴏᴛ`,
            highlight_label: ``,
            rows: [{
              header: "🤖 ɪɴғᴏ ʙᴏᴛ",
              title: "ɪɴғᴏʀᴍᴀᴄɪóɴ ᴅᴇʟ ʙᴏᴛ",
              id: `.infobot`
            }, {
              header: "📶 ᴇsᴛᴀᴅᴏ",
              title: "ᴠᴇʀ ᴇsᴛᴀᴅᴏ ᴅᴇʟ ʙᴏᴛ",
              id: `.estado`
            }]
          }, {
            title: `ᴄᴏɴᴛᴀᴄᴛᴏs`,
            highlight_label: `ᴄᴏɴᴛᴀᴄᴛᴏs`,
            rows: [{
              header: "👤 ᴄʀᴇᴀᴅᴏʀ",
              title: "ᴄᴏɴᴛᴀᴄᴛᴀʀ ᴀʟ ᴄʀᴇᴀᴅᴏʀ",
              id: `.owner`
            }, {
              header: "📢 ᴄᴜᴇɴᴛᴀs",
              title: "ᴄᴜᴇɴᴛᴀs oғɪᴄɪᴀʟᴇs",
              id: `.cuentasoficiales`
            }, {
              header: "👥 ɢʀᴜᴘᴏs",
              title: "ɢʀᴜᴘᴏs oғɪᴄɪᴀʟᴇs",
              id: `.grupos`
            }]
          }]
        })
      },
      viewOnce: true
    }*/