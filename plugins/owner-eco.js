var handler = async (m, { conn, args, command, usedPrefix, isOwner }) => {
  // --- VER BALANCE (bal2) ---
  if (command === 'bal2' || command === 'balance2') {
    let who = m.mentionedJid && m.mentionedJid[0] 
            ? m.mentionedJid[0] 
            : m.sender

    if (!isOwner && who !== m.sender) 
      return conn.reply(m.chat, `🚫 Solo el *Owner* puede ver el balance de otros.`, m)

    let user = global.db.data.users[who]
    if (!user) return conn.reply(m.chat, `⚠️ Usuario no encontrado en la base de datos.`, m)

    return conn.reply(m.chat, 
`📊 *BALANCE DE ${who === m.sender ? 'TU CUENTA' : '@' + who.split`@`[0]}* 📊

💰 Monedas: *${user.coin || 0}*
💠 Diamantes: *${user.diamond || 0}*
⭐ Experiencia: *${user.exp || 0}*`, 
      m, { mentions: [who], ...global.rcanal })
  }

  // --- SOLO OWNER PUEDE MODIFICAR ---
  if (!isOwner) return

  if (!args[0]) 
    return conn.reply(m.chat, `⚠️ Uso correcto:\n*${usedPrefix}${command} +1000*\n*${usedPrefix}${command} @usuario -500*`, m)

  // ✅ Asegurar que detecte bien positivos y negativos
  let value = Number(args[0])
  if (isNaN(value)) return conn.reply(m.chat, `❌ El valor debe ser un número.`, m)

  let who = m.mentionedJid && m.mentionedJid[0] 
          ? m.mentionedJid[0] 
          : m.sender

  let user = global.db.data.users[who]
  if (!user) return conn.reply(m.chat, `⚠️ Usuario no encontrado en la base de datos.`, m)

  if (command === 'coin') {
    user.coin = (user.coin || 0) + value
    return conn.reply(m.chat, `⚡ *RAYO DEL OWNER* ⚡\n\n💰 Monedas modificadas: *${value > 0 ? '+'+value : value}*\n📊 Total actual de @${who.split`@`[0]}: *${user.coin}*`, m, { mentions: [who], ...global.rcanal })
  }

  if (command === 'diamante') { // ✅ corregido aquí
    user.diamond = (user.diamond || 0) + value
    return conn.reply(m.chat, `⚡ *RAYO DEL OWNER* ⚡\n\n💠 Diamantes modificados: *${value > 0 ? '+'+value : value}*\n📊 Total actual de @${who.split`@`[0]}: *${user.diamond}*`, m, { mentions: [who], ...global.rcanal })
  }

  if (command === 'exp') {
    user.exp = (user.exp || 0) + value
    return conn.reply(m.chat, `⚡ *RAYO DEL OWNER* ⚡\n\n⭐ Experiencia modificada: *${value > 0 ? '+'+value : value}*\n📊 Total actual de @${who.split`@`[0]}: *${user.exp}*`, m, { mentions: [who], ...global.rcanal })
  }
}

handler.tags = ['eco']
handler.help = ['bal2']
handler.command = ['coin', 'diamante', 'exp', 'bal2', 'balance2']
handler.group = false
handler.register = false
handler.owner = true

export default handler
