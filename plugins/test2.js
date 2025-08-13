import fs from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'

const tags = {
  serbot: '🌐 𝖲𝗎𝖻𝖡𝗈𝗍𝗌',
  eco: '💸 𝖤𝖼𝗈𝗇𝗈𝗆í𝖺',
  downloader: '⬇️ 𝖣𝖾𝗌𝖼𝖺𝗋𝗀𝖺𝗌',
  tools: '🛠️ 𝖧𝖾𝗋𝗋𝖺𝗆𝗂𝖾𝗇𝗍𝖺𝗌',
  owner: '👑 𝖯𝗋𝗈𝗉𝗂𝖾𝗍𝖺𝗋𝗂𝗈',
  info: 'ℹ️ 𝖨𝗇𝖿𝗈𝗋𝗆𝖺𝖼𝗂𝗈𝗇',
  game: '🎮 𝖩𝗎𝖾𝗀𝗈𝗌',
  gacha: '🎲 𝖦𝖺𝖼𝗁𝖺 𝖠𝗇𝗂𝗆𝖾',
  reacciones: '💕 𝖱𝖾𝖺𝖼𝖼𝗂𝗈𝗇𝖾𝗌 𝖠𝗇𝗂𝗆𝖾',
  group: '👥 𝖦𝗋𝗎𝗉𝗈𝗌',
  search: '🔎 𝖡𝗎́𝗌𝗊𝗎𝖾𝖽𝖺𝗌',
  sticker: '📌 𝖲𝗍𝗂𝖼𝗄𝖾𝗋𝗌',
  ia: '🤖 𝖨𝖠 & 𝖢𝗁𝖺𝗍𝖻𝗈𝗍𝗌',
  channel: '📺 𝖢𝖺𝗇𝖺𝗅𝖾𝗌',
  fun: '😂 𝖣𝗂𝗏𝖾𝗋𝗌𝗂𝗈𝗇',
}

const defaultMenu = {
  before: `
*⻲⃪᮫ۣۖ͢ 💙 ¡Hola %name! Bienvenido a %botname ≛*

╭─❍ *𝗜𝗡𝗙𝗢* ❍─╮
│👤 Usuario: @%taguser
│📅 Fecha: %date
│⏰ Tiempo activo: %uptime
│🎖 Nivel: %level
│✨ Exp: %exp/%maxexp
│🧩 Para subir: %xp4levelup XP
╰───────────────╯

*⻲⃪᮫ۣۖ͢ 🧠 Tipo de bot:* %tipo
%readmore`.trimStart(),

  header: '\n╭─❍ *%category* ❍─╮',
  body: '│◦ %cmd %islimit %isPremium',
  footer: '╰───────────────╯',
  after: `
*⻲⃪᮫ۣۖ͢ 🪼 Menú generado por %botname*
`.trim(),
}

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    const { exp, limit, level } = global.db.data.users[m.sender]
    const { min, xp, max } = xpRange(level, global.multiplier)
    const name = await conn.getName(m.sender)

    const d = new Date(Date.now() + 3600000)
    const locale = 'es'
    const date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })

    const help = Object.values(global.plugins)
      .filter(p => !p.disabled)
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
        limit: plugin.limit,
        premium: plugin.premium,
      }))

    let nombreBot = global.namebot || 'Bot'
    let bannerFinal = './storage/img/menu.jpg'

    const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
    const configPath = join('./JadiBots', botActual, 'config.json')

    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath))
        if (config.name) nombreBot = config.name
        if (config.banner) bannerFinal = config.banner
      } catch (err) {
        console.log('⚠️ No se pudo leer config del subbot:', err)
      }
    }

    const tipo = conn.user.jid === global.conn.user.jid
      ? '𝗣𝗋𝗂𝗇𝖼𝗂𝗉𝖺𝗅 🆅'
      : '𝗌𝗎𝖻𝖻𝗈𝗍 🅱'

    const menuConfig = conn.menu || defaultMenu

    const _text = [
      menuConfig.before,
      ...Object.keys(tags).map(tag => {
        return [
          menuConfig.header.replace(/%category/g, tags[tag]),
          help.filter(menu => menu.tags?.includes(tag)).map(menu =>
            menu.help.map(helpText =>
              menuConfig.body
                .replace(/%cmd/g, menu.prefix ? helpText : `${_p}${helpText}`)
                .replace(/%islimit/g, menu.limit ? '◜⭐◞' : '')
                .replace(/%isPremium/g, menu.premium ? '◜🪪◞' : '')
                .trim()
            ).join('\n')
          ).join('\n'),
          menuConfig.footer,
        ].join('\n')
      }),
      menuConfig.after
    ].join('\n')

    const replace = {
      '%': '%',
      p: _p,
      botname: nombreBot,
      taguser: m.sender.split('@')[0],
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
      greeting: getGreeting(hour),
    }

    const text = _text.replace(
      new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'),
      (_, name) => String(replace[name])
    )

    const isURL = typeof bannerFinal === 'string' && /^https?:\/\//i.test(bannerFinal)
    const imageContent = isURL
      ? { image: { url: bannerFinal } }
      : { image: fs.readFileSync(bannerFinal) }

    await conn.sendMessage(m.chat, {
      ...imageContent,
      caption: text.trim(),
      mentionedJid: conn.parseMention(text)
    }, { quoted: m })

  } catch (e) {
    console.error('❌ Error en el menú:', e)
    conn.reply(m.chat, '❎ Lo sentimos, el menú tiene un error.', m)
  }
}

handler.command = ['menutest']
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

const ase = new Date()
let hour = ase.getHours()

function getGreeting(hour) {
  const greetings = {
    0: 'una linda noche 🌙',
    1: 'una linda noche 💤',
    2: 'una linda noche 🦉',
    3: 'una linda mañana ✨',
    4: 'una linda mañana 💫',
    5: 'una linda mañana 🌅',
    6: 'una linda mañana 🌄',
    7: 'una linda mañana 🌅',
    8: 'una linda mañana 💫',
    9: 'una linda mañana ✨',
    10: 'un lindo día 🌞',
    11: 'un lindo día 🌨',
    12: 'un lindo día ❄',
    13: 'un lindo día 🌤',
    14: 'una linda tarde 🌇',
    15: 'una linda tarde 🥀',
    16: 'una linda tarde 🌹',
    17: 'una linda tarde 🌇',
    18: 'una linda tarde 🌆',
    19: 'una linda noche 🌙',
    20: 'una linda noche 🌙',
    21: 'una linda noche 🌙',
    22: 'una linda noche 🌙',
    23: 'una linda noche 🌙',
  }
  return greetings[hour] || '¡Hola!'
}