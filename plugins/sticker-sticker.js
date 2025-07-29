import { sticker } from '../lib/sticker.js'

const handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!/image|video/.test(mime)) {
    return conn.sendMessage(
      m.chat,
      { text: `✿ Responde a una *imagen o video* para convertirlo en sticker\n`, ...global.rcanal },
      { quoted: m }
    )
  }

  await m.react('🕒')

  try {
    const media = await q.download()
    if (!media) throw new Error('No se pudo descargar la media')

    const packname = global.packname || '✦ Michi - AI ✦'
    const author = global.author || '© Made with ☁︎ Wirk ✧'

    const stiker = await sticker(media, false, packname, author)

    if (!Buffer.isBuffer(stiker)) throw new Error('No se pudo generar el sticker')

    await conn.sendMessage(m.chat, { sticker: stiker, ...global.rcanal }, { quoted: m })
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    await conn.sendMessage(
      m.chat,
      { text: '╭─❀ *Error de Conversión* ❀─╮\n✘ No se pudo generar el sticker\n╰───────────────────────────╯', ...global.rcanal },
      { quoted: m }
    )
  }
}

handler.help = ['sticker', 's']
handler.tags = ['sticker']
handler.command = ['sticker', 's']

export default handler