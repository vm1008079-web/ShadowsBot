import fs from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'

const tags = {
  owner: '👑 **PROPIETARIO DIVINO**',
  serbot: '⚡ **SUBBOTS DEL DIOS**',
  eco: '💎 **ECONOMÍA OSCURA**',
  downloader: '⬇️ **DESCARGAS DEL VACÍO**',
  tools: '🛠️ **HERRAMIENTAS DIVINAS**',
  efectos: '🌀 **EFECTOS DEL PODER**',
  info: '📊 **INFORMACIÓN CÓSMICA**',
  game: '🎮 **JUEGOS DEL MORTAL**',
  gacha: '🎲 **GACHA DEL UNIVERSO**',
  reacciones: '💢 **REACCIONES ZENO**',
  group: '👥 **GRUPOS HUMANOIDES**',
  search: '🔍 **BUSCADORES TEMPORALES**',
  sticker: '📌 **STICKERS DIVINOS**',
  ia: '🤖 **INTELIGENCIA DIVINA**',
  channel: '📺 **CANALES TEMPORALES**',
  fun: '😈 **DIVERSIÓN MALÉVOLA**',
}

// Comandos organizados por categorías
const commands = {
  owner: [
    'antiarabepriv on', 'antiarabepriv off', 'checkplugins', 'copiabots',
    'dsowner', 'restart', 'sendmeme', 'update'
  ],
  serbot: [
    'bots', 'delprimary', 'qr', 'code', 'setbanner', 'setname',
    'setprimary', 'sublist'
  ],
  eco: [
    'crime', 'depositar', 'minar', 'pay', 'robar', 'slut', 'work'
  ],
  downloader: [
    'apk', 'playvideo', 'fb', 'drive', 'gitclone', 'ig', 'instagram',
    'igstory', 'kickdl', 'mediafire', 'mega', 'tiktokvid', 'tiktok',
    'x', 'play8', 'play', 'ytmp3', 'play2', 'playaudio', 'ytmp4', 'play4'
  ],
  tools: [
    'tts', 'hd', 'channel-id', 'deepseek', 'topplayroblox', 'guardar',
    'j', 'quozio', 'reparar', 'whatmusic2', 'ss', 'webapk'
  ],
  efectos: [
    'bass', 'blown', 'deep', 'earrape', 'fast', 'fat', 'nightcore',
    'reverse', 'robot', 'slow', 'smooth', 'tupai', 'reverb', 'chorus',
    'flanger', 'distortion', 'pitch', 'highpass', 'lowpass', 'underwater',
    'echo', 'tremolo', 'pitchshift', 'echo2', 'chipmunk', 'echo3',
    'pitchshift2', 'listeffectaudio'
  ],
  info: [
    'creador', 'ping', 'servers', 'speed', 'sugerir', 'instalarbot'
  ],
  game: [
    'acertijo', 'matematicas', 'trivia'
  ],
  gacha: [
    'c', 'regalar', 'harem', 'rw', 'topwaifus', 'winfo', 'wvideo'
  ],
  reacciones: [
    'abrazar', 'aburrido', 'amor', 'aplaudir', 'bailar', 'bañarse',
    'besar', 'comer', 'angry', 'lengua', 'triste'
  ],
  group: [
    'on welcome', 'off welcome', 'on antilink', 'off antilink',
    'on modoadmin', 'off modoadmin', 'banearbot', 'daradmin', 'kick',
    'kicknum', 'mute', 'unmute', 'personalidad', 'invocar', 'top',
    'desbanearbot', 'tag', 'abrir', 'cerrar'
  ],
  search: [
    'imagen', 'tiktoksearch', 'ytsearch'
  ],
  sticker: [
    'qc', 'sticker', 's', 'aisticker', 'stickersearch', 'toimg', 'tovideo', 'wm'
  ],
  channel: [
    'nuevafotochannel', 'nosilenciarcanal', 'silenciarcanal', 'noseguircanal',
    'seguircanal', 'avisoschannel', 'resiviravisos', 'inspect', 'eliminarfotochannel',
    'reactioneschannel', 'reaccioneschannel', 'nuevonombrecanal', 'nuevadescchannel', 'inspeccionar'
  ],
  ia: [
    'aivideo', 'chatai', 'chatgpt', 'imgia', 'iavoz', 'aimusic'
  ],
  fun: [
    'cr7', 'meme', 'messi'
  ]
}

const defaultMenu = {
  before: `
╔═══════════════════════╗
       𝐁𝐋𝐀𝐂𝐊 𝐁𝐎𝐓- 𝐌𝐃
╚═══════════════════════╝
https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O

_𝐇𝐎𝐋𝐀 𝐇𝐔𝐌𝐀𝐍𝐎𝐈𝐃𝐄_ @user

_𝐁𝐋𝐀𝐂𝐊 𝐁𝐎𝐓, 𝐄𝐋 𝐃𝐈𝐎𝐒 𝐃𝐄 𝐋𝐀 𝐎𝐒𝐂𝐔𝐑𝐈𝐃𝐀𝐃, 𝐌𝐈 𝐏𝐎𝐃𝐄𝐑 𝐄𝐒 𝐀𝐋𝐆𝐎 𝐐𝐔𝐄 𝐓𝐔 𝐂𝐔𝐄𝐑𝐏𝐎 𝐍𝐎 𝐏𝐎𝐃𝐑𝐈𝐀 𝐒𝐎𝐏𝐎𝐑𝐓𝐀𝐑  👑_
───────────────────
┊ _𝐒𝐔𝐁𝐒 𝐂𝐎𝐍𝐄𝐂𝐓𝐀𝐃𝐎𝐒:_ %tipo
┊ 
┊ _𝐁𝐎𝐓 : 𝐒𝐔𝐁/%botname_
┊ 
┊ _𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 : '%p'_
༺═──────────────═༻
_𝐀𝐂𝐀 𝐄𝐒𝐓𝐀 𝐓𝐔 𝐋𝐈𝐒𝐓𝐀 𝐃𝐄 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒_  🐉
»»-------------¤-------------««
`.trimStart(),

  header: '\n╔═══ *%category* ═══╗\n',
  body: '┊ ☠️ *%cmd*',
  footer: '\n╚═══════════════════════╝',
  after: `
╔═══════════════════════╗
  𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐃𝐄 𝐔𝐍 𝐃𝐈𝐎𝐒
╚═══════════════════════╝
`.trim(),
}

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    const { exp, limit, level } = global.db.data.users[m.sender]
    const { min, xp, max } = xpRange(level, global.multiplier)
    const name = await conn.getName(m.sender)

    const d = new Date(Date.now() + 3600000)
    const date = d.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })

    let fkontak = { 
      key: { remoteJid: "status@broadcast", participant: "0@s.whatsapp.net" },
      message: { 
        imageMessage: { 
          caption: "𝐌𝐄𝐍𝐔 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 𝐍𝐄𝐆𝐑𝐎 🐉", 
          jpegThumbnail: Buffer.alloc(0) 
        }
      }
    }
    
    let nombreBot = global.namebot || 'BLACK-BOT'
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

    const tipo = conn.user?.jid === global.conn?.user?.jid ? '𝐏𝐑𝐈𝐍𝐂𝐈𝐏𝐀𝐋' : '𝐒𝐔𝐁-𝐁𝐎𝐓'
    const menuConfig = conn.menu || defaultMenu

    // Construir el menú con los comandos organizados
    const _text = [
      menuConfig.before.replace('@user', '@' + m.sender.split('@')[0]),
      
      // Agregar comandos por categorías
      ...Object.entries(commands).map(([tag, cmds]) => {
        const categoryHeader = menuConfig.header.replace(/%category/g, tags[tag] || tag)
        const categoryBody = cmds.map(cmd => 
          menuConfig.body.replace(/%cmd/g, `${_p}${cmd}`)
        ).join('\n')
        return categoryHeader + categoryBody + menuConfig.footer
      }),
      
      menuConfig.after
    ].join('\n')

    const replace = {
      '%': '%',
      p: _p,
      botname: nombreBot,
      taguser: '@' + m.sender.split('@')[0],
      exp: exp - min,
      maxexp: xp,
      totalexp: exp,
      xp4levelup: max - exp,
      level,
      limit,
      name,
      date,
      uptime: clockString(process.uptime() * 1000),
      tipo,
      readmore: readMore,
      greeting: getGokuBlackGreeting(),
    }

    const text = _text.replace(
      new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'),
      (_, name) => String(replace[name])
    )

    await conn.sendMessage(m.chat, { react: { text: '🐉', key: m.key } })
    
    await conn.sendMessage(
      m.chat,
      { 
        text: text.trim(),
        footer: '𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐃𝐄 𝐔𝐍 𝐃𝐈𝐎𝐒 𝐍𝐎 𝐓𝐈𝐄𝐍𝐄 𝐋𝐈́𝐌𝐈𝐓𝐄𝐒',
        contextInfo: {
          externalAdReply: {
            title: '𝐁𝐋𝐀𝐂𝐊 𝐁𝐎𝐓- 𝐌𝐃',
            body: "𝐃𝐈𝐎𝐒 𝐃𝐄 𝐋𝐀 𝐎𝐒𝐂𝐔𝐑𝐈𝐃𝐀𝐃",
            thumbnailUrl: bannerFinal,
            sourceUrl: "https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O",
            mediaType: 1,
            renderLargerThumbnail: true
          },
          mentionedJid: [m.sender]
        }
      },
      { quoted: fkontak }
    )
  } catch (e) {
    console.error('❌ 𝐄𝐑𝐑𝐎𝐑 𝐄𝐍 𝐄𝐋 𝐌𝐄𝐍𝐔 𝐃𝐈𝐕𝐈𝐍𝐎:', e)
    conn.reply(m.chat, '❌ 𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 𝐅𝐀𝐋𝐋𝐎́...', m)
  }
}

handler.command = ['m', 'menu', 'help', 'hélp', 'menú', 'ayuda', 'comandos', 'poder']
handler.register = false
export default handler

// Utilidades
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

function getGokuBlackGreeting() {
  const gokuBlackPhrases = [
    '𝐋𝐀 𝐎𝐒𝐂𝐔𝐑𝐈𝐃𝐀𝐃 𝐓𝐄 𝐄𝐒𝐏𝐄𝐑𝐀 🌑',
    '𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 𝐄𝐒 𝐓𝐔𝐘𝐎 💀',
    '𝐇𝐔𝐌𝐀𝐍𝐎𝐈𝐃𝐄 𝐃𝐄𝐒𝐏𝐑𝐄𝐂𝐈𝐀𝐁𝐋𝐄 👁️',
    '𝐄𝐋 𝐕𝐀𝐂Í𝐎 𝐓𝐄 𝐂𝐎𝐍𝐒𝐔𝐌𝐄 ⚫',
    '𝐒𝐈𝐄𝐍𝐓𝐄 𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 🔥'
  ]
  return gokuBlackPhrases[Math.floor(Math.random() * gokuBlackPhrases.length)]
      }
