// Esto va en tu archivo principal o donde manejes mensajes
async function onMessage(m, conn) {
  if (!m.isGroup) return
  const chatId = m.chat
  const userId = m.sender

  if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {}
  if (!global.db.data.chats[chatId].msgCount) global.db.data.chats[chatId].msgCount = {}

  if (!global.db.data.chats[chatId].msgCount[userId]) global.db.data.chats[chatId].msgCount[userId] = 0
  global.db.data.chats[chatId].msgCount[userId] += 1
}

// Comando para mostrar conteo de mensajes
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

export default {
  onMessage,
  handler
}