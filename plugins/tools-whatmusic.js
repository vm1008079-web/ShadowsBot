// plugins/grupo-lumi.js
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, args, isAdmin, isOwner, isROwner, command }) => {
  const chatId = m.chat
  const senderId = m.sender
  const isGroup = chatId.endsWith('@g.us')
  const senderClean = senderId.replace(/[^0-9]/g, '')

  if (!isGroup) return m.reply('❌ Este comando solo puede usarse en grupos.')

  const metadata = await conn.groupMetadata(chatId)
  const participante = metadata.participants.find(p => p.id === senderId)
  const isBotAdmin = metadata.participants.find(p => p.id === conn.user.jid)?.admin
  const isSenderAdmin = participante?.admin === 'admin' || participante?.admin === 'superadmin'

  if (!isSenderAdmin && !isOwner && !isROwner) {
    return m.reply('🚫 Solo los administradores del grupo, el owner o el bot pueden usar este comando.')
  }

  if (!args[0] || !['on', 'off'].includes(args[0].toLowerCase())) {
    return m.reply('⚙️ Usa: *.lumi on* o *.lumi off* para activar o desactivar la IA Lumi en este grupo.')
  }

  const activosPath = path.resolve('./activos.json')
  let activos = {}
  if (fs.existsSync(activosPath)) {
    activos = JSON.parse(fs.readFileSync(activosPath, 'utf-8'))
  }

  if (!activos.lumi) activos.lumi = {}

  if (args[0].toLowerCase() === 'on') {
    activos.lumi[chatId] = true
    m.reply('✅ *Lumi activada* en este grupo.')
  } else {
    delete activos.lumi[chatId]
    m.reply('🛑 *Lumi desactivada* en este grupo.')
  }

  fs.writeFileSync(activosPath, JSON.stringify(activos, null, 2))

  await conn.sendMessage(chatId, {
    react: { text: '✨', key: m.key }
  })
}

handler.command = /^lumi$/i
handler.group = true
handler.register = true

export default handler