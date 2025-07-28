import { sticker } from '../lib/sticker.js'

const handler = async (m, { conn, usedPrefix, command }) => {
  const quoted = m.quoted ? m.quoted : m
  const mime = (quoted.msg || quoted).mimetype || ''

  if (!/image|video/.test(mime))
    return m.reply(`✿ Debes responder a una *imagen o video* para convertir en sticker\n\n➪ Ejemplo:\n${usedPrefix + command}`)

  try {
    await m.react('🕒')

    const media = await quoted.download()
    const stiker = await sticker(media, false, global.packname, global.author)

    if (stiker) {
      await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
      await m.react('✅')
    } else {
      throw new Error('No se pudo generar sticker')
    }
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('✘ Error al convertir a sticker')
  }
}

handler.help = ['sticker', 's']
handler.tags = ['sticker']
handler.command = ['sticker', 's', 'sgif', 'stik', 'stick']

export default handler