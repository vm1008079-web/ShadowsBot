// plugin: primary-bot.js

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!m.isGroup) return m.reply('Este comando solo sirve en grupos')

    let chat = global.db.data.chats[m.chat] || {}

    // Sacar ID del subbot: o por respuesta o por mención
    let botID = null

    if (m.quoted && m.quoted.sender) {
        botID = m.quoted.sender // respondieron a un mensaje del subbot
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        botID = m.mentionedJid[0] // mencionaron al subbot
    }

    if (!botID) return m.reply(`Responde a un mensaje del subbot o menciónalo para ponerlo como primario`)

    chat.primaryBot = botID
    global.db.data.chats[m.chat] = chat

    return m.reply(`👑 Ahora *${botID.split('@')[0]}* es el único subbot que responderá en este grupo`)
}

handler.help = ['setprimary']
handler.tags = ['group']
handler.command = /^setprimary$/i
handler.group = true

export default handler

// Filtro para que solo el primario responda
export async function before(m, { conn }) {
    if (!m.isGroup) return true

    let chat = global.db.data.chats[m.chat] || {}
    if (chat.primaryBot && conn.user.jid !== chat.primaryBot) {
        return false // si no es el primario no responde
    }
    return true
}