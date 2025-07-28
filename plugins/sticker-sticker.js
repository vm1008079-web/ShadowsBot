import { Sticker, StickerTypes } from 'wa-sticker-formatter'

const handler = async (m, { conn, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!/image|video/.test(mime)) 
    return conn.sendMessage(m.chat, { text: `✿ Responde a una *imagen o video* para convertirlo en sticker\n`, ...global.rcanal }, { quoted: m })

  await m.react('🕒')

  try {
    const media = await q.download()
    if (!media) throw new Error('No se pudo descargar la media')

    const sticker = new Sticker(media, {
      pack: global.packname || '✦ Michi - AI ✦',
      author: global.author || '© Made with ☁︎ Wirk ✧',
      type: StickerTypes.FULL,
      quality: 70
    })

    const buffer = await sticker.build()
    await conn.sendMessage(m.chat, { sticker: buffer, ...global.rcanal }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    conn.sendMessage(m.chat, { text: '╭─❀ *Error de Conversión* ❀─╮\n✘ No se pudo generar el sticker\n╰───────────────────────────╯', ...global.rcanal }, { quoted: m })
  }
}

handler.help = ['sticker', 's']
handler.tags = ['sticker']
handler.command = ['sticker', 's']

export default handler