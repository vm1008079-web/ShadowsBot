import fs from "fs"
import path from "path"

const DIGITS = (s = "") => String(s || "").replace(/\D/g, "")

function findParticipantByDigits(parts = [], digits = "") {
  if (!digits) return null
  return parts.find(
    p => DIGITS(p?.id || "") === digits || DIGITS(p?.jid || "") === digits
  ) || null
}

export const handler = async (msg, { conn, text }) => {
  const chatId   = msg.key.remoteJid
  const isGroup  = chatId.endsWith("@g.us")
  const isFromMe = !!msg.key.fromMe

  const senderRaw = msg.key.participant || msg.key.remoteJid
  const senderNum = DIGITS(typeof msg.realJid === "string" ? msg.realJid : senderRaw)

  if (!isGroup) {
    await conn.sendMessage(chatId, { text: "❌ *Este comando solo funciona en grupos.*" }, { quoted: msg })
    return
  }

  // owners y bot
  const ownerPath = path.resolve("owner.json")
  const owners = fs.existsSync(ownerPath) ? JSON.parse(fs.readFileSync(ownerPath, "utf-8")) : []
  const isOwner = Array.isArray(owners) && owners.some(([id]) => id === senderNum)

  const botRaw = conn.user?.id || ""
  const botNum = DIGITS(botRaw.split(":")[0])
  const isBot  = botNum === senderNum

  let metadata
  try {
    metadata = await conn.groupMetadata(chatId)
  } catch (e) {
    console.error("[grupo] metadata error:", e)
    await conn.sendMessage(chatId, { text: "❌ No pude leer la metadata del grupo." }, { quoted: msg })
    return
  }

  const participantes = Array.isArray(metadata?.participants) ? metadata.participants : []
  const authorP = findParticipantByDigits(participantes, senderNum)
  const isAdmin = !!authorP && (authorP.admin === "admin" || authorP.admin === "superadmin")

  if (!isAdmin && !isOwner && !isBot && !isFromMe) {
    await conn.sendMessage(chatId, {
      text: "⛔ *Solo administradores u owners pueden usar este comando.*"
    }, { quoted: msg })
    return
  }

  // texto de comando
  const comando = (text || "").toLowerCase().trim()

  if (comando === "grupo abrir") {
    await conn.groupSettingUpdate(chatId, "not_announcement")
    await conn.sendMessage(chatId, { text: "✅ *El grupo ha sido abierto, ahora todos pueden escribir.*" }, { quoted: msg })
  } else if (comando === "grupo cerrar") {
    await conn.groupSettingUpdate(chatId, "announcement")
    await conn.sendMessage(chatId, { text: "🔒 *El grupo ha sido cerrado, solo admins pueden escribir.*" }, { quoted: msg })
  } else {
    await conn.sendMessage(chatId, { text: "📌 Usa:\n- *grupo abrir*\n- *grupo cerrar*" }, { quoted: msg })
  }

  await conn.sendMessage(chatId, { react: { text: "🧔🏻", key: msg.key } }).catch(() => {})
}

handler.command = /^(grupo)$/i

export default handler