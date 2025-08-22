let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!m.isGroup) return m.reply('❌ Solo funciona en grupos wey');
    if (!text) return m.reply(`⚠️ Menciona al wey que quieres promover\nEjemplo: ${usedPrefix + command} @usuario`);

    // Extraer las menciones del mensaje
    let mentions = m.mentionedJid;
    if (!mentions || mentions.length === 0) return m.reply('❌ Debes mencionar a alguien wey');

    try {
        for (let user of mentions) {
            await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
        }
        m.reply(`✅ Listo wey, promovido(s) a admin: ${mentions.map(u => '@' + u.split('@')[0]).join(', ')}`, null, { mentions });
    } catch (err) {
        console.log(err);
        m.reply('❌ No pude promover al wey, revisa que soy admin y que el usuario está en el grupo');
    }
};

handler.command = /^(promote|subir)$/i;
handler.group = true;
handler.admin = true;

export default handler;