

let handler = async (m, { conn, groupMetadata }) => {
    try {
        const groupId = await groupMetadata.id
        await conn.reply(m.chat, `🆔 ID del grupo:\n${groupId}`, m)
    } catch (error) {
        console.error('❌ Error al obtener el ID del grupo:', error)
        await conn.reply(m.chat, '⚠️ No se pudo obtener el ID del grupo.', m)
    }
}

handler.help = ['group-id']
handler.tags = ['tools']
handler.command = /^(group-id|idgc|gcid)$/i

export default handler