import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, isAdmin, isROwner }) => {
  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./JadiBots', senderNumber)


  if (!(isAdmin || isROwner || fs.existsSync(botPath))) {
    return m.reply('❌ No tienes permisos para usar este comando. Solo admins, owners o subbots pueden hacerlo.')
  }

  global.db.data.chats[m.chat].isBanned = true
  m.reply('🍿 Bot baneado con éxito.')
}

handler.help = ['banearbot']
handler.tags = ['group']
handler.command = ['banearbot', 'banchat']
handler.group = true 

export default handler