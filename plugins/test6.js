var handler = async (m, { conn, args, command, usedPrefix, isOwner }) => {
  if (!isOwner) return conn.reply(m.chat, `🚫 Solo el *Owner* puede usar este comando.`, m)

  if (!args[0]) return conn.reply(m.chat, `⚠️ Uso correcto:\n*${usedPrefix}${command} +1000*\n*${usedPrefix}${command} @usuario +500*`, m)

  // Valor a sumar/restar
  let value = parseInt(args[0])
  if (isNaN(value)) return conn.reply(m.chat, `❌ El valor debe ser un número.`, m)

  // Detectar usuario objetivo (mencionado o uno mismo)
  let who = m.mentionedJid && m.mentionedJid[0] 
          ? m.mentionedJid[0] 
          : m.sender

  let user = global.db.data.users[who]

  if (!user) return conn.reply(m.chat, `⚠️ Usuario no encontrado en la base de datos.`, m)

  // Según el comando modificar el recurso
  if (command === 'coin') {
    user.coin += value
    return conn.reply(m.chat, `⚡ *RAYO DEL OWNER* ⚡\n\n💰 Monedas modificadas: *${value > 0 ? '+'+value : value}*\n📊 Total actual de @${who.split`@`[0]}: *${user.coin}*`, m, { mentions: [who], ...global.rcanal })
  }

  if (command === 'diamond') {
    user.diamond += value
    return conn.reply(m.chat, `⚡ *RAYO DEL OWNER* ⚡\n\n💠 Diamantes modificados: *${value > 0 ? '+'+value : value}*\n📊 Total actual de @${who.split`@`[0]}: *${user.diamond}*`, m, { mentions: [who], ...global.rcanal })
  }

  if (command === 'exp') {
    user.exp += value
    return conn.reply(m.chat, `⚡ *RAYO DEL OWNER* ⚡\n\n⭐ Experiencia modificada: *${value > 0 ? '+'+value : value}*\n📊 Total actual de @${who.split`@`[0]}: *${user.exp}*`, m, { mentions: [who], ...global.rcanal })
  }
}

handler.command = ['coin', 'diamond', 'exp']
handler.group = false
handler.register = false
handler.rowner = true  // SOLO OWNER

export default handler