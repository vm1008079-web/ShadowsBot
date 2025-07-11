const handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo funciona en grupos.')

  // Obtener metadata del grupo
  const groupMetadata = await conn.groupMetadata(m.chat)
  const participants = groupMetadata.participants || []
  const participant = participants.find(p => p.id === m.sender)

  // Validar si el usuario es admin o dueño (como el ejemplo que diste)
  const isAdmin = participant?.admin || m.fromMe
  if (!isAdmin) return m.reply('❌ Este comando es solo para administradores.')

  // Decoraciones y mensaje
  const mainEmoji = global.db.data.chats[m.chat]?.customEmoji || '☕'
  const decoEmoji1 = '✨'
  const decoEmoji2 = '📢'

  m.react(mainEmoji)

  const mensaje = args.join(' ') || '¡Atención a todos!'
  const total = participants.length

  const encabezado = 
`${decoEmoji2} *Mención general activada* ${decoEmoji2}

> 💬 Mensaje: *${mensaje}*
> 👥 Total de miembros: *${total}*`

  const cuerpo = participants.map(p => `> ${mainEmoji} @${p.id.split('@')[0]}`).join('\n')
  const pie = `\n${decoEmoji1} Comando ejecutado: *${usedPrefix + command}*`

  const textoFinal = `${encabezado}\n\n${cuerpo}\n${pie}`

  // Enviar mensaje con menciones
  await conn.sendMessage(m.chat, {
    text: textoFinal.trim(),
    mentions: participants.map(p => p.id)
  })
}

handler.help = ['invocar *<mensaje opcional>*']
handler.tags = ['group']
handler.command = ['todos', 'invocar', 'tagall']
handler.group = true
handler.register = true

export default handler