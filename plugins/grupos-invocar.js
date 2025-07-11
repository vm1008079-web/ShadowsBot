import db from '../lib/database.js'

async function isAdminOrOwner(m, conn) {
  try {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const participant = groupMetadata.participants.find(p => p.id === m.sender)
    return participant?.admin || m.fromMe
  } catch {
    return false
  }
}

const handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo funciona en grupos.')

  const isAdmin = await isAdminOrOwner(m, conn)
  if (!isAdmin) return m.reply('❌ Solo los administradores pueden usar este comando.')

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]

  const groupMetadata = await conn.groupMetadata(m.chat)
  const participants = groupMetadata.participants || []

  const mainEmoji = chat.customEmoji || '☕'
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

  await conn.sendMessage(m.chat, {
    text: textoFinal.trim(),
    mentions: participants.map(p => p.id)
  })
}

handler.help = ['invocar *<mensaje>*', 'tagall *<mensaje>*']
handler.tags = ['group']
handler.command = ['todos', 'invocar', 'tagall']
handler.group = true
handler.register = true

export default handler