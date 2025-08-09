let handler = async (m, {
    conn,
    groupMetadata
}) => {
    conn.reply(m.chat, `${await groupMetadata.id}`, m)
}
handler.help = ['group-id']
handler.tags = ['owner']
handler.command = /^(group-id|idgc|gcid)$/i

export default handler