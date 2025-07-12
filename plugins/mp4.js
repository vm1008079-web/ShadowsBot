import fs from 'fs'
import path from 'path'
import { xpRange } from '../lib/levelling.js'
import { generateWAMessageContent, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

const tags = {
  serbot: '✐ Sockets',
  eco: '✦ Economía',
  downloader: '☄︎ Downloaders',
  tools: 'ᥫ᭡ Herramientas',
  owner: '✧ Owner',
  info: '❀ Info',
  gacha: '☀︎ Gacha Anime',
  group: '꒷ Grupos',
  search: '✧ Buscadores',
  sticker: '✐ Stickers',
  ia: 'ᰔ IA',
  channel: '✿ Channels',
}

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    const { exp, limit, level } = global.db.data.users[m.sender]
    const { min, xp, max } = xpRange(level, global.multiplier)
    const name = await conn.getName(m.sender)
    const d = new Date(Date.now() + 3600000)
    const locale = 'es'
    const date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })

    let nombreBot = global.namebot || 'Bot'
    let bannerFinal = './storage/img/menu.jpg'
    const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
    const configPath = path.join('./JadiBots', botActual, 'config.json')

    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath))
      if (config.name) nombreBot = config.name
      if (config.banner) bannerFinal = config.banner
    }

    const tipo = botActual === '+573147172161'.replace(/\D/g, '') ? 'Principal 🅥' : 'Sub Bot 🅑'

    const help = Object.values(global.plugins)
      .filter(p => !p.disabled)
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
        limit: plugin.limit,
        premium: plugin.premium,
      }))

    const cards = []

    for (const tag in tags) {
      const comandos = help.filter(cmd => cmd.tags.includes(tag)).map(cmd =>
        cmd.help.map(h =>
          `🧩 ${cmd.prefix ? h : _p + h}${cmd.premium ? ' 🪪' : ''}${cmd.limit ? ' ⭐' : ''}`
        ).join('\n')
      ).join('\n')

      if (!comandos) continue

      const title = tags[tag]

      cards.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: comandos.slice(0, 1024)
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: `${nombreBot} • ${tipo}`
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title,
          hasMediaAttachment: false
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [{
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: '❏ Ver más comandos',
              id: `${_p}menu`
            })
          }]
        })
      })
    }

    if (!cards.length) {
      return conn.reply(m.chat, '⚠️ No hay comandos cargados en este momento.', m)
    }

    const carousel = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.fromObject({
              text: `🌸 Bienvenido ${name}\n📆 Fecha: ${date}\n🧬 Nivel: ${level} | XP: ${exp}/${max}`
            }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({
              text: '📂 Categorías de comandos'
            }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
              hasMediaAttachment: false
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              cards
            })
          })
        }
      }
    }, { quoted: m })

    await conn.relayMessage(m.chat, carousel.message, { messageId: carousel.key.id })

  } catch (e) {
    console.error('❌ Error en el menú carrusel:', e)
    conn.reply(m.chat, '❎ Hubo un error al mostrar el menú. Inténtelo nuevamente más tarde.', m)
  }
}

handler.command = ['xd']
handler.register = true
export default handler