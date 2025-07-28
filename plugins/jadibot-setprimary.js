// plugin: primary-control.js

let handler = async (m, { conn, command }) => {
    if (!m.isGroup) return m.reply('Solo funciona en grupos')

    let chat = global.db.data.chats[m.chat] || {}
    let botID = null

    // Detecta al subbot: respondiendo mensaje o mencionando
    if (m.quoted && m.quoted.sender) {
        botID = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        botID = m.mentionedJid[0]
    }

    if (/^setprimary$/i.test(command)) {
        if (!botID) return m.reply('Responde al subbot o menciónalo para hacerlo primario')
        chat.primaryBot = botID
        global.db.data.chats[m.chat] = chat
        return m.reply(`👑 *${botID.split('@')[0]}* ahora es el único que responde en este grupo`)
    }

    if (/^getprimary$/i.test(command)) {
        if (!chat.primaryBot) return m.reply('No hay subbot primario en este grupo')
        return m.reply(`👑 Subbot primario: *${chat.primaryBot.split('@')[0]}*`)
    }

    if (/^delprimary$/i.test(command)) {
        if (!chat.primaryBot) return m.reply('No hay primario que borrar')
        delete chat.primaryBot
        global.db.data.chats[m.chat] = chat
        return m.reply('❎ Se eliminó el subbot primario de este grupo')
    }
}

handler.command = /^(setprimary|getprimary|delprimary)$/i
handler.group = true

export default handler

// --- Filtro que bloquea otros subbots ---
export async function before(m, { conn }) {
    if (!m.isGroup) return true

    let chat = global.db.data.chats[m.chat] || {}
    if (chat.primaryBot && conn.user.jid !== chat.primaryBot) {
        return false // este bot no es el primario, no responde
    }
    return true
}