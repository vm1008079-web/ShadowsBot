import { promises as fs } from 'fs';

let handler = async (m, { conn, text, usedPrefix, command, isAdmin, isOwner, isROwner }) => {
    try {
        // Verificar permisos: owner, super admin o admin del grupo
        const isAuthorized = isOwner || isROwner || isAdmin;
        
        if (!isAuthorized) {
            return await conn.sendMessage(m.chat, {
                text: `❌ *𝐒𝐎𝐋𝐎 𝐀𝐔𝐓𝐎𝐑𝐈𝐃𝐀𝐃𝐄𝐒 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒*\n\nSolo propietarios, super admins o administradores de grupo pueden usar este poder.`,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: m });
        }

        // Verificar si hay texto para enviar
        if (!text) {
            return await conn.sendMessage(m.chat, {
                text: `☠️ *𝐔𝐒𝐎 𝐃𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐃𝐈𝐕𝐈𝐍𝐎*\n\n${usedPrefix}${command} <mensaje>\n\n*𝐄𝐉𝐄𝐌𝐏𝐋𝐎:*\n${usedPrefix}${command} 𝐋𝐀 𝐌𝐄𝐑𝐄𝐂𝐈𝐃𝐀 𝐃𝐄 𝐋𝐎𝐒 𝐌𝐎𝐑𝐓𝐀𝐋𝐄𝐒 𝐇𝐀 𝐋𝐋𝐄𝐆𝐀𝐃𝐎 𝐀 𝐒𝐔 𝐅𝐈𝐍... 🌑`,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: m });
        }

        // Frases malévolas de Goku Black
        const gokuBlackPhrases = {
            activation: [
                "⚡ 𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 𝐒𝐄 𝐀𝐂𝐓𝐈𝐕𝐀...",
                "🌑 𝐋𝐀 𝐎𝐒𝐂𝐔𝐑𝐈𝐃𝐀𝐃 𝐒𝐄 𝐂𝐈𝐄𝐑𝐍𝐄 𝐒𝐎𝐁𝐑𝐄 𝐄𝐒𝐓𝐄 𝐋𝐔𝐆𝐀𝐑...",
                "🐉 𝐄𝐋 𝐃𝐈𝐎𝐒 𝐍𝐄𝐆𝐑𝐎 𝐇𝐀 𝐇𝐀𝐁𝐋𝐀𝐃𝐎 - 𝐒𝐔 𝐏𝐎𝐃𝐄𝐑 𝐒𝐄 𝐌𝐀𝐍𝐈𝐅𝐄𝐒𝐓𝐀...",
                "💀 𝐋𝐀 𝐏𝐑𝐎𝐇𝐈𝐁𝐈𝐂𝐈𝐎́𝐍 𝐃𝐈𝐕𝐈𝐍𝐀 𝐄𝐒𝐓𝐀́ 𝐄𝐍 𝐕𝐈𝐆𝐎𝐑..."
            ],
            sending: [
                "🔮 𝐄𝐋 𝐏𝐑𝐎𝐍𝐔𝐍𝐂𝐈𝐀𝐌𝐈𝐄𝐍𝐓𝐎 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 𝐒𝐄 𝐄𝐗𝐓𝐈𝐄𝐍𝐃𝐄...",
                "🌌 𝐄𝐋 𝐕𝐀𝐂Í𝐎 𝐓𝐑𝐀𝐍𝐒𝐌𝐈𝐓𝐄 𝐒𝐔 𝐌𝐄𝐍𝐒𝐀𝐉𝐄...",
                "⚡ 𝐋𝐀 𝐕𝐎𝐙 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 𝐑𝐄𝐒𝐔𝐄𝐍𝐀 𝐄𝐍 𝐓𝐎𝐃𝐎𝐒 𝐋𝐎𝐒 𝐑𝐄𝐈𝐍𝐎𝐒...",
                "🐉 𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐃𝐈𝐕𝐈𝐍𝐎 𝐒𝐄 𝐌𝐀𝐍𝐈𝐅𝐈𝐄𝐒𝐓𝐀 𝐄𝐍 𝐌𝐀𝐒𝐒𝐀..."
            ]
        };

        function getRandomPhrase(type) {
            return gokuBlackPhrases[type][Math.floor(Math.random() * gokuBlackPhrases[type].length)];
        }

        // Obtener todos los chats del bot
        const chats = await conn.chats.all();
        
        // Filtrar solo grupos donde el usuario es admin
        const userGroups = chats.filter(chat => {
            if (chat.type !== 'group') return false;
            
            // Si es owner o super admin, puede enviar a todos los grupos
            if (isOwner || isROwner) return true;
            
            // Si es admin de grupo, verificar que sea admin en ese grupo específico
            if (chat.participants) {
                const participant = chat.participants.find(p => p.id === m.sender);
                return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
            }
            return false;
        });

        if (userGroups.length === 0) {
            return await conn.sendMessage(m.chat, {
                text: '❌ *𝐍𝐎 𝐄𝐑𝐄𝐒 𝐃𝐈𝐎𝐒 𝐄𝐍 𝐍𝐈𝐍𝐆𝐔𝐍 𝐆𝐑𝐔𝐏𝐎*\n\nTu poder es insuficiente para gobernar este universo... 💀',
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true
                }
            }, { quoted: m });
        }

        // Contador de mensajes enviados
        let successCount = 0;
        let failCount = 0;
        
        // Mensaje de inicio con estilo Goku Black
        const randomPhrase = getRandomPhrase('sending');
        await conn.sendMessage(m.chat, {
            text: `⚡ *𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 𝐒𝐄 𝐌𝐀𝐍𝐈𝐅𝐈𝐄𝐒𝐓𝐀*...\n\n${randomPhrase}\n\n📤 *𝐄𝐧𝐯𝐢𝐚𝐧𝐝𝐨 𝐚 ${userGroups.length} 𝐫𝐞𝐢𝐧𝐨𝐬...* ⏳`,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: m });

        // Enviar mensaje a cada grupo con estilo malévolo
        for (const group of userGroups) {
            try {
                const groupPhrase = getRandomPhrase('sending');
                
                await conn.sendMessage(group.id, {
                    text: `🐉 *𝐏𝐑𝐎𝐍𝐔𝐍𝐂𝐈𝐀𝐌𝐈𝐄𝐍𝐓𝐎 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 𝐍𝐄𝐆𝐑𝐎*\n\n╔══════════════════╗\n   𝐁𝐋𝐀𝐂𝐊-𝐁𝐎𝐓 𝐌𝐃\n╚══════════════════╝\n\n${text}\n\n╔══════════════════╗\n${groupPhrase}\n╚══════════════════╝\n\n_𝐏𝐨𝐝𝐞𝐫 𝐝𝐞: @${m.sender.split('@')[0]}_`,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 999,
                        isForwarded: true
                    }
                });
                successCount++;
                
                // Pequeña pausa dramática
                await new Promise(resolve => setTimeout(resolve, 1500));
                
            } catch (error) {
                console.error(`Error enviando a ${group.id}:`, error);
                failCount++;
            }
        }

        // Mensaje de resumen con estilo irónico
        const summaryMessage = `╔══════════════════╗\n   𝐏𝐑𝐎𝐅𝐄𝐂𝐈𝐀 𝐂𝐔𝐌𝐏𝐋𝐈𝐃𝐀\n╚══════════════════╝

📊 *𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎𝐒 𝐃𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐃𝐈𝐕𝐈𝐍𝐎:*
• ✅ 𝐑𝐞𝐢𝐧𝐨𝐬 𝐝𝐨𝐦𝐢𝐧𝐚𝐝𝐨𝐬: ${successCount}
• ❌ 𝐑𝐞𝐢𝐧𝐨𝐬 𝐫𝐞𝐬𝐢𝐬𝐭𝐞𝐧𝐭𝐞𝐬: ${failCount}
• 📋 𝐓𝐨𝐭𝐚𝐥 𝐝𝐞 𝐫𝐞𝐚𝐥𝐢𝐝𝐚𝐝𝐞𝐬: ${userGroups.length}

🐉 *𝐌𝐄𝐍𝐒𝐀𝐉𝐄 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒:*
${text}

╔══════════════════╗\n  𝐄𝐋 𝐃𝐈𝐎𝐒 𝐍𝐎 𝐂𝐎𝐍𝐎𝐂𝐄 𝐄𝐋 𝐅𝐑𝐀𝐂𝐀𝐒𝐎\n╚══════════════════╝`;

        await conn.sendMessage(m.chat, {
            text: summaryMessage,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: m });

        // React con emoji de dragón
        await m.react('🐉');

    } catch (error) {
        console.error('Error en el poder divino:', error);
        
        // Mensaje de error con estilo Goku Black
        await conn.sendMessage(m.chat, {
            text: `💀 *𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 𝐅𝐀𝐋𝐋𝐎́*\n\nEl vacío no pudo absorber las mensajerías mortales...\n\n*𝐄𝐫𝐫𝐨𝐫:* ${error.message}`,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: m });
        
        await m.react('💀');
    }
}

// Help con estilo Goku Black
handler.help = ['informar <mensaje> :: 𝐄𝐥 𝐝𝐢𝐨𝐬 𝐞𝐧𝐯í𝐚 𝐬𝐮 𝐩𝐫𝐨𝐧𝐮𝐧𝐜𝐢𝐚𝐦𝐢𝐞𝐧𝐭𝐨 𝐚 𝐭𝐨𝐝𝐨𝐬 𝐥𝐨𝐬 𝐮𝐧𝐢𝐯𝐞𝐫𝐬𝐨𝐬'];
handler.tags = ['admin', 'dios', 'grupo'];
handler.command = ['informar', 'pronunciamiento', 'profecia', 'anunciardios', 'blackbroadcast', 'notificar'];
handler.group = true;
handler.admin = true;  // Ahora admins de grupo pueden usarlo
handler.botAdmin = false;

export default handler
