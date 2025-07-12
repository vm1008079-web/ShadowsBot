// plugins/addco.js
import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, args, isOwner, isROwner }) => {
  const chatId = m.chat
  const isGroup = m.isGroup
  const senderId = m.sender
  const senderNum = senderId.replace(/[^0-9]/g, "")
  const fromMe = m.key.fromMe

  // Verificación de permisos
  if (isGroup && !isOwner && !isROwner && !fromMe) {
    const metadata = await conn.groupMetadata(chatId)
    const participant = metadata.participants.find(p => p.id === senderId)
    const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin'
    if (!isAdmin) {
      return m.reply("🚫 *Solo los administradores, el owner o el bot pueden usar este comando.*")
    }
  } else if (!isGroup && !isOwner && !fromMe) {
    return m.reply("🚫 *Solo el owner o el mismo bot pueden usar este comando en privado.*")
  }

  // Verifica que se responda a un sticker
  const quoted = m.quoted?.stickerMessage ? m.quoted : m.message?.extendedTextMessage?.contextInfo?.quotedMessage
  if (!quoted?.stickerMessage) {
    return m.reply("❌ *Responde a un sticker para asignarle un comando.*")
  }

  const comando = args.join(" ").trim()
  if (!comando) return m.reply("⚠️ *Especifica el comando a asignar. Ejemplo:* .addco kick")

  const fileSha = quoted.stickerMessage.fileSha256?.toString("base64")
  if (!fileSha) return m.reply("❌ *No se pudo obtener el ID único del sticker.*")

  const jsonPath = path.resolve('./comandos.json')
  const data = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, "utf-8")) : {}

  data[fileSha] = comando
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2))

  await conn.sendMessage(chatId, {
    react: { text: "✅", key: m.key }
  })

  return m.reply(`✅ *Sticker vinculado al comando con éxito:* \`${comando}\``)
}

handler.command = /^addco$/i
handler.help = ['addco <comando>']
handler.tags = ['tools']
handler.register = true

export default handler