import fs from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'

const tags = {
  owner: '👑 PROPIETARIO',
  serbot: '🫟 SUBBOTS',
  eco: '💸 ECONOMÍA',
  downloader: '⬇️ DESCARGAS',
  tools: '🛠️ HERRAMIENTAS',
  efectos: '🍿 EFECTOS',
  info: 'ℹ️ INFORMACIÓN',
  game: '🎮 JUEGOS',
  gacha: '🎲 GACHA ANIME',
  reacciones: '💕 ANIME REACCIONES',
  group: '👥 GRUPOS',
  search: '🔎 BUSCADORES',
  sticker: '📌 STICKERS',
  ia: '🤖 IA',
  channel: '📺 CANALES',
  fun: '😂 DIVERSIÓN',
}

const defaultMenu = {
  before: `
🍂 Hola, Soy *%botname* (%tipo)
*%name*, %greeting

> 🪴 Canal: https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O

🥞 DATE = *%date*
🍿 ACTIVITY = *%uptime*
%readmore
`.trimStart(),

  header: '\n`> %category`',
  body: '🌴 *%cmd* %islimit %isPremium',
  footer: '',
  after: '\n🌤 Creador Ado\n🌿Colaborador GianPoolS',
}

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    const { exp, limit, level } = global.db.data.users[m.sender]
    const { min, xp, max } = xpRange(level, global.multiplier)
    const name = await conn.getName(m.sender)

    const d = new Date(Date.now() + 3600000)
    const date = d.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })

    const help = Object.values(global.plugins)
      .filter(p => !p.disabled)
      .map(p => ({
        help: Array.isArray(p.help) ? p.help : [p.help],
        tags: Array.isArray(p.tags) ? p.tags : [p.tags],
        prefix: 'customPrefix' in p,
        limit: p.limit,
        premium: p.premium,
      }))

    let fkontak = { 
      key: { remoteJid: "status@broadcast", participant: "0@s.whatsapp.net" },
      message: { imageMessage: { caption: "Menu De Comandos 🥦", jpegThumbnail: Buffer.alloc(0) }}
    }
    let nombreBot = global.namebot || 'Bot'
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

    const tipo = conn.user?.jid === global.conn?.user?.jid ? '𝖯𝗋𝗂𝗇𝖼𝗂𝗉𝖺𝗅' : '𝖲𝗈𝖼𝗄𝖾𝗍'
    const menuConfig = conn.menu || defaultMenu

    const _text = [
      menuConfig.before,
      ...Object.keys(tags).sort().map(tag => {
        const cmds = help
          .filter(menu => menu.tags?.includes(tag))
          .map(menu => menu.help.map(h => 
            menuConfig.body
              .replace(/%cmd/g, menu.prefix ? h : `${_p}${h}`)
              .replace(/%islimit/g, menu.limit ? '⭐' : '')
              .replace(/%isPremium/g, menu.premium ? '🪪' : '')
          ).join('\n')).join('\n')
        return [menuConfig.header.replace(/%category/g, tags[tag]), cmds, menuConfig.footer].join('\n')
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
      greeting,
    }

    const text = _text.replace(
      new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'),
      (_, name) => String(replace[name])
    )

    const isURL = /^https?:\/\//i.test(bannerFinal)
    const imageContent = isURL 
      ? { image: { url: bannerFinal } } 
      : { image: fs.readFileSync(bannerFinal) }

    await conn.sendMessage(
  m.chat,
  { 
    text: text.trim(),
    footer: 'Menu de comandos',
    headerType: 4,
    contextInfo: {
      externalAdReply: {
        title: nombreBot,
        body: "🌿 Menú Oficial",
        thumbnailUrl: bannerFinal,
        sourceUrl: "https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O",
        mediaType: 1,
        renderLargerThumbnail: true
      },
      mentionedJid: conn.parseMention(text)
    }
  },
  { quoted: fkontak }
)
  } catch (e) {
    console.error('❌ Error en el menú:', e)
    conn.reply(m.chat, '❎ Lo sentimos, el menú tiene un error.', m)
  }
}

handler.command = ['m', 'menu', 'help', 'hélp', 'menú', 'ayuda']
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

const hour = new Date().getHours()
const greetingMap = {
  0: 'una noche tranquila 🌙', 1: 'una noche tranquila 🌙', 2: 'una noche tranquila 🌙',
  3: 'una mañana tranquila ☀️', 4: 'una mañana tranquila ☀️', 5: 'una mañana tranquila ☀️',
  6: 'una mañana tranquila ☀️', 7: 'una mañana tranquila ☀️', 8: 'una mañana tranquila ☀️',
  9: 'un buen día ☀️', 10: 'un buen día ☀️', 11: 'un buen día ☀️',
  12: 'un buen día ☀️', 13: 'un buen día ☀️', 14: 'una tarde tranquila 🌇',
  15: 'una tarde tranquila 🌇', 16: 'una tarde tranquila 🌇', 17: 'una tarde tranquila 🌇',
  18: 'una noche tranquila 🌙', 19: 'una noche tranquila 🌙', 20: 'una noche tranquila 🌙',
  21: 'una noche tranquila 🌙', 22: 'una noche tranquila 🌙', 23: 'una noche tranquila 🌙',
}
const greeting = 'Espero que tengas ' + (greetingMap[hour] || 'un buen día')