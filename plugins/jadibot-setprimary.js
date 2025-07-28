import fs from 'fs'
import path from 'path'

function existeSubbot(numero) {
  let dir = path.join('./JadiBots', numero)
  return fs.existsSync(dir) && fs.lstatSync(dir).isDirectory()
}

let handler = async (m, { conn, args, command }) => {
  let chat = global.db.data.chats[m.chat] || {}
  if (!m.isGroup) return m.reply('Solo funciona en grupos')

  let botID = null
  if (m.quoted && m.quoted.sender) botID = m.quoted.sender.split('@')[0]
  else if (m.mentionedJid && m.mentionedJid.length > 0) botID = m.mentionedJid[0].split('@')[0]
  else if (args[0]) botID = args[0].replace(/[^0-9]/g, '')

  if (!botID) return m.reply('Responde a un mensaje del subbot, menciónalo o escribe su número')

  if (!existeSubbot(botID)) return m.reply(`No existe subbot con número ${botID} en ./JadiBots/`)

  chat.primaryBot = botID
  global.db.data.chats[m.chat] = chat
  return m.reply(`👑 Subbot primario establecido:\n*${botID}*`)
}

handler.command = /^setprimary$/i
handler.group = true

export default handler