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

function clockString(ms) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

const handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    const user = global.db.data.users[m.sender]
    const { min, xp, max } = xpRange(user.level, global.multiplier)

    const help = Object.values(global.plugins)
      .filter(p => !p.disabled)
      .map(p => ({
        help: Array.isArray(p.help) ? p.help : [p.help],
        tags: Array.isArray(p.tags) ? p.tags : [p.tags],
        prefix: 'customPrefix' in p,
        limit: p.limit,
        premium: p.premium
      }))

    const cards = []
    for (const tag in tags) {
      const cmds = help.filter(c => c.tags.includes(tag)).map(c =>
        c.help.map(cmd =>
          `${c.prefix ? cmd : _p + cmd}${c.premium ? ' 🪪' : ''}${c.limit ? ' ⭐' : ''}`
        ).join('\n')
      ).join('\n')
      if (!cmds) continue
      cards.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: cmds.slice(0, 1024) }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: tags[tag] }),
        header: proto.Message.InteractiveMessage.Header.fromObject({ title: tags[tag], hasMediaAttachment: false }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [{ name: 'info', buttonParamsJson: JSON.stringify({ display_text: 'Más detalles', id: _p + 'info' }) }]
        })
      })
    }

    if (cards.length) {
      const carouselMsg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.fromObject({ text: 'Selecciona una categoría de comandos:' }),
              footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: 'Desliza para ver más' }),
              header: proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: false }),
              carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
            })
          }
        }
      }, { quoted: m })

      try {
        await conn.relayMessage(m.chat, carouselMsg.message, { messageId: carouselMsg.key.id })
        return
      } catch (err) {
        console.warn('Carrusel no compatible → fallback a texto')
      }
    }

    // — Fallback a texto bonito
    let txt = '📋 *Menú de Comandos*\n\n'
    for (const tag in tags) {
      const cmds = help.filter(c => c.tags.includes(tag)).map(c =>
        c.help.map(cmd =>
          `➤ ${c.prefix ? cmd : _p + cmd}${c.premium ? ' 🪪' : ''}${c.limit ? ' ⭐' : ''}`
        ).join('\n')
      ).join('\n')
      if (!cmds) continue
      txt += `*${tags[tag]}*\n${cmds}\n\n`
    }
    await conn.reply(m.chat, txt.trim(), m)

  } catch (e) {
    console.error('❌ Error menú carrusel/fallback:', e)
    await conn.reply(m.chat, '❎ Hubo un error al mostrar el menú.', m)
  }
}

handler.command = ['xd']
handler.register = true
export default handler