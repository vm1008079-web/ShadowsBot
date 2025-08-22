let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.isGroup) return conn.reply(m.chat, `✳️ Este comando solo se puede usar en grupos`, m)
  if (!m.isAdmin && !m.isOwner) return conn.reply(m.chat, `✳️ Solo admins pueden usar este comando`, m)

  if (!args[0]) {
    return conn.reply(m.chat, `✳️ Usa:\n\n${usedPrefix + command} *abrir*\n${usedPrefix + command} *cerrar*`, m)
  }

  let action = args[0].toLowerCase()

  if (action === "abrir") {
    await conn.groupSettingUpdate(m.chat, 'not_announcement')
    conn.reply(m.chat, `✅ El grupo ha sido *abierto*`, m)
  } else if (action === "cerrar") {
    await conn.groupSettingUpdate(m.chat, 'announcement')
    conn.reply(m.chat, `✅ El grupo ha sido *cerrado*`, m)
  } else {
    conn.reply(m.chat, `✳️ Opción no válida\n\nUsa:\n${usedPrefix + command} *abrir*\n${usedPrefix + command} *cerrar*`, m)
  }
}

handler.help = ['grupo *abrir/cerrar*']
handler.tags = ['group']
handler.command = /^grupo$/i
handler.admin = true
handler.group = true

export default handler