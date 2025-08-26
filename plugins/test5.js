import fs from 'fs'
import pkg from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

let handler = async (m, { conn, args }) => {
  // Validar que haya un número
  if (!args[0]) {
    return m.reply('⚠️ Debes ingresar un número.\nEjemplo: .tes 51917160311')
  }

  // Construir el JID (ID de WhatsApp)
  const numero = args[0].replace(/[^0-9]/g, '') // quita espacios o caracteres raros
  const destinatario = `${numero}@s.whatsapp.net`

  try {
    const imagenBuffer = fs.readFileSync('./storage/img/menu.jpg')

    // Prepara la imagen
    const media = await prepareWAMessageMedia(
      { image: imagenBuffer },
      { upload: conn.waUploadToServer }
    )

    // Crea el mensaje interactivo con botones
    const interactiveMessage = proto.Message.InteractiveMessage.create({
      body: proto.Message.InteractiveMessage.Body.create({
        text: 'hola'
      }),
      footer: proto.Message.InteractiveMessage.Footer.create({
        text: 'elige una opción'
      }),
      header: proto.Message.InteractiveMessage.Header.create({
        hasMediaAttachment: true,
        imageMessage: media.imageMessage
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
        buttons: [
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: 'Si',
              id: 'tes_si'
            })
          },
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: 'No',
              id: 'tes_no'
            })
          }
        ]
      })
    })

    // Genera el mensaje final
    const msg = generateWAMessageFromContent(destinatario, {
      viewOnceMessage: {
        message: { interactiveMessage }
      }
    }, {})

    // Enviar mensaje
    await conn.relayMessage(destinatario, msg.message, { messageId: msg.key.id })

    await m.reply(`✅ Mensaje enviado a *${numero}*`)
  } catch (e) {
    await m.reply(`❌ error: ${e?.message || e}`)
  }
}

// El comando se ejecuta con .tes <numero>
handler.command = ['tes']

export default handler


/*import fs from 'fs'
import pkg from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

let handler = async (m, { conn }) => {
  const destinatario = '51917160311@s.whatsapp.net'
  try {
    const imagenBuffer = fs.readFileSync('./storage/img/menu.jpg')

    // Prepara el media (imagen)
    const media = await prepareWAMessageMedia(
      { image: imagenBuffer },
      { upload: conn.waUploadToServer }
    )

    // Crea el mensaje interactivo con botones
    const interactiveMessage = proto.Message.InteractiveMessage.create({
      body: proto.Message.InteractiveMessage.Body.create({
        text: 'hola'
      }),
      footer: proto.Message.InteractiveMessage.Footer.create({
        text: 'elige una opción'
      }),
      header: proto.Message.InteractiveMessage.Header.create({
        hasMediaAttachment: true,
        imageMessage: media.imageMessage
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
        buttons: [
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: 'Si',
              id: 'tes5_si'
            })
          },
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: 'No',
              id: 'tes5_no'
            })
          }
        ]
      })
    })

    // Genera el mensaje final
    const msg = generateWAMessageFromContent(destinatario, {
      viewOnceMessage: {
        message: { interactiveMessage }
      }
    }, {})

    // Envia al destinatario
    await conn.relayMessage(destinatario, msg.message, { messageId: msg.key.id })

    await m.reply('mensaje enviado ✅ con botones')
  } catch (e) {
    await m.reply(`❌ error: ${e?.message || e}`)
  }
}

handler.command = ['tes5']

export default handler*/