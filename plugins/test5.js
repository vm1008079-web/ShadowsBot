import pkg from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto } = pkg

let handler = async (m, { conn }) => {
  await m.react('📋')

  try {
    const listSections = [
      {
        title: "Menú rápido",
        rows: [
          { header: "💠 Opción 1", title: "📜 Ver todos los comandos", id: ".allmenu" },
          { header: "💠 Opción 2", title: "🤖 Info Bot", id: ".infobot" }
        ]
      }
    ]

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: { text: "📋 Selecciona una de las opciones:" },
            footer: { text: "byGP" },
            header: { hasMediaAttachment: false },
            nativeFlowMessage: {
              buttons: [],
              messageParamsJson: JSON.stringify({
                title: "✨ Lista de Opciones",
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