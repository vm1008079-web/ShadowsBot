let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Pon el texto que quieres enviar efímero\nEj: .efimero Hola mundo')

    await conn.sendMessage(m.chat, {
        text: text,
        ephemeralExpiration: 60 // segundos (1 min)
    }, { quoted: m })

    m.reply('✅ Mensaje efímero enviado (1 min)')
}

handler.command = /^efimero$/i


export default handler