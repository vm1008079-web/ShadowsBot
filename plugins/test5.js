// comando: tes5
// Requiere @whiskeysockets/baileys

import fs from 'fs'

let handler = async (m, { conn }) => {
  const destinatario = '51917160311@s.whatsapp.net' // número en privado
  try {
    // Carga la imagen desde storage
    const imagenBuffer = fs.readFileSync('./storage/img/menu.jpg')

    await conn.sendMessage(
      destinatario,
      {
        image: imagenBuffer,
        caption: 'hola',
        templateButtons: [
          { index: 1, quickReplyButton: { displayText: 'Si', id: 'tes5_si' } },
          { index: 2, quickReplyButton: { displayText: 'No', id: 'tes5_no' } },
        ],
        headerType: 4,
      },
      { quoted: null } // sin quoted
    )

    await m.reply('mensaje enviado')
  } catch (e) {
    await m.reply(`error: ${e?.message || e}`)
  }
}

handler.help = ['tes5']
handler.tags = ['tools']
handler.command = /^tes5$/i

export default handler