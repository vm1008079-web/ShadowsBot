import { promises as fs } from 'fs';

let handler = m => m
handler.all = async function (m, { conn, usedPrefix }) {
    try {
        // Ignorar mensajes que no son de texto o son comandos válidos
        if (!m.text || m.text.startsWith('>') || m.chat.endsWith('broadcast') || m.isBaileys) return;
        
        // Lista de comandos existentes
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
            'setname', 'kick', 'add', 'promote', 'demote', 'grupoinfo',
            'linkgrupo', 'revokelink', 'mute', 'unmute', 'antifake', 'warn'
        ];

        // Frases malévolas de Goku Black para errores
        const errorPhrases = [
            "💀 𝐓𝐔 𝐈𝐆𝐍𝐎𝐑𝐀𝐍𝐂𝐈𝐀 𝐌𝐄 𝐃𝐈𝐕𝐈𝐄𝐑𝐓𝐄, 𝐌𝐎𝐑𝐓𝐀𝐋...",
            "⚡ 𝐄𝐒𝐄 𝐍𝐎 𝐄𝐒 𝐔𝐍 𝐏𝐎𝐃𝐄𝐑 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒...",
            "🌑 𝐈𝐍𝐓𝐄𝐍𝐓𝐀𝐒 𝐔𝐒𝐀𝐑 𝐔𝐍 𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐈𝐍𝐄𝐗𝐈𝐒𝐓𝐄𝐍𝐓𝐄...",
            "🐉 𝐄𝐋 𝐃𝐈𝐎𝐒 𝐍𝐎 𝐑𝐄𝐂𝐎𝐍𝐎𝐂𝐄 𝐄𝐒𝐀 𝐎𝐑𝐃𝐄𝐍...",
            "🔥 𝐓𝐔 𝐈𝐍𝐂𝐎𝐌𝐏𝐄𝐓𝐄𝐍𝐂𝐈𝐀 𝐄𝐒 𝐀𝐒𝐎𝐌𝐁𝐑𝐀𝐍𝐓𝐄...",
            "⚡ 𝐍𝐈 𝐒𝐈𝐐𝐔𝐈𝐄𝐑𝐀 𝐒𝐀𝐁𝐄𝐒 𝐂𝐎𝐌𝐎 𝐔𝐒𝐀𝐑 𝐌𝐈 𝐏𝐎𝐃𝐄𝐑...",
            "💀 𝐄𝐒𝐄 𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐍𝐎 𝐄𝐗𝐈𝐒𝐓𝐄 𝐄𝐍 𝐌𝐈 𝐑𝐄𝐈𝐍𝐎...",
            "🌑 𝐀 𝐋𝐀 𝐏𝐑𝐎𝐗𝐈𝐌𝐀 𝐔𝐒𝐀 𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐂𝐎𝐑𝐑𝐄𝐂𝐓𝐀𝐌𝐄𝐍𝐓𝐄...",
            "🐉 𝐍𝐎 𝐃𝐄𝐒𝐇𝐎𝐍𝐑𝐄𝐒 𝐀𝐋 𝐃𝐈𝐎𝐒 𝐂𝐎𝐍 𝐓𝐔 𝐈𝐆𝐍𝐎𝐑𝐀𝐍𝐂𝐈𝐀...",
            "⚡ 𝐓𝐔 𝐅𝐑𝐀𝐂𝐀𝐒𝐎 𝐌𝐄 𝐃𝐀 𝐋𝐀 𝐑𝐀𝐙𝐎𝐍 𝐒𝐎𝐁𝐑𝐄 𝐋𝐎𝐒 𝐌𝐎𝐑𝐓𝐀𝐋𝐄𝐒..."
        ];

        // Verificar si el mensaje podría ser un comando mal escrito
        const text = m.text.toLowerCase().trim();
        const possibleCommand = text.replace(/[^a-zA-Z0-9]/g, '');

        // Detectar patrones de comandos mal escritos
        const isPossibleCommand = text.length <= 20 && 
                                 !text.includes(' ') && 
                                 !text.startsWith('http') &&
                                 !text.includes('@') &&
                                 validCommands.some(cmd => 
                                     possibleCommand.includes(cmd) || 
                                     cmd.includes(possibleCommand) ||
                                     this.levenshteinDistance(possibleCommand, cmd) <= 2
                                 );

        if (isPossibleCommand && !validCommands.includes(text.replace(/[^a-zA-Z0-9]/g, ''))) {
            // Esperar un poco para no ser demasiado intrusivo
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Seleccionar frase aleatoria de Goku Black
            const randomPhrase = errorPhrases[Math.floor(Math.random() * errorPhrases.length)];
            
            // Responder con sugerencia estilo Goku Black
            await conn.sendMessage(m.chat, {
                text: `☠️ *𝐄𝐑𝐑𝐎𝐑 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒*\n\n${randomPhrase}\n\n*"${m.text}"* no es un comando válido.\n\n🐉 *𝐔𝐒𝐀 𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐂𝐎𝐑𝐑𝐄𝐂𝐓𝐎:*\n• ${usedPrefix}menu - Para ver todos los comandos\n• ${usedPrefix}help - Para asistencia divina`,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    externalAdReply: {
                        title: '𝐁𝐋𝐀𝐂𝐊-𝐁𝐎𝐓 𝐌𝐃',
                        body: "El Dios detecta tu error...",
                        thumbnailUrl: 'https://iili.io/KJXN7yB.jpg',
                        sourceUrl: "https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O",
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });

            // React con emoji de error estilo Goku Black
            await m.react('💀');
        }

    } catch (error) {
        console.error('Error en detector de comandos:', error);
    }
}

// Función para calcular distancia Levenshtein (detección de typos)
handler.levenshteinDistance = function(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
                ? matrix[i - 1][j - 1]
                : Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
        }
    }
    return matrix[b.length][a.length];
}

export default handler;
