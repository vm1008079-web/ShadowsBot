import fs from 'fs'
import pkg from '@whiskeysockets/baileys'
const { proto } = pkg

let handler = async (m, { conn }) => {
  const destinatario = '51917160311@s.whatsapp.net'
  try {
    const imagenBuffer = fs.readFileSync('./storage/img/menu.jpg')

    // Prepara la imagen
    const preparedImage = await conn.prepareMessage(destinatario, { image: imagenBuffer }, {})

    const buttonsMessage = {
      interactiveMessage: proto.Message.InteractiveMessage.create({
        body: proto.Message.InteractiveMessage.Body.create({
          text: 'hola'
        }),
        footer: proto.Message.InteractiveMessage.Footer.create({
          text: 'elige una opción'
        }),
        header: proto.Message.InteractiveMessage.Header.create({
          title: '',
          hasMediaAttachment: true,
          imageMessage: preparedImage.message.imageMessage
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
    }

    await conn.relayMessage(destinatario, buttonsMessage, {})

    await m.reply('mensaje enviado ✅ con botones')
  } catch (e) {
    await m.reply(`❌ error: ${e?.message || e}`)
  }
}

handler.command = ['tes5']

export default handler
