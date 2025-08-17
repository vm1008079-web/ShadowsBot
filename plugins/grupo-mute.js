let muteados = {}

// Función para validar si un usuario es admin o dueño del grupo
async function isAdminOrOwner(m, conn, userJid) {
    try {
        const groupMetadata = await conn.groupMetadata(m.chat)
        const participant = groupMetadata.participants.find(p => p.id === (userJid || m.sender))
        return participant?.admin || m.fromMe
    } catch {
        return false
    }
}

let handler = async (m, { conn }) => {
    if (!m.isGroup) return m.reply('🔒 Este comando solo funciona en grupos.')
    if (!m.quoted) return m.reply('Responde al mensaje de la persona que quieres mutear.')

    // Validar que el que ejecuta sea admin o owner
    const senderIsAdmin = await isAdminOrOwner(m, conn)
    if (!senderIsAdmin) return m.reply('❌ Solo admins pueden usar este comando.')

    const usuario = m.quoted.sender

    // Validar que no mutee admins
    const targetIsAdmin = await isAdminOrOwner(m, conn, usuario)
    if (targetIsAdmin) return m.reply('❌ No puedes mutear a un admin.')

    const nombre = await conn.getName(usuario)

    // Guardar el muteado
    muteados[m.chat] = muteados[m.chat] || {}
    muteados[m.chat][usuario.split('@')[0]] = true // guarda solo el número sin dominio

    m.reply(`🔇 ${nombre} ha sido muteado correctamente.`)
}

handler.command = /^mute$/i
handler.group = true
handler.admin = true

// Middleware para eliminar mensajes de usuarios muteados sin importar el dominio
global.conn.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
        const chat = msg.key.remoteJid
        const user = (msg.key.participant || msg.key.remoteJid).split('@')[0] // solo número

        if (muteados[chat]?.[user]) {
            try {
                await global.conn.sendMessage(chat, { delete: msg.key })
            } catch (e) {
                console.log('❌ Error eliminando mensaje muteado:', e)
            }
        }
    }
})

export default handler