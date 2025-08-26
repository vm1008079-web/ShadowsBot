import fs from 'fs'

let handler = async (m, { conn }) => {
  const destinatario = '51917160311@s.whatsapp.net'
  try {
    const imagenBuffer = fs.readFileSync('./storage/img/menu.jpg')

    await conn.sendMessage(destinatario, {
      image: imagenBuffer,
      caption: 'hola test sin botones'
    })

    await m.reply('mensaje enviado ✅ (test sin botones)')
  } catch (e) {
    await m.reply(`❌ error: ${e?.message || e}`)
  }
}

handler.command = ['tes5']

export default handler