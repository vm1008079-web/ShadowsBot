let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.isGroup) throw `👥 Este comando solo funciona en grupos`
  if (!m.isAdmin) throw `❌ Solo los admins pueden usar este comando`
  if (!m.isBotAdmin) throw `⚠️ El bot necesita ser admin primero`

  let users = m.mentionedJid.concat(
    args[0] ? [args[0].replace(/[@ .+-]/g, '') + '@s.whatsapp.net'] : []
  )

  if (users.length === 0) throw `⚡ Etiqueta o pasa el número.\n\n👉 Ejemplo: ${usedPrefix + command} @usuario`

  for (let user of users) {
    await conn.groupParticipantsUpdate(m.chat, [user], 'promote')
    m.reply(`✅ @${user.split('@')[0]} ahora es admin`, null, {
      mentions: [user]
    })
  }
}

handler.help = ['promote @usuario']
handler.tags = ['grupo']
handler.command = /^promote$/i
handler.group = true
handler.admin = true


export default handler