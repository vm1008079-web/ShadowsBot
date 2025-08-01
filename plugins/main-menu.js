import fs from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'

const tags = {
  serbot: '🌐 SISTEMA',
  eco: '💸 ECONOMÍA',
  downloader: '⬇️ DESCARGAS',
  tools: '🛠️ HERRAMIENTAS',
  owner: '👑 PROPIETARIO',
  info: 'ℹ️ INFORMACIÓN',
  game: '🎮 JUEGOS',
  gacha: '🎲 GACHA ANIME',
  group: '👥 GRUPOS',
  search: '🔎 BUSCADORES',
  sticker: '📌 STICKERS',
  ia: '🤖 IA',
  channel: '📺 CANALES',
  fun: '😂 DIVERSIÓN',
}

const defaultMenu = {
  before: `
> 🌟 *Hola, soy %botname* 🌟

> 👋 Hola *%name*, %greeting

> 📅 Fecha: *%date*
> ⏳ Uptime: *%uptime*
%readmore`.trimStart(),

  header: '\n💚 *%category* 💚',
  body: '> 🫟 %cmd %islimit %isPremium',
  footer: '',
  after: '\n✨ 𝖢𝗋𝖾𝖺𝗍𝖾𝖽 𝖡𝗒 𝖠𝖽𝗈.',
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

    const tipo = (conn.user?.jid?.split('@')[0].replace(/\D/g, '') === '50493059810') ? 'Principal 🅥' : 'Sub Bot 🅑'

    const menuConfig = conn.menu || defaultMenu

    let _text = menuConfig.before
      .replace(/%name/g, name)
      .replace(/%botname/g, nombreBot)
      .replace(/%date/g, date)
      .replace(/%uptime/g, clockString(process.uptime() * 1000))
      .replace(/%tipo/g, tipo)

    for (const tag of Object.keys(tags)) {
      const categoryBlock = [
        menuConfig.header.replace(/%category/g, tags[tag]),
        help.filter(menu => menu.tags?.includes(tag)).map(menu =>
          menu.help.map(cmd =>
            menuConfig.body
              .replace(/%cmd/g, `${menu.prefix ? cmd : _p + cmd}`)
              .replace(/%islimit/g, menu.limit ? '⭐' : '')
              .replace(/%isPremium/g, menu.premium ? '🛡️' : '')
          ).join('\n')
        ).join('\n'),
        menuConfig.footer
      ].join('\n')
      _text += '\n\n' + categoryBlock
    }

    _text += '\n' + menuConfig.after

    await conn.sendMessage(m.chat, {
      text: _text.trim(),
      mentions: [m.sender]
    }, { quoted: m })

  } catch (e) {
    console.error('❌ Error en el menú:', e)
    conn.reply(m.chat, '❎ Lo sentimos, el menú tiene un error.', m)
  }
}

handler.command = ['menu', 'help', 'menú']
handler.register = true
export default handler

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}