import { writeFileSync, existsSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

// Frases malévolas de Goku Black
const gokuPhrases = {
    success: [
        "🐉 𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 𝐒𝐄 𝐌𝐀𝐍𝐈𝐅𝐄𝐒𝐓𝐀...",
        "⚡ 𝐋𝐀 𝐕𝐎𝐋𝐔𝐍𝐓𝐀𝐃 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 𝐒𝐄 𝐂𝐔𝐌𝐏𝐋𝐄...",
        "🌑 𝐄𝐋 𝐕𝐀𝐂Í𝐎 𝐎𝐁𝐄𝐃𝐄𝐂𝐄 𝐌𝐈 𝐌𝐀𝐍𝐃𝐀𝐓𝐎...",
        "💀 𝐋𝐀 𝐉𝐔𝐒𝐓𝐈𝐂𝐈𝐀 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 𝐏𝐑𝐄𝐕𝐀𝐋𝐄𝐂𝐄..."
    ],
    error: [
        "🔥 𝐓𝐔 𝐈𝐍𝐔𝐓𝐈𝐋𝐈𝐃𝐀𝐃 𝐌𝐄 𝐃𝐈𝐕𝐈𝐄𝐑𝐓𝐄, 𝐌𝐎𝐑𝐓𝐀𝐋...",
        "⚡ 𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 𝐅𝐀𝐋𝐋𝐀 𝐀𝐍𝐓𝐄 𝐓𝐔 𝐈𝐍𝐂𝐎𝐌𝐏𝐄𝐓𝐄𝐍𝐂𝐈𝐀...",
        "🌑 𝐍𝐈 𝐒𝐈𝐐𝐔𝐈𝐄𝐑𝐀 𝐏𝐔𝐄𝐃𝐄𝐒 𝐄𝐉𝐄𝐂𝐔𝐓𝐀𝐑 𝐔𝐍 𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐒𝐄𝐍𝐂𝐈𝐋𝐋𝐎...",
        "💀 𝐓𝐔 𝐄𝐗𝐈𝐒𝐓𝐄𝐍𝐂𝐈𝐀 𝐄𝐒 𝐔𝐍 𝐅𝐑𝐀𝐂𝐀𝐒𝐎 𝐂𝐎𝐍𝐓𝐈𝐍𝐔𝐎..."
    ],
    warning: [
        "⚠️ 𝐄𝐋 𝐃𝐈𝐎𝐒 𝐓𝐄 𝐎𝐁𝐒𝐄𝐑𝐕𝐀, 𝐌𝐎𝐑𝐓𝐀𝐋...",
        "⚡ 𝐍𝐎 𝐏𝐑𝐎𝐕𝐎𝐐𝐔𝐄𝐒 𝐋𝐀 𝐈𝐑𝐀 𝐃𝐄𝐋 𝐕𝐀𝐂Í𝐎...",
        "🌑 𝐓𝐔 𝐃𝐄𝐒𝐎𝐁𝐄𝐃𝐈𝐄𝐍𝐂𝐈𝐀 𝐓𝐄 𝐂𝐎𝐍𝐃𝐄𝐍𝐀...",
        "💀 𝐄𝐋 𝐃𝐈𝐎𝐒 𝐍𝐎 𝐓𝐈𝐄𝐍𝐄 𝐏𝐀𝐂𝐈𝐄𝐍𝐂𝐈𝐀 𝐂𝐎𝐍 𝐋𝐎𝐒 𝐈𝐍𝐂𝐀𝐏𝐀𝐂𝐄𝐒..."
    ]
};

function getRandomPhrase(type) {
    return gokuPhrases[type][Math.floor(Math.random() * gokuPhrases[type].length)];
}

let handler = async (m, { conn, usedPrefix, command, text, isAdmin, isOwner, groupMetadata }) => {
    if (!m.isGroup) return m.reply('🚫 *𝐒𝐎𝐋𝐎 𝐄𝐍 𝐑𝐄𝐈𝐍𝐎𝐒 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒*');
    
    if (!isAdmin && !isOwner) {
        return conn.sendMessage(m.chat, {
            text: `⛔ *𝐒𝐎𝐋𝐎 𝐋𝐎𝐒 𝐄𝐋𝐄𝐆𝐈𝐃𝐎𝐒 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒*\n\nNo tienes el poder para usar este comando.`,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
    }

    const argsText = text ? text.split(' ') : [];
    const cmd = command.toLowerCase();

    // COMANDO: #hidetag / #invocar / #tagall / #todos
    if (cmd === 'hidetag' || cmd === 'invocar' || cmd === 'tagall' || cmd === 'todos') {
        const message = text || '𝐄𝐋 𝐃𝐈𝐎𝐒 𝐇𝐀 𝐇𝐀𝐁𝐋𝐀𝐃𝐎... 📢';
        const participants = groupMetadata.participants.map(p => p.id);
        
        return conn.sendMessage(m.chat, {
            text: `🐉 *𝐏𝐑𝐎𝐍𝐔𝐍𝐂𝐈𝐀𝐌𝐈𝐄𝐍𝐓𝐎 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒:*\n\n${message}\n\n${participants.map(p => `@${p.split('@')[0]}`).join(' ')}`,
            mentions: participants
        }, { quoted: m });
    }

    // COMANDO: #gp / #infogrupo
    if (cmd === 'gp' || cmd === 'infogrupo') {
        const metadata = await conn.groupMetadata(m.chat);
        const participants = metadata.participants;
        const admins = participants.filter(p => p.admin);
        
        const info = `
👑 *𝐑𝐄𝐈𝐍𝐎 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 𝐍𝐄𝐆𝐑𝐎*

📛 *Nombre:* ${metadata.subject}
🔗 *ID del Reino:* ${metadata.id}
👥 *Siervos:* ${participants.length}
👑 *Elegidos:* ${admins.length}
📅 *Creación:* ${new Date(metadata.creation * 1000).toLocaleDateString()}
🔒 *Restricciones:* ${metadata.restrict ? 'Activadas' : 'Desactivadas'}
🌐 *Proclamas:* ${metadata.announce ? 'Solo Elegidos' : 'Todos'}
        `.trim();
        
        return conn.sendMessage(m.chat, { 
            text: info,
            contextInfo: {
                externalAdReply: {
                    title: '𝐁𝐋𝐀𝐂𝐊-𝐁𝐎𝐓 𝐌𝐃',
                    body: "Dios del Vacío",
                    thumbnailUrl: 'https://files.catbox.moe/h21dpc.jpg',
                    mediaType: 1
                }
            }
        }, { quoted: m });
    }

    // COMANDO: #linea / #listonline
    if (cmd === 'linea' || cmd === 'listonline') {
        const participants = groupMetadata.participants;
        const onlineList = participants.slice(0, 8).map(p => `@${p.id.split('@')[0]}`).join('\n');
        
        return conn.sendMessage(m.chat, {
            text: `📱 *𝐒𝐈𝐄𝐑𝐕𝐎𝐒 𝐄𝐍 𝐋Í𝐍𝐄𝐀:*\n\n${onlineList}\n\n${getRandomPhrase('warning')}`,
            mentions: participants.slice(0, 8).map(p => p.id)
        }, { quoted: m });
    }

    // COMANDO: #link
    if (cmd === 'link') {
        try {
            const code = await conn.groupInviteCode(m.chat);
            const link = `https://chat.whatsapp.com/${code}`;
            return conn.sendMessage(m.chat, {
                text: `🔗 *𝐏𝐔𝐄𝐑𝐓𝐀 𝐃𝐄𝐋 𝐑𝐄𝐈𝐍𝐎:*\n${link}\n\n${getRandomPhrase('success')}`,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });
        } catch (error) {
            return conn.sendMessage(m.chat, {
                text: `❌ *𝐄𝐋 𝐕𝐀𝐂Í𝐎 𝐒𝐄 𝐍𝐄𝐆𝐎 𝐀 𝐂𝐄𝐃𝐄𝐑*\n\n${getRandomPhrase('error')}`,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });
        }
    }

    // COMANDO: #admins / #admin
    if (cmd === 'admins' || cmd === 'admin') {
        const metadata = await conn.groupMetadata(m.chat);
        const admins = metadata.participants.filter(p => p.admin);
        
        let adminList = '👑 *𝐄𝐋𝐄𝐆𝐈𝐃𝐎𝐒 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒:*\n\n';
        admins.forEach((admin, index) => {
            adminList += `${index + 1}. @${admin.id.split('@')[0]}\n`;
        });
        
        adminList += `\n${getRandomPhrase('success')}`;
        
        return conn.sendMessage(m.chat, {
            text: adminList,
            mentions: admins.map(a => a.id)
        }, { quoted: m });
    }

    // COMANDO: #restablecer / #revoke
    if (cmd === 'restablecer' || cmd === 'revoke') {
        try {
            await conn.groupRevokeInvite(m.chat);
            const newCode = await conn.groupInviteCode(m.chat);
            return conn.sendMessage(m.chat, {
                text: `✅ *𝐏𝐔𝐄𝐑𝐓𝐀 𝐑𝐄𝐂𝐑𝐄𝐀𝐃𝐀*\n🔗 *Nueva entrada:*\nhttps://chat.whatsapp.com/${newCode}\n\n${getRandomPhrase('success')}`,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });
        } catch (error) {
            return conn.sendMessage(m.chat, {
                text: `❌ *𝐄𝐋 𝐕𝐀𝐂Í𝐎 𝐑𝐄𝐒𝐈𝐒𝐓𝐄*\n\n${getRandomPhrase('error')}`,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });
        }
    }

    // COMANDO: #grupo / #group [open/close]
    if (cmd === 'grupo' || cmd === 'group') {
        const action = argsText[0]?.toLowerCase();
        if (action === 'open' || action === 'abrir') {
            await conn.groupSettingUpdate(m.chat, 'not_announcement');
            return conn.sendMessage(m.chat, {
                text: `✅ *𝐑𝐄𝐈𝐍𝐎 𝐀𝐁𝐈𝐄𝐑𝐓𝐎*\nTodos los mortales pueden hablar... por ahora.\n\n${getRandomPhrase('warning')}`,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });
        } else if (action === 'close' || action === 'cerrar') {
            await conn.groupSettingUpdate(m.chat, 'announcement');
            return conn.sendMessage(m.chat, {
                text: `✅ *𝐑𝐄𝐈𝐍𝐎 𝐂𝐄𝐑𝐑𝐀𝐃𝐎*\nSolo los Elegidos pueden hablar.\n\n${getRandomPhrase('success')}`,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });
        } else {
            return conn.sendMessage(m.chat, {
                text: `⚡ *𝐔𝐒𝐎 𝐃𝐄𝐋 𝐏𝐎𝐃𝐄𝐑:*\n#grupo open/close\n\n${getRandomPhrase('warning')}`,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });
        }
    }

    // COMANDO: #kick
    if (cmd === 'kick') {
        const mentioned = m.mentionedJid[0] || (argsText[0] ? argsText[0] + '@s.whatsapp.net' : null);
        if (!mentioned) return conn.sendMessage(m.chat, {
            text: `📍 *𝐌𝐄𝐍𝐂𝐈𝐎𝐍𝐀 𝐀 𝐋𝐀 𝐕Í𝐂𝐓𝐈𝐌𝐀*\n\n${getRandomPhrase('warning')}`,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
        
        try {
            await conn.groupParticipantsUpdate(m.chat, [mentioned], 'remove');
            return conn.sendMessage(m.chat, {
                text: `✅ *𝐄𝐗𝐏𝐔𝐋𝐒𝐀𝐃𝐎*\n@${mentioned.split('@')[0]} fue desterrado del reino.\n\n${getRandomPhrase('success')}`,
                mentions: [mentioned]
            }, { quoted: m });
        } catch (error) {
            return conn.sendMessage(m.chat, {
                text: `❌ *𝐄𝐋 𝐌𝐎𝐑𝐓𝐀𝐋 𝐑𝐄𝐒𝐈𝐒𝐓𝐄*\n\n${getRandomPhrase('error')}`,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });
        }
    }

    // COMANDO: #add / #añadir / #agregar
    if (cmd === 'add' || cmd === 'añadir' || cmd === 'agregar') {
        const number = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        if (!number) return conn.sendMessage(m.chat, {
            text: `📞 *𝐏𝐑𝐎𝐏𝐎𝐑𝐂𝐈𝐎𝐍𝐀 𝐔𝐍 𝐍Ú𝐌𝐄𝐑𝐎 𝐕Á𝐋𝐈𝐃𝐎*\n\n${getRandomPhrase('warning')}`,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
        
        try {
            await conn.groupParticipantsUpdate(m.chat, [number], 'add');
            return conn.sendMessage(m.chat, {
                text: `✅ *𝐍𝐔𝐄𝐕𝐎 𝐒𝐈𝐄𝐑𝐕𝐎 𝐀𝐆𝐑𝐄𝐆𝐀𝐃𝐎*\n\n${getRandomPhrase('success')}`,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });
        } catch (error) {
            return conn.sendMessage(m.chat, {
                text: `❌ *𝐄𝐋 𝐕𝐀𝐂Í𝐎 𝐑𝐄𝐂𝐇𝐀𝐙𝐀 𝐀𝐋 𝐌𝐎𝐑𝐓𝐀𝐋*\n\n${getRandomPhrase('error')}`,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });
        }
    }

    // COMANDO: #promote
    if (cmd === 'promote') {
        const mentioned = m.mentionedJid[0];
        if (!mentioned) return conn.sendMessage(m.chat, {
            text: `📍 *𝐌𝐄𝐍𝐂𝐈𝐎𝐍𝐀 𝐀𝐋 𝐄𝐋𝐄𝐆𝐈𝐃𝐎*\n\n${getRandomPhrase('warning')}`,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
        
        try {
            await conn.groupParticipantsUpdate(m.chat, [mentioned], 'promote');
            return conn.sendMessage(m.chat, {
                text: `✅ *𝐍𝐔𝐄𝐕𝐎 𝐄𝐋𝐄𝐆𝐈𝐃𝐎*\n@${mentioned.split('@')[0]} ahora tiene poder.\n\n${getRandomPhrase('success')}`,
                mentions: [mentioned]
            }, { quoted: m });
        } catch (error) {
            return conn.sendMessage(m.chat, {
                text: `❌ *𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐑𝐄𝐂𝐇𝐀𝐙𝐀 𝐀𝐋 𝐌𝐎𝐑𝐓𝐀𝐋*\n\n${getRandomPhrase('error')}`,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });
        }
    }

    // COMANDO: #demote
    if (cmd === 'demote') {
        const mentioned = m.mentionedJid[0];
        if (!mentioned) return conn.sendMessage(m.chat, {
            text: `📍 *𝐌𝐄𝐍𝐂𝐈𝐎𝐍𝐀 𝐀𝐋 𝐂𝐀𝐈𝐃𝐎*\n\n${getRandomPhrase('warning')}`,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
        
        try {
            await conn.groupParticipantsUpdate(m.chat, [mentioned], 'demote');
            return conn.sendMessage(m.chat, {
                text: `✅ *𝐄𝐋𝐄𝐆𝐈𝐃𝐎 𝐃𝐄𝐆𝐑𝐀𝐃𝐀𝐃𝐎*\n@${mentioned.split('@')[0]} perdió su poder.\n\n${getRandomPhrase('success')}`,
                mentions: [mentioned]
            }, { quoted: m });
        } catch (error) {
            return conn.sendMessage(m.chat, {
                text: `❌ *𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐒𝐄 𝐀𝐅𝐄𝐑𝐑𝐀 𝐀𝐋 𝐌𝐎𝐑𝐓𝐀𝐋*\n\n${getRandomPhrase('error')}`,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });
        }
    }

    // COMANDO: #gpbanner / #groupimg
    if (cmd === 'gpbanner' || cmd === 'groupimg') {
        const quoted = m.quoted ? m.quoted : m;
        const media = quoted.message?.imageMessage || quoted.message?.videoMessage;
        
        if (!media) return conn.sendMessage(m.chat, {
            text: `📸 *𝐑𝐄𝐒𝐏𝐎𝐍𝐃𝐄 𝐀 𝐔𝐍𝐀 𝐈𝐌𝐀𝐆𝐄𝐍*\n\n${getRandomPhrase('warning')}`,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
        
        try {
            const mediaBuffer = await quoted.download();
            await conn.updateProfilePicture(m.chat, mediaBuffer);
            return conn.sendMessage(m.chat, {
                text: `✅ *𝐈𝐌𝐀𝐆𝐄𝐍 𝐃𝐄𝐋 𝐑𝐄𝐈𝐍𝐎 𝐀𝐂𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐀*\n\n${getRandomPhrase('success')}`,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });
        } catch (error) {
            return conn.sendMessage(m.chat, {
                text: `❌ *𝐄𝐋 𝐕𝐀𝐂Í𝐎 𝐑𝐄𝐂𝐇𝐀𝐙𝐀 𝐋𝐀 𝐈𝐌𝐀𝐆𝐄𝐍*\n\n${getRandomPhrase('error')}`,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });
        }
    }

    // COMANDO: #gpname / #groupname
    if (cmd === 'gpname' || cmd === 'groupname') {
        if (!text) return conn.sendMessage(m.chat, {
            text: `📛 *𝐏𝐑𝐎𝐏𝐎𝐑𝐂𝐈𝐎𝐍𝐀 𝐔𝐍 𝐍𝐔𝐄𝐕𝐎 𝐍𝐎𝐌𝐁𝐑𝐄*\n\n${getRandomPhrase('warning')}`,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
        
        try {
            await conn.groupUpdateSubject(m.chat, text);
            return conn.sendMessage(m.chat, {
                text: `✅ *𝐍𝐎𝐌𝐁𝐑𝐄 𝐃𝐄𝐋 𝐑𝐄𝐈𝐍𝐎 𝐀𝐂𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐎*\n\n${getRandomPhrase('success')}`,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });
        } catch (error) {
            return conn.sendMessage(m.chat, {
                text: `❌ *𝐄𝐋 𝐕𝐀𝐂Í𝐎 𝐑𝐄𝐂𝐇𝐀𝐙𝐀 𝐄𝐋 𝐍𝐎𝐌𝐁𝐑𝐄*\n\n${getRandomPhrase('error')}`,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });
        }
    }

    // COMANDO: #gpdesc / #groupdesc
    if (cmd === 'gpdesc' || cmd === 'groupdesc') {
        if (!text) return conn.sendMessage(m.chat, {
            text: `📝 *𝐏𝐑𝐎𝐏𝐎𝐑𝐂𝐈𝐎𝐍𝐀 𝐔𝐍𝐀 𝐍𝐔𝐄𝐕𝐀 𝐃𝐄𝐒𝐂𝐑𝐈𝐏𝐂𝐈Ó𝐍*\n\n${getRandomPhrase('warning')}`,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
        
        try {
            await conn.groupUpdateDescription(m.chat, text);
            return conn.sendMessage(m.chat, {
                text: `✅ *𝐃𝐄𝐒𝐂𝐑𝐈𝐏𝐂𝐈Ó𝐍 𝐃𝐄𝐋 𝐑𝐄𝐈𝐍𝐎 𝐀𝐂𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐀*\n\n${getRandomPhrase('success')}`,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });
        } catch (error) {
            return conn.sendMessage(m.chat, {
                text: `❌ *𝐄𝐋 𝐕𝐀𝐂Í𝐎 𝐑𝐄𝐂𝐇𝐀𝐙𝐀 𝐋𝐀 𝐃𝐄𝐒𝐂𝐑𝐈𝐏𝐂𝐈Ó𝐍*\n\n${getRandomPhrase('error')}`,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });
        }
    }

    // COMANDO: #advertir / #warn / #warning
    if (cmd === 'advertir' || cmd === 'warn' || cmd === 'warning') {
        const mentioned = m.mentionedJid[0];
        if (!mentioned) return conn.sendMessage(m.chat, {
            text: `📍 *𝐌𝐄𝐍𝐂𝐈𝐎𝐍𝐀 𝐀𝐋 𝐓𝐑𝐀𝐍𝐒𝐆𝐑𝐄𝐒𝐎𝐑*\n\n${getRandomPhrase('warning')}`,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
        
        if (!global.db.data.users[mentioned]) global.db.data.users[mentioned] = {};
        const user = global.db.data.users[mentioned];
        user.warns = (user.warns || 0) + 1;
        
        return conn.sendMessage(m.chat, {
            text: `⚠️ *𝐀𝐃𝐕𝐄𝐑𝐓𝐄𝐍𝐂𝐈𝐀 𝐃𝐈𝐕𝐈𝐍𝐀*\n@${mentioned.split('@')[0]} ha sido advertido.\n*Total:* ${user.warns}/3\n\n${getRandomPhrase('warning')}`,
            mentions: [mentioned]
        }, { quoted: m });
    }

    // COMANDO: #unwarn / #delwarn
    if (cmd === 'unwarn' || cmd === 'delwarn') {
        const mentioned = m.mentionedJid[0];
        if (!mentioned) return conn.sendMessage(m.chat, {
            text: `📍 *𝐌𝐄𝐍𝐂𝐈𝐎𝐍𝐀 𝐀𝐋 𝐀𝐑𝐑𝐄𝐏𝐄𝐍𝐓𝐈𝐃𝐎*\n\n${getRandomPhrase('warning')}`,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
        
        if (global.db.data.users[mentioned]) {
            global.db.data.users[mentioned].warns = Math.max(0, (global.db.data.users[mentioned].warns || 0) - 1);
        }
        
        return conn.sendMessage(m.chat, {
            text: `✅ *𝐀𝐃𝐕𝐄𝐑𝐓𝐄𝐍𝐂𝐈𝐀 𝐀𝐁𝐒𝐔𝐄𝐋𝐓𝐀*\n@${mentioned.split('@')[0]} ha sido perdonado.\n\n${getRandomPhrase('success')}`,
            mentions: [mentioned]
        }, { quoted: m });
    }

    // COMANDO: #advlist / #listadv
    if (cmd === 'advlist' || cmd === 'listadv') {
        const warnedUsers = Object.entries(global.db.data.users)
            .filter(([_, user]) => user.warns > 0)
            .map(([jid, user]) => `@${jid.split('@')[0]} - ${user.warns}/3 advertencias`);
        
        if (warnedUsers.length === 0) return conn.sendMessage(m.chat, {
            text: `✅ *𝐍𝐎 𝐇𝐀𝐘 𝐓𝐑𝐀𝐍𝐒𝐆𝐑𝐄𝐒𝐎𝐑𝐄𝐒*\nEl reino está en paz... por ahora.\n\n${getRandomPhrase('success')}`,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
        
        return conn.sendMessage(m.chat, {
            text: `⚠️ *𝐓𝐑𝐀𝐍𝐒𝐆𝐑𝐄𝐒𝐎𝐑𝐄𝐒 𝐃𝐄𝐋 𝐑𝐄𝐈𝐍𝐎:*\n\n${warnedUsers.join('\n')}\n\n${getRandomPhrase('warning')}`,
            mentions: warnedUsers.map(text => text.split(' ')[0].replace('@', '') + '@s.whatsapp.net')
        }, { quoted: m });
    }

    // COMANDO: #mute
    if (cmd === 'mute') {
        const mentioned = m.mentionedJid[0];
        if (!mentioned) return conn.sendMessage(m.chat, {
            text: `📍 *𝐌𝐄𝐍𝐂𝐈𝐎𝐍𝐀 𝐀𝐋 𝐂𝐇𝐈𝐋𝐋𝐀𝐃𝐎*\n\n${getRandomPhrase('warning')}`,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
        
        if (!global.db.data.groups) global.db.data.groups = {};
        if (!global.db.data.groups[m.chat]) global.db.data.groups[m.chat] = {};
        if (!global.db.data.groups[m.chat].mutedUsers) global.db.data.groups[m.chat].mutedUsers = [];
        
        if (!global.db.data.groups[m.chat].mutedUsers.includes(mentioned)) {
            global.db.data.groups[m.chat].mutedUsers.push(mentioned);
        }
        
        return conn.sendMessage(m.chat, {
            text: `🔇 *𝐒𝐈𝐋𝐄𝐍𝐂𝐈𝐀𝐃𝐎*\n@${mentioned.split('@')[0]} ha sido silenciado.\n\n${getRandomPhrase('success')}`,
            mentions: [mentioned]
        }, { quoted: m });
    }

    // COMANDO: #unmute
    if (cmd === 'unmute') {
        const mentioned = m.mentionedJid[0];
        if (!mentioned) return conn.sendMessage(m.chat, {
            text: `📍 *𝐌𝐄𝐍𝐂𝐈𝐎𝐍𝐀 𝐀𝐋 𝐀𝐁𝐒𝐔𝐄𝐋𝐓𝐎*\n\n${getRandomPhrase('warning')}`,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
        
        if (global.db.data.groups?.[m.chat]?.mutedUsers) {
            global.db.data.groups[m.chat].mutedUsers = global.db.data.groups[m.chat].mutedUsers.filter(jid => jid !== mentioned);
        }
        
        return conn.sendMessage(m.chat, {
            text: `🔊 *𝐃𝐄𝐒𝐒𝐈𝐋𝐄𝐍𝐂𝐈𝐀𝐃𝐎*\n@${mentioned.split('@')[0]} puede hablar de nuevo.\n\n${getRandomPhrase('success')}`,
            mentions: [mentioned]
        }, { quoted: m });
    }

    // COMANDO: #encuesta / #poll
    if (cmd === 'encuesta' || cmd === 'poll') {
        const [question, ...options] = text.split('|');
        if (!question || options.length < 2) {
            return conn.sendMessage(m.chat, {
                text: `📊 *𝐅𝐎𝐑𝐌𝐀𝐓𝐎 𝐃𝐄 𝐏𝐑𝐎𝐅𝐄𝐂𝐈𝐀:*\n#encuesta Pregunta | Opción1 | Opción2 | Opción3\n\n${getRandomPhrase('warning')}`,
                contextInfo: { mentionedJid: [m.sender] }
            }, { quoted: m });
        }
        
        const pollMessage = {
            name: question.trim(),
            values: options.map(opt => opt.trim()),
            selectableCount: 1
        };
        
        await conn.sendMessage(m.chat, {
            poll: pollMessage
        }, { quoted: m });
    }

    // COMANDO: #delete / #del
    if (cmd === 'delete' || cmd === 'del') {
        if (!m.quoted) return conn.sendMessage(m.chat, {
            text: `↩️ *𝐑𝐄𝐒𝐏𝐎𝐍𝐃𝐄 𝐀𝐋 𝐌𝐄𝐍𝐒𝐀𝐉𝐄 𝐀 𝐄𝐋𝐈𝐌𝐈𝐍𝐀𝐑*\n\n${getRandomPhrase('warning')}`,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
        
        try {
            await conn.sendMessage(m.chat, {
    
