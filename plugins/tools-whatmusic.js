const handler = async (m, { conn }) => {
  if (!m.quoted) return await conn.reply(m.chat, 'Responde a un audio o video para probar', m)

  // Muestra la estructura de m.quoted para que veamos qué trae
  await conn.reply(m.chat, '```' + JSON.stringify(m.quoted, null, 2) + '```', m)
}

handler.command = /^testquoted$/i
handler.register = true
handler.tags = ['tools']
handler.help = ['testquoted']
export default handler