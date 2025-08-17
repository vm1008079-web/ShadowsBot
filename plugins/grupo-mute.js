// plugin mute.js
let mutes = {}; // usuarios muteados por chat

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const chatId = m.key.remoteJid;
    const metadata = m.isGroup ? await conn.groupMetadata(chatId) : null;
    const isAdmin = m.isGroup ? metadata.participants.find(u => u.id === m.sender)?.admin : true;
    if (!isAdmin) return m.reply('❌ Solo los admins pueden usar este comando');

    const target = m.quoted ? m.quoted.sender : args[0];
    if (!target) return m.reply(`⚠️ Uso: ${usedPrefix + command} @usuario o respondiendo a su mensaje`);

    if (command === 'mute') {
        if (!mutes[chatId]) mutes[chatId] = [];
        if (mutes[chatId].includes(target)) return m.reply('⚠️ Este usuario ya está muteado');
        mutes[chatId].push(target);
        return m.reply(`✅ Usuario muteado: @${target.split('@')[0]}`);
    }

    if (command === 'unmute') {
        if (!mutes[chatId] || !mutes[chatId].includes(target)) return m.reply('⚠️ Este usuario no está muteado');
        mutes[chatId] = mutes[chatId].filter(u => u !== target);
        return m.reply(`✅ Usuario desmuteado: @${target.split('@')[0]}`);
    }
};

handler.command = ['mute','unmute'];
handler.group = true;

export default handler;

// before hook para eliminar mensajes de muteados
export async function before(m, { conn }) {
    const chatId = m.key.remoteJid;
    if (!mutes[chatId]) return true;

    if (mutes[chatId].includes(m.sender)) {
        try {
            await conn.deleteMessage(chatId, { id: m.key.id, remoteJid: chatId, fromMe: false });
        } catch (e) {
            await conn.sendMessage(chatId, { text: `⚠️ No pude eliminar el mensaje de @${m.sender.split('@')[0]}, puede que falten privilegios` }, { quoted: m });
        }
        return false;
    }
    return true;
}