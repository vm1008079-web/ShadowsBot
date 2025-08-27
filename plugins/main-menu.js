import fs from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'

// Categorías simplificadas
const categories = {
  '👑 Owner': ['antiarabepriv', 'checkplugins', 'copiabots', 'restart', 'update'],
  '⚡ SubBots': ['bots', 'qr', 'code', 'setbanner', 'setname', 'sublist'],
  '💎 Econ': ['crime', 'depositar', 'minar', 'pay', 'robar', 'work'],
  '⬇️ Descargas': ['apk', 'fb', 'ig', 'tiktok', 'ytmp3', 'ytmp4', 'mediafire', 'drive'],
  '🛠️ Tools': ['tts', 'hd', 'ss', 'guardar', 'reparar', 'whatmusic2'],
  '🌀 Efectos': ['bass', 'nightcore', 'reverse', 'slow', 'pitch', 'echo'],
  '📊 Info': ['creador', 'ping', 'speed', 'servers'],
  '🎮 Juegos': ['acertijo', 'matematicas', 'trivia'],
  '🎲 Gacha': ['c', 'harem', 'topwaifus', 'winfo'],
  '💢 Reacciones': ['abrazar', 'besar', 'bailar', 'comer', 'triste'],
  '👥 Grupos': ['welcome', 'antilink', 'kick', 'mute', 'invocar', 'abrir', 'cerrar'],
  '🔍 Buscar': ['imagen', 'ytsearch', 'tiktoksearch'],
  '📌 Stickers': ['sticker', 's', 'toimg', 'tovideo', 'qc'],
  '📺 Canales': ['nuevafotochannel', 'silenciarcanal', 'seguircanal', 'avisoschannel'],
  '🤖 IA': ['chatai', 'chatgpt', 'imgia', 'aivideo'],
  '😂 Fun': ['meme', 'cr7', 'messi']
}

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    const { exp, limit, level } = global.db.data.users[m.sender]
    const { min, xp, max } = xpRange(level, global.multiplier)
    const name = await conn.getName(m.sender)
    const taguser = '@' + m.sender.split('@')[0]

    let nombreBot = global.namebot || 'BLACK-BOT'
    // IMAGEN ACTUALIZADA - https://iili.io/KJXN7yB.jpg
    let bannerFinal = 'https://iili.io/KJXN7yB.jpg'

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

    // Construir el menú compacto
    let menuText = `
╔══════════════════╗
    𝐁𝐋𝐀𝐂𝐊-𝐁𝐎𝐓 𝐌𝐃
╚══════════════════╝

👋 Hola ${taguser}
⚡ Bot: ${tipo} | ⏰ ${clockString(process.uptime() * 1000)}
📊 Nivel: ${level} | 💎 Exp: ${exp}

╔══════════════════╗
     𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒
╚══════════════════╝
`.trim()

    // Agregar categorías de forma compacta
    Object.entries(categories).forEach(([category, cmds]) => {
      menuText += `\n\n${category}:\n`
      menuText += `┌ ${cmds.map(cmd => `${_p}${cmd}`).join(' | ')}`
      menuText += `\n└─── · · · · · · · · · ·`
    })

    menuText += `

╔══════════════════╗
   𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐃𝐄𝐋 
     𝐃𝐈𝐎𝐒 𝐍𝐄𝐆𝐑𝐎
╚══════════════════╝
`.trim()

    await conn.sendMessage(m.chat, { react: { text: '🐉', key: m.key } })
    
    // Enviar mensaje con imagen
    await conn.sendMessage(
      m.chat,
      { 
        image: { url: bannerFinal },
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
  } catch (e) {
    console.error('Error en el menú:', e)
    conn.reply(m.chat, '❌ Error al mostrar el menú', m)
  }
}

handler.command = ['menu', 'menú', 'help', 'comandos']
handler.register = false
export default handler

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}
