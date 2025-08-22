import fs from "fs"
import path from "path"

const DIGITS = (s = "") => String(s || "").replace(/\D/g, "")

async function isAdminOrOwner(m, conn) {
  try {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const participant = groupMetadata.participants.find(p => p.id === m.sender)
    return participant?.admin || m.fromMe
  } catch {
    return false
  }
}

const handler = async (m, { conn, text }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo funciona en grupos.')

  const admin = await isAdminOrOwner(m, conn)
  if (!admin) return m.reply('❌ Solo admins pueden abrir o cerrar el grupo.')

  const command = (text || '').toLowerCase().trim()

  if (command === "grupo abrir") {
    await conn.groupSettingUpdate(m.chat, "not_announcement") // abre el grupo
    await conn.sendMessage(m.chat, { text: "✅ El grupo ha sido abierto, todos pueden escribir." }, { quoted: m })
  } else if (command === "grupo cerrar") {
    await conn.groupSettingUpdate(m.chat, "announcement") // cierra el grupo
    await conn.sendMessage(m.chat, { text: "🔒 El grupo ha sido cerrado, solo admins pueden escribir." }, { quoted: m })
  } else {
    await conn.sendMessage(m.chat, { text: "📌 Usa:\n- grupo abrir\n- grupo cerrar" }, { quoted: m })
  }
}

handler.command = ['grupo']
handler.group = true
handler.register = false
handler.tags = ['group']
handler.help = ['grupo abrir', 'grupo cerrar']

export default handler