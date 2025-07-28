import { addExif } from '../lib/sticker.js'
import fetch from 'node-fetch'
import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const emoji = 'ꕥ'
  const emoji2 = '✘'

  if (!m.quoted) return conn.sendMessage(m.chat, {
    text: `
${emoji} Debes responder a un *sticker* para usar este comando.
> ● *Ejemplo ›* ${usedPrefix + command} Cats-Pack • By Ado
`.trim(),
    ...global.rcanal
  }, { quoted: m })

  const stickerData = await m.quoted.download()
  if (!stickerData) return conn.sendMessage(m.chat, {
    text: `${emoji2} No se pudo descargar el sticker.`,
    ...global.rcanal
  }, { quoted: m })

  const textoParts = (text || '').split(/[\u2022|]/).map(part => part.trim())
  const userId = m.sender
  let packstickers = global.db.data.users[userId] || {}

  let texto1 = textoParts[0] || packstickers.text1 || global.packsticker || 'Mai Pack'
  let texto2 = textoParts[1] || packstickers.text2 || global.packsticker2 || 'By Wirk'

  try {
    const exif = await addExif(stickerData, texto1, texto2)
    await conn.sendMessage(m.chat, { sticker: exif, ...global.rcanal }, { quoted: m })
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, {
      text: `${emoji2} Error al agregar marca al sticker.`,
      ...global.rcanal
    }, { quoted: m })
  }
}

handler.help = ['wm']
handler.tags = ['sticker']
handler.command = ['take', 'robar', 'wm']
handler.register = true

export default handler