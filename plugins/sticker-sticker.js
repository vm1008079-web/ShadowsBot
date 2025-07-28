import { Sticker, StickerTypes } from 'wa-sticker-formatter'

const handler = async (m, { conn, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!/image|video/.test(mime)) 
    return m.reply(`✿ Responde a una *imagen o video* para convertirlo en sticker\n\n➪ Ejemplo:\n${usedPrefix + command}`)

  await m.react('🕒')

  try {
    const media = await q.download()
    if (!media) throw new Error('No se pudo descargar la media')

    const sticker = new Sticker(media, {
      pack: global.packname || '✦ Michi - AI ✦',
      author: global.author || '© Made with ☁︎ Wirk ✧',
      type: StickerTypes.FULL, // FULL = mantiene tamaño original
      quality: 70
    })

    const buffer = await sticker.build()
    await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('╭─❀ *Error de Conversión* ❀─╮\n✘ No se pudo generar el sticker\n╰───────────────────────────╯')
  }
}

handler.help = ['sticker', 's']
handler.tags = ['sticker']
handler.command = ['sticker', 's']

export default handler