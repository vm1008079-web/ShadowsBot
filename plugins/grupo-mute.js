//--> Hecho por Ado-rgb (github.com/Ado-rgb)

let muteados = {}

let handler = async (m, { conn, participants }) => {
    if (!m.isGroup) return
    if (!m.quoted) return m.reply('Responde al mensaje de la persona que quieres mutear')
    if (!m.isAdmin && !m.isOwner) return m.reply('No tienes permisos para mutear')

    let usuario = m.quoted.sender
    let nombre = await conn.getName(usuario)
    
    muteados[m.chat] = muteados[m.chat] || {}
    muteados[m.chat][usuario] = true
    
    m.reply(`🔇 ${nombre} ha sido muteado`)
}

handler.command = /^mute$/i
handler.group = true
handler.admin = true

// Middleware para borrar mensajes de muteados
conn.ev.on('messages.upsert', async ({ messages }) => {
    for (let msg of messages) {
        let chat = msg.key.remoteJid
        let user = msg.key.participant || msg.key.remoteJid
        
        if (muteados[chat]?.[user]) {
            try {
                await conn.sendMessage(chat, { delete: msg.key })
            } catch (e) { console.log('Error eliminando mensaje muteado:', e) }
        }
    }
})

export default handler