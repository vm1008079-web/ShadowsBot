let handler = async (m, { conn, text }) => {
  if (!text || !text.endsWith('@g.us')) {
    return m.reply('Debes escribir el ID del grupo, ejemplo:\n.delprimary 120363xxxxx@g.us')
  }

  const groupId = text.trim()

  if (!global.db.data.chats[groupId]) global.db.data.chats[groupId] = {}

  if (!global.db.data.chats[groupId].primaryBot) {
    return m.reply('Ese grupo no tiene un bot principal asignado.')
  }

  delete global.db.data.chats[groupId].primaryBot

  m.reply(`Se eliminó el bot principal del grupo:\n*${groupId}*`)
}

handler.help = ['delprimary <IDgrupoxxxx@g.us>']
handler.tags = ['serbot']
handler.command = ['delprimary']
handler.admin = true // opcional: solo admins pueden usarlo

export default handler