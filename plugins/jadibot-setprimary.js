// plugin: primary-bot.js

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!m.isGroup) return m.reply('Este comando solo sirve en grupos')

    let chat = global.db.data.chats[m.chat] || {}
    let subCmd = command.toLowerCase()

    if (subCmd === 'setprimary') {
        if (!args[0]) return m.reply(`Usa: ${usedPrefix}setprimary <id_del_subbot>`)
        chat.primaryBot = args[0]
        global.db.data.chats[m.chat] = chat
        return m.reply(`✅ El subbot *${args[0]}* ahora es el primario del grupo`)
    }

    if (subCmd === 'getprimary') {
        if (!chat.primaryBot) return m.reply('❌ No hay ningún subbot primario en este grupo')
        return m.reply(`👑 El subbot primario aquí es: *${chat.primaryBot}*`)
    }

    if (subCmd === 'delprimary') {
        if (!chat.primaryBot) return m.reply('No hay primario que borrar')
        delete chat.primaryBot
        global.db.data.chats[m.chat] = chat
        return m.reply('❎ Se eliminó el subbot primario de este grupo')
    }
}

handler.help = ['setprimary <id>', 'getprimary', 'delprimary']
handler.tags = ['group']
handler.command = /^(setprimary|getprimary|delprimary)$/i
handler.group = true
handler.admin = true

export default handler

// Filtro para que solo el primario responda
export async function before(m, { conn }) {
    if (!m.isGroup) return true

    let chat = global.db.data.chats[m.chat] || {}
    if (chat.primaryBot && conn.user.jid !== chat.primaryBot) {
        // si hay primario y este bot no es el primario, no responde
        return false
    }
    return true
}