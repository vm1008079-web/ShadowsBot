import fs from 'fs'

let handler = async (m, { conn }) => {
  try {
    // Carga la imagen desde la ruta
    let img = fs.readFileSync('./storage/img/menu.jpg')

    await conn.sendMessage(
      m.chat, // se envía al chat donde ejecutas el comando
      {
        image: img,
        caption: 'hola',
        buttons: [
          { buttonId: 'si', buttonText: { displayText: 'Si' }, type: 1 },
          { buttonId: 'no', buttonText: { displayText: 'No' }, type: 1 },
        ],
        headerType: 4
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