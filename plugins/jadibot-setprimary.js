// plugin: primary-control.js

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, command }) => {
    if (!m.isGroup) return m.reply('Solo funciona en grupos')

    let chat = global.db.data.chats[m.chat] || {}
    let botID = null

    // obtener número del subbot respondiendo o mencionando
    if (m.quoted && m.quoted.sender) botID = m.quoted.sender.split('@')[0]
    else if (m.mentionedJid && m.mentionedJid.length > 0) botID = m.mentionedJid[0].split('@')[0]

    if (/^setprimary$/i.test(command)) {
        if (!botID) return m.reply('Responde al subbot o menciónalo para ponerlo como primario')
        // verificar si ese número existe en ./JadiBots/
        if (!fs.existsSync(path.join('./JadiBots', botID + '.json'))) {
            return m.reply('Ese subbot no está registrado en ./JadiBots/')
        }
        chat.primaryBot = botID
        global.db.data.chats[m.chat] = chat
        return m.reply(`👑 *${botID}* ahora es el único subbot que responde aquí`)
    }

    if (/^getprimary$/i.test(command)) {
        if (!chat.primaryBot) return m.reply('No hay subbot primario en este grupo')
        return m.reply(`👑 Subbot primario: *${chat.primaryBot}*`)
    }

    if (/^delprimary$/i.test(command)) {
        if (!chat.primaryBot) return m.reply('No hay primario que borrar')
        delete chat.primaryBot
        global.db.data.chats[m.chat] = chat
        return m.reply('❎ Subbot primario eliminado')
    }
}

handler.command = /^(setprimary|getprimary|delprimary)$/i
handler.group = true

export default handler

// --- Filtro para bloquear subbots no primarios ---
export async function before(m, { conn }) {
    if (!m.isGroup) return true

    let chat = global.db.data.chats[m.chat] || {}
    if (chat.primaryBot) {
        // sacar número del subbot actual (archivo en ./JadiBots/)
        let thisBot = conn.user.jid.split('@')[0]
        if (thisBot !== chat.primaryBot) {
            return false // este no es el primario, no responde
        }
    }
    return true
}