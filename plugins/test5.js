import fs from 'fs'

let handler = async (m, { conn }) => {
  const destinatario = '51917160311@s.whatsapp.net'
  try {
    const imagenBuffer = fs.readFileSync('./storage/img/menu.jpg')

    await conn.sendMessage(destinatario, {
      image: imagenBuffer,
      caption: 'hola',
      buttons: [
        { buttonId: 'tes5_si', buttonText: { displayText: 'Si' }, type: 1 },
        { buttonId: 'tes5_no', buttonText: { displayText: 'No' }, type: 1 }
      ],
      headerType: 1 // 1 = texto, 4 = imagen
    })

    await m.reply('mensaje enviado ✅')
  } catch (e) {
    await m.reply(`❌ error: ${e?.message || e}`)
  }
}

handler.command = ['tes5']

export default handler