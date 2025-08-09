let handler = async (m, { conn, usedPrefix, command, args }) => {
  let chat = global.db.data.chats[m.chat]
  
  if (!(m.chat in global.db.data.chats)) {
    return conn.reply(m.chat, `⚠️ Este chat no está registrado.`, m)
  }

  // El comando "bot" siempre funcionará aunque esté desactivado
  if (command === 'bot') {
    if (args.length === 0) {
      const estado = chat.isBanned ? '❌ Desactivado' : '✅ Activado'
      const info = `🤖 *Panel de Control del Bot*\n\n` +
                   `📌 Comandos disponibles para administradores:\n` +
                   `➡️ *${usedPrefix}bot on*  — Activar\n` +
                   `➡️ *${usedPrefix}bot off* — Desactivar\n\n` +
                   `📊 Estado actual: *${estado}*`
      return conn.reply(m.chat, info, m)
    }

    if (args[0].toLowerCase() === 'off') {
      if (chat.isBanned) return conn.reply(m.chat, `⚠️ ${botname} ya estaba desactivado.`, m)
      chat.isBanned = true
      return conn.reply(m.chat, `🚫 Has *desactivado* el bot.`, m)
    }

    if (args[0].toLowerCase() === 'on') {
      if (!chat.isBanned) return conn.reply(m.chat, `⚠️ ${botname} ya estaba activado.`, m)
      chat.isBanned = false
      return conn.reply(m.chat, `✅ Has *activado* al bot.`, m)
    }
  }
}

handler.help = ['bot']
handler.tags = ['grupo']
handler.command = ['bot']
handler.admin = true
handler.botAdminBypass = true // Permite que funcione aunque esté "off"

export default handler