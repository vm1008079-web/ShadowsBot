import pkg from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto } = pkg

let handler = async (m, { conn }) => {
  await m.react('📋')

  try {
    const listSections = [
      {
        title: "🌐 Opciones Generales",
        rows: [
          { title: "📜 Todos los comandos", id: ".allmenu" },
          { title: "🤖 Info Bot", id: ".infobot" }
        ]
      },
      {
        title: "👥 Comunidad",
        rows: [
          { title: "📢 Grupos Oficiales", id: ".grupos" },
          { title: "👤 Creador", id: ".owner" }
        ]
      }
    ]

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: { text: "📋 Menú de Opciones\nSelecciona una sección:" },
            footer: { text: "byGP" },
            header: { hasMediaAttachment: false },
            nativeFlowMessage: {
              buttons: [],
              messageParamsJson: JSON.stringify({
                title: "✨ Menú Principal",
                sections: listSections
              })
            }
          })
        }
      }
    }, { quoted: m })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.error(e)
    m.reply("❌ Error al enviar la lista")
  }
}

handler.command = ['test5', 'tes5']
export default handler