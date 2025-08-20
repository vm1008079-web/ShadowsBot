let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  const groupId = m.chat
  const metadata = await conn.groupMetadata(groupId)
  const participants = metadata.participants
  const userInGroup = participants.find(p => p.id === m.sender)

  if (!userInGroup) return m.reply('No estás en este grupo.')

  // validar admin
  if (!userInGroup.admin && userInGroup.role !== 'admin' && userInGroup.role !== 'superadmin') {
    return m.reply('❌ No sos admin, no podés asignar bot primario.')
  }

  if (!global.db.data.chats[groupId]) global.db.data.chats[groupId] = {}

  global.db.data.chats[groupId].primaryBot = conn.user.jid
  global.db.data.chats[groupId].allBots = false

  m.reply(`✅ Este bot ahora es el *Bot Primario* en el grupo:\n*${metadata.subject}*`)
}

handler.help = ['setprimary']
handler.tags = ['serbot']
handler.command = ['setprimary']

export default handler