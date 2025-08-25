var handler = async (m, { conn, args, command, usedPrefix, isOwner }) => {
  // --- VER BALANCE (bal2 / balance2) ---
  if (command === 'bal2' || command === 'balance2') {
    let who = (m.mentionedJid && m.mentionedJid[0]) ? m.mentionedJid[0] : m.sender

    // solo Owner puede ver el balance de otros
    if (!isOwner && who !== m.sender) 
      return conn.reply(m.chat, `🚫 Solo el *Owner* puede ver el balance de otros.`, m)

    let user = global.db.data.users[who]
    if (!user) return conn.reply(m.chat, `⚠️ Usuario no encontrado en la base de datos.`, m)

    return conn.reply(m.chat, 
`📊 *BALANCE DE ${who === m.sender ? 'TU CUENTA' : '@' + who.split\`@\`[0]}* 📊

💰 Monedas: *${Number(user.coin || 0)}*
💠 Diamantes: *${Number(user.diamond || 0)}*
⭐ Experiencia: *${Number(user.exp || 0)}*`,
      m, { mentions: [who], ...global.rcanal })
  }

  // --- DESDE AQUÍ, SOLO OWNER MODIFICA ---
  if (!isOwner) return

  // Buscar el número en cualquier posición (soporta + y -)
  const numToken = args.find(a => /^[-+]?\d+$/.test(a))
  if (!numToken) {
    return conn.reply(
      m.chat,
      `⚠️ Uso correcto:\n` +
      `• *${usedPrefix}${command} +1000*\n` +
      `• *${usedPrefix}${command} @usuario -500*`,
      m
    )
  }

  let value = parseInt(numToken)
  // objetivo: mencionado o uno mismo
  let who = (m.mentionedJid && m.mentionedJid[0]) ? m.mentionedJid[0] : m.sender

  let user = global.db.data.users[who]
  if (!user) return conn.reply(m.chat, `⚠️ Usuario no encontrado en la base de datos.`, m)

  // asegurar campos numéricos
  user.coin = Number(user.coin) || 0
  user.diamond = Number(user.diamond) || 0
  user.exp = Number(user.exp) || 0

  const sign = value >= 0 ? '+' : '' // para mostrar +/-

  if (command === 'coin') {
    user.coin += value
    return conn.reply(
      m.chat,
      `⚡ *RAYO DEL OWNER* ⚡\n\n` +
      `💰 Monedas: *${sign}${value}*\n` +
      `📊 Total de @${who.split\`@\`[0]}: *${user.coin}*`,
      m, { mentions: [who], ...global.rcanal }
    )
  }

  if (command === 'diamante') {
    user.diamond += value
    return conn.reply(
      m.chat,
      `⚡ *RAYO DEL OWNER* ⚡\n\n` +
      `💠 Diamantes: *${sign}${value}*\n` +
      `📊 Total de @${who.split\`@\`[0]}: *${user.diamond}*`,
      m, { mentions: [who], ...global.rcanal }
    )
  }

  if (command === 'exp') {
    user.exp += value
    return conn.reply(
      m.chat,
      `⚡ *RAYO DEL OWNER* ⚡\n\n` +
      `⭐ Experiencia: *${sign}${value}*\n` +
      `📊 Total de @${who.split\`@\`[0]}: *${user.exp}*`,
      m, { mentions: [who], ...global.rcanal }
    )
  }
}

handler.command = ['coin', 'diamante', 'exp', 'bal2', 'balance2']
handler.group = false
handler.register = false
// NO pongas handler.owner = true aquí, para que bal2 funcione a todos.
// Los comandos de modificar ya están restringidos adentro con isOwner.

export default handler