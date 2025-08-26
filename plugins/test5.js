import fs from 'fs'

let handler = async (m, { conn }) => {
  try {
    const imagenBuffer = fs.readFileSync('./storage/img/menu.jpg')

    await conn.sendMessage(
      m.chat, // chat actual (tu privado con el bot)
      {
        image: imagenBuffer,
        caption: 'hola',
        buttons: [
          { buttonId: 'tes5_si', buttonText: { displayText: 'Si' }, type: 1 },
          { buttonId: 'tes5_no', buttonText: { displayText: 'No' }, type: 1 },
        ],
        headerType: 4,
      },
      { quoted: null }
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