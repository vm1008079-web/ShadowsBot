// Objeto que guarda muteados por subbot
let muteadosPorSubbot = {} // { [subbotJid]: { [chatId]: { [user]: true } } }

async function isAdminOrOwner(m, conn, userJid) {
    try {
        const groupMetadata = await conn.groupMetadata(m.chat)
        const participant = groupMetadata.participants.find(p => p.id === (userJid || m.sender))
        return participant?.admin || m.fromMe
    } catch {
        return false
    }
}

let handler = async (m, { conn, me }) => {
    if (!m.isGroup) return m.reply('🔒 Este comando solo funciona en grupos.')
    if (!m.quoted) return m.reply('Responde al mensaje de la persona que quieres mutear.')

    // Validar que el que ejecuta sea admin
    const senderIsAdmin = await isAdminOrOwner(m, conn)
    if (!senderIsAdmin) return m.reply('❌ Solo admins pueden usar este comando.')

    const usuario = m.quoted.sender

    // Validar que no mutee admins
    const targetIsAdmin = await isAdminOrOwner(m, conn, usuario)
    if (targetIsAdmin) return m.reply('❌ No puedes mutear a un admin.')

    const nombre = await conn.getName(usuario)

    // Guardar muteado por subbot
    const subbotId = me?.id || 'main' // si es subbot usa su ID, si no 'main'
    muteadosPorSubbot[subbotId] = muteadosPorSubbot[subbotId] || {}
    muteadosPorSubbot[subbotId][m.chat] = muteadosPorSubbot[subbotId][m.chat] || {}
    muteadosPorSubbot[subbotId][m.chat][usuario.split('@')[0]] = true

    m.reply(`🔇 ${nombre} ha sido muteado correctamente en este subbot.`)
}

handler.command = /^mute$/i

// Middleware para eliminar mensajes de usuarios muteados por subbot
global.conn.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
        const chat = msg.key.remoteJid
        const user = (msg.key.participant || msg.key.remoteJid).split('@')[0]

        // Revisar todos los subbots conectados y eliminar solo si pertenece al subbot correspondiente
        for (const subbotId in muteadosPorSubbot) {
            if (muteadosPorSubbot[subbotId]?.[chat]?.[user]) {
                try {
                    await global.conn.sendMessage(chat, { delete: msg.key })
                } catch (e) {
                    console.log(`❌ Error eliminando mensaje muteado por ${subbotId}:`, e)
                }
            }
        }
    }
})

export default handler