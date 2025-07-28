const handler = async (m, { conn }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!/image|video/.test(mime)) return m.reply('✿ Responde a una *imagen o video* para convertirlo en sticker')

  await m.react('🕒')
  try {
    const media = await q.download()
    await conn.sendMessage(m.chat, { 
      sticker: media 
    }, { quoted: m })
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('✘ No se pudo convertir a sticker')
  }
}

handler.help = ['sticker', 's']
handler.tags = ['sticker']
handler.command = ['sticker', 's']

export default handler