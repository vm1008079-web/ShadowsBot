let handler = async (m, { conn }) => {
  if (!m.isGroup) return conn.reply(m.chat, '⚠️ Este comando solo funciona en grupos.', m)

  const chatId = m.chat
  const chatData = global.db.data.chats[chatId]
  const msgCount = chatData?.msgCount || {}

  if (Object.keys(msgCount).length === 0) return conn.reply(m.chat, '⚠️ No hay datos de mensajes aún.', m)

  let arr = Object.entries(msgCount)

  let list = await Promise.all(arr.map(async ([jid, count]) => {
    let name = jid
    try {
      name = await conn.getName(jid)
    } catch {}
    return { name, count }
  }))

  list.sort((a,b) => b.count - a.count)

  let text = `📊 *Conteo de mensajes por usuario*\n\n`
  list.forEach((u,i) => {
    text += `✨ *${i+1}.* ${u.name}: ${u.count} mensajes\n`
  })

  await conn.reply(m.chat, text.trim(), m)
}

handler.command = ['msgcount', 'mensajesgrupo']
handler.tags = ['grupo']
handler.admin = true
handler.group = true

export default handler