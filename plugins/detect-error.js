let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Este comando solo se activa cuando se escribe mal un comando
    // No necesita ser llamado manualmente
}

handler.all = async function (m, { conn, usedPrefix }) {
    try {
        // Ignorar mensajes que no son de texto
        if (!m.text || m.isBaileys) return;
        
        // Si es un comando válido, ignorar
        if (m.text.startsWith(usedPrefix)) {
            const cmd = m.text.slice(usedPrefix.length).split(' ')[0].toLowerCase();
            const validCommands = [
                'menu', 'help', 'menú', 'add', 'group', 'grupo', 'delete', 'demote', 
                'encuesta', 'hidetag', 'infogrupo', 'invite', 'link', 'listadv', 
                'promote', 'revoke', 'tagall', 'invocar', 'kick', 'rentar',
                'carrera-gp', 'ppt', 'ruleta', 'math', 'acertijo', 'pregunta',
                'reto', 'ship', 'love', 'dado', 'quiz', 'ytmp4', 'ytmp3',
                'facebook', 'fb', 'instagram', 'ig', 'tiktok', 'mediafire',
                'gitclone', 'spotify', 'apkmod', 'ssweb', 'ss', 'tourl',
                'toimg', 'qc', 'tts', 'hd', 'trad', 'inspect', 'ip', 'get',
                'setbanner', 'setname', 'informar', 'listadmin', 'setdesc',
                'kick', 'add', 'promote', 'demote', 'grupoinfo',
                'linkgrupo', 'revokelink', 'mute', 'unmute', 'antifake', 'warn'
            ];
            
            if (validCommands.includes(cmd)) return;
        }
        
        // Solo procesar texto que podría ser un comando
        const text = m.text.toLowerCase().trim();
        
        // Filtros básicos
        if (text.length > 15 || text.includes(' ') || text.includes('@') || !isNaN(text)) return;
        
        // Lista de posibles typos
        const commonErrors = {
            'menù': 'menu', 'menú': 'menu', 'menú': 'menu',
            'helpp': 'help', 'helpx': 'help', 'ayuda': 'help',
            'ytnmp4': 'ytmp4', 'ytmp5': 'ytmp4', 'ytvideo': 'ytmp4',
            'ytnmp3': 'ytmp3', 'ytaudio': 'ytmp3', 
            'infogrup': 'infogrupo', 'gruinfo': 'grupoinfo',
            'stiker': 'sticker', 'stick': 'sticker', 's': 'sticker',
            'ad': 'add', 'agregar': 'add',
            'kickear': 'kick', 'expulsar': 'kick',
            'admin': 'promote', 'administrador': 'promote',
            'quitaradmin': 'demote', 'degradar': 'demote',
            'linkgroup': 'linkgrupo', 'grouplink': 'linkgrupo',
            'muteo': 'mute', 'silenciar': 'mute',
            'desilenciar': 'unmute', 'unmuteo': 'unmute'
        };

        // Verificar si es un error común
        if (commonErrors[text]) {
            const correctCommand = commonErrors[text];
            
            const errorPhrases = [
                "💀 𝐓𝐔 𝐈𝐆𝐍𝐎𝐑𝐀𝐍𝐂𝐈𝐀 𝐌𝐄 𝐃𝐈𝐕𝐈𝐄𝐑𝐓𝐄, 𝐌𝐎𝐑𝐓𝐀𝐋...",
                "⚡ 𝐄𝐒𝐄 𝐍𝐎 𝐄𝐒 𝐔𝐍 𝐏𝐎𝐃𝐄𝐑 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒...",
                "🌑 𝐈𝐍𝐓𝐄𝐍𝐓𝐀𝐒 𝐔𝐒𝐀𝐑 𝐔𝐍 𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐈𝐍𝐄𝐗𝐈𝐒𝐓𝐄𝐍𝐓𝐄...",
                "🐉 𝐄𝐋 𝐃𝐈𝐎𝐒 𝐍𝐎 𝐑𝐄𝐂𝐎𝐍𝐎𝐂𝐄 𝐄𝐒𝐀 𝐎𝐑𝐃𝐄𝐍...",
                "🔥 𝐓𝐔 𝐈𝐍𝐂𝐎𝐌𝐏𝐄𝐓𝐄𝐍𝐂𝐈𝐀 𝐄𝐒 𝐀𝐒𝐎𝐌𝐁𝐑𝐀𝐍𝐓𝐄..."
            ];
            
            const randomPhrase = errorPhrases[Math.floor(Math.random() * errorPhrases.length)];
            
            await conn.sendMessage(m.chat, {
                text: `☠️ *𝐄𝐑𝐑𝐎𝐑 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒*\n\n${randomPhrase}\n\n*"${m.text}"* no es un comando válido.\n\n🐉 *𝐐𝐔𝐈𝐒𝐈𝐒𝐓𝐄 𝐃𝐄𝐂𝐈𝐑:* ${usedPrefix}${correctCommand}\n\n💡 *𝐔𝐒𝐀:* ${usedPrefix}menu *para ver todos los comandos*`,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    externalAdReply: {
                        title: '𝐁𝐋𝐀𝐂𝐊-𝐁𝐎𝐓 𝐌𝐃',
                        body: "El Dios corrige tu error...",
                        thumbnailUrl: 'https://iili.io/KJXN7yB.jpg',
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });

            await m.react('💀');
            return true;
        }

    } catch (error) {
        console.error('Error en detector de comandos:', error);
    }
    return false;
}

// Configuración simple
handler.command = ['_detect_error_'] // Comando fantasma para registro
handler.tags = ['tools']
handler.help = [''] // Ayuda vacía
handler.register = true

export default handler
