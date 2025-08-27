import fs from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'

const handler = async (m, { conn, usedPrefix: _p }) => {
    try {
        const { exp, limit, level } = global.db.data.users[m.sender]
        const { min, xp, max } = xpRange(level, global.multiplier)
        const name = await conn.getName(m.sender)
        const taguser = '@' + m.sender.split('@')[0]

        let nombreBot = global.namebot || 'BLACK-BOT'
        let bannerFinal = 'https://iili.io/KJXN7yB.jpg' // Imagen de Goku Black

        const botActual = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '')
        const configPath = join('./JadiBots', botActual || '', 'config.json')
        if (botActual && fs.existsSync(configPath)) {
            try {
                const config = JSON.parse(fs.readFileSync(configPath))
                if (config.name) nombreBot = config.name
                if (config.banner) bannerFinal = config.banner
            } catch {}
        }

        const tipo = conn.user?.jid === global.conn?.user?.jid ? 'Principal' : 'Sub-Bot'

        // Menú completo organizado
        const menuText = `
╔══════════════════════╗
       𝐁𝐋𝐀𝐂𝐊-𝐁𝐎𝐓 𝐌𝐃
╚══════════════════════╝

👋 𝐇𝐨𝐥𝐚: ${taguser}
⚡ 𝐁𝐨𝐭: ${tipo} 
⏰ 𝐀𝐜𝐭𝐢𝐯𝐨: ${clockString(process.uptime() * 1000)}
📊 𝐍𝐢𝐯𝐞𝐥: ${level} 
💎 𝐄𝐱𝐩: ${exp}

╔══════════════════════╗
       𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒
╚══════════════════════╝

👑 𝐏𝐑𝐎𝐏𝐈𝐄𝐓𝐀𝐑𝐈𝐎:
• ${_p}antiarabepriv • ${_p}checkplugins
• ${_p}copiabots • ${_p}restart
• ${_p}update

⚡ 𝐒𝐔𝐁𝐁𝐎𝐓𝐒:
• ${_p}bots • ${_p}qr • ${_p}code
• ${_p}setbanner • ${_p}setname • ${_p}sublist

💎 𝐄𝐂𝐎𝐍𝐎𝐌Í𝐀:
• ${_p}crime • ${_p}depositar • ${_p}minar
• ${_p}pay • ${_p}robar • ${_p}work

⬇️ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐒:
• ${_p}apk • ${_p}fb • ${_p}ig • ${_p}tiktok
• ${_p}ytmp3 • ${_p}ytmp4 • ${_p}mediafire • ${_p}drive

🛠️ 𝐇𝐄𝐑𝐑𝐀𝐌𝐈𝐄𝐍𝐓𝐀𝐒:
• ${_p}tts • ${_p}hd • ${_p}ss • ${_p}guardar
• ${_p}reparar • ${_p}whatmusic2

🌀 𝐄𝐅𝐄𝐂𝐓𝐎𝐒:
• ${_p}bass • ${_p}nightcore • ${_p}reverse
• ${_p}slow • ${_p}pitch • ${_p}echo

📊 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂𝐈Ó𝐍:
• ${_p}creador • ${_p}ping • ${_p}speed • ${_p}servers

🎮 𝐉𝐔𝐄𝐆𝐎𝐒:
• ${_p}acertijo • ${_p}matematicas • ${_p}trivia

🎲 𝐆𝐀𝐂𝐇𝐀:
• ${_p}c • ${_p}harem • ${_p}topwaifus • ${_p}winfo

💢 𝐑𝐄𝐀𝐂𝐂𝐈𝐎𝐍𝐄𝐒:
• ${_p}abrazar • ${_p}besar • ${_p}bailar
• ${_p}comer • ${_p}triste

🔍 𝐁𝐔𝐒𝐂𝐀𝐃𝐎𝐑𝐄𝐒:
• ${_p}imagen • ${_p}ytsearch • ${_p}tiktoksearch

📌 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒:
• ${_p}sticker • ${_p}s • ${_p}toimg
• ${_p}tovideo • ${_p}qc

📺 𝐂𝐀𝐍𝐀𝐋𝐄𝐒:
• ${_p}nuevafotochannel • ${_p}silenciarcanal
• ${_p}seguircanal • ${_p}avisoschannel

🤖 𝐈𝐀:
• ${_p}chatai • ${_p}chatgpt • ${_p}imgia • ${_p}aivideo

😂 𝐃𝐈𝐕𝐄𝐑𝐒𝐈Ó𝐍:
• ${_p}meme • ${_p}cr7 • ${_p}messi

╔══════════════════════╗
     𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 𝐆𝐑𝐔𝐏𝐎𝐒
╚══════════════════════╝

👥 𝐀𝐃𝐌𝐈𝐍𝐈𝐒𝐓𝐑𝐀𝐂𝐈Ó𝐍:
• ${_p}listadmin • ${_p}promote
• ${_p}demote • ${_p}kick • ${_p}add
• ${_p}informar

⚙️ 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂𝐈Ó𝐍:
• ${_p}setname • ${_p}setdesc
• ${_p}linkgrupo • ${_p}revokelink
• ${_p}mute • ${_p}unmute

📋 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂𝐈Ó𝐍:
• ${_p}grupoinfo • ${_p}antifake
• ${_p}warn

🔧 𝐂𝐎𝐍𝐓𝐑𝐎𝐋:
• ${_p}welcome • ${_p}antilink
• ${_p}antiarabe • ${_p}modoadmin

╔══════════════════════╗
   𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐃𝐄𝐋 
     𝐃𝐈𝐎𝐒 𝐍𝐄𝐆𝐑𝐎
╚══════════════════════╝

💡 *Usa:* ${_p}menu grupos *para ver más detalles*
`.trim()

        // Solo enviar UN mensaje con la imagen y el menú
        await conn.sendMessage(
            m.chat,
            { 
                image: { url: bannerFinal }, // Imagen de Goku Black
                caption: menuText,
                contextInfo: {
                    externalAdReply: {
                        title: '𝐁𝐋𝐀𝐂𝐊-𝐁𝐎𝐓 𝐌𝐃',
                        body: "Dios de la Oscuridad",
                        thumbnailUrl: bannerFinal,
                        sourceUrl: "https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O",
                        mediaType: 1,
                        renderLargerThumbnail: true
                    },
                    mentionedJid: [m.sender]
                }
            },
            { quoted: m }
        )

        // React después de enviar el mensaje principal
        await conn.sendMessage(m.chat, { react: { text: '🐉', key: m.key } })

    } catch (e) {
        console.error('Error en el menú:', e)
        conn.reply(m.chat, '❌ Error al mostrar el menú', m)
    }
}

// Handler para comandos de grupos
handler.before = async (m, { conn, usedPrefix }) => {
    if (m.text && m.text.toLowerCase() === `${usedPrefix}menu grupos`) {
        const gruposText = `
╔══════════════════════╗
   𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 𝐃𝐄 𝐆𝐑𝐔𝐏𝐎𝐒
╚══════════════════════╝

👑 𝐀𝐃𝐌𝐈𝐍𝐈𝐒𝐓𝐑𝐀𝐂𝐈Ó𝐍:
• ${usedPrefix}listadmin - Lista de administradores
• ${usedPrefix}promote @user - Hacer admin
• ${usedPrefix}demote @user - Quitar admin
• ${usedPrefix}kick @user - Expulsar usuario
• ${usedPrefix}add número - Agregar usuario
• ${usedPrefix}informar <msg> - Enviar a todos los grupos

⚙️ 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂𝐈Ó𝐍:
• ${usedPrefix}setname <texto> - Cambiar nombre
• ${usedPrefix}setdesc <texto> - Cambiar descripción
• ${usedPrefix}linkgrupo - Obtener enlace
• ${usedPrefix}revokelink - Revocar enlace
• ${usedPrefix}mute <horas> - Silenciar grupo
• ${usedPrefix}unmute - Activar grupo

📋 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂𝐈Ó𝐍:
• ${usedPrefix}grupoinfo - Información del grupo
• ${usedPrefix}antifake on/off - Anti números fake
• ${usedPrefix}warn @user - Advertir usuario

🔧 𝐂𝐎𝐍𝐓𝐑𝐎𝐋 𝐀𝐔𝐓𝐎𝐌Á𝐓𝐈𝐂𝐎:
• ${usedPrefix}on welcome - Welcome automático
• ${usedPrefix}off welcome - Desactivar welcome
• ${usedPrefix}on antilink - Anti enlaces
• ${usedPrefix}off antilink - Desactivar anti enlaces
• ${usedPrefix}on antiarabe - Anti árabes
• ${usedPrefix}off antiarabe - Desactivar anti árabes
• ${usedPrefix}on modoadmin - Solo admins
• ${usedPrefix}off modoadmin - Todos pueden hablar

🐉 *COMANDO ESPECIAL:*
• ${usedPrefix}informar <mensaje>
  ╰─ Envía mensaje a todos los grupos donde eres admin
     (Owner, Super Admin y Admins de grupo)

💡 *Nota:* Solo para administradores
        `.trim()
        
        await conn.sendMessage(m.chat, { 
            text: gruposText,
            contextInfo: {
                mentionedJid: [m.sender]
            }
        }, { quoted: m })
        return true
    }
}

handler.command = ['menu', 'menú', 'help', 'comandos', 'menu grupos']
handler.register = false
export default handler

function clockString(ms) {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}
