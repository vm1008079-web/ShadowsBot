import fs from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

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

const defaultMenu = {
  before: `
⌬ .・。.・゜✭・.・✫・゜・。. ⌬

∘₊✧ Hola, soy %botname
( %tipo )

꒷︶꒷‧₊˚ ¿Qué tal %name? ˚₊‧꒷︶꒷
𓆩 Actividad » %uptime
𓆩 Fecha » %date

> ✐ Puedes personalizar tu socket:
⤿ .setname ← Cambiar nombre
⤿ .setbanner ← Cambiar banner

∘₊✧ Adonix API Oficial:
> ❀ https://theadonix-api.vercel.app

⌬ .・。.・゜✭・.・✫・゜・。. ⌬
`.trimStart(),

  header: '*꒷︶꒷꒥꒷‧₊˚ %category*',
  body: '> ⤿ %cmd %islimit %isPremium',
  footer: '꒷꒦꒷꒦꒷꒷꒦꒷꒦꒷꒦꒷꒦꒷꒷',
  after: '✦ 𓆩 Made By 𝗪𝗶𝗿𝗸 ☁︎',
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

    const tipo = botActual === '+573147172161'.replace(/\D/g, '')
      ? 'Principal 🅥'
      : 'Sub Bot 🅑'

    const menuConfig = conn.menu || defaultMenu

    // Variables de reemplazo
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
      greeting,
    }

    // Crear el carrusel
    const cards = []

    // Tarjeta de portada
    const coverText = menuConfig.before.replace(
      new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'),
      (_, name) => String(replace[name])
    )

    cards.push({
      title: `Menú de ${nombreBot}`,
      description: coverText,
      imageUrl: bannerFinal,
      footerText: 'Desliza para ver los comandos ➡️'
    })

    // Tarjetas para cada categoría
    for (const [tag, category] of Object.entries(tags)) {
      const categoryHelp = help.filter(menu => menu.tags?.includes(tag)).map(menu =>
        menu.help.map(helpText =>
          menuConfig.body
            .replace(/%cmd/g, menu.prefix ? helpText : `${_p}${helpText}`)
            .replace(/%islimit/g, menu.limit ? '◜⭐◞' : '')
            .replace(/%isPremium/g, menu.premium ? '◜🪪◞' : '')
            .trim()
        ).join('\n')
      ).join('\n')

      const categoryText = `${menuConfig.header.replace(/%category/g, category)}\n\n${categoryHelp}\n\n${menuConfig.footer}`

      cards.push({
        title: category,
        description: categoryText,
        footerText: menuConfig.after
      })
    }

    // Generar el mensaje del carrusel
    const carouselMessage = {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: {
              text: `Menú de comandos de ${nombreBot}`
            },
            footer: {
              text: 'Usa los botones para navegar'
            },
            header: {
              hasMediaAttachment: false
            },
            carouselMessage: {
              cards: cards.map((card, index) => ({
                body: {
                  text: card.description
                },
                footer: {
                  text: card.footerText || (index === 0 ? 'Desliza para ver los comandos ➡️' : menuConfig.after)
                },
                header: index === 0 ? {
                  title: card.title,
                  hasMediaAttachment: true,
                  imageMessage: await createImageMsg(card.imageUrl, conn)
                } : {
                  title: card.title,
                  hasMediaAttachment: false
                },
                nativeFlowMessage: {
                  buttons: [{
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                      display_text: index === 0 ? '👋 ¡Empezar!' : `📌 ${card.title}`,
                      url: ''
                    })
                  }]
                }
              }))
            }
          })
        }
      }
    }

    await conn.relayMessage(
      m.chat,
      generateWAMessageFromContent(m.chat, carouselMessage, {}).message,
      { messageId: null }
    )

  } catch (e) {
    console.error('❌ Error en el menú carrusel:', e)
    conn.reply(m.chat, '❎ Lo sentimos, el menú tiene un error.', m)
  }
}

async function createImageMsg(url, conn) {
  const { imageMessage } = await generateWAMessageContent({
    image: { url }
  }, { upload: conn.waUploadToServer })
  return imageMessage
}

// Utilidades
function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

const ase = new Date()
let hour = ase.getHours()

const greetingMap = {
  0: 'una linda noche 🌙', 1: 'una linda noche 💤', 2: 'una linda noche 🦉',
  3: 'una linda mañana ✨', 4: 'una linda mañana 💫', 5: 'una linda mañana 🌅',
  6: 'una linda mañana 🌄', 7: 'una linda mañana 🌅', 8: 'una linda mañana 💫',
  9: 'una linda mañana ✨', 10: 'un lindo día 🌞', 11: 'un lindo día 🌨',
  12: 'un lindo día ❄', 13: 'un lindo día 🌤', 14: 'una linda tarde 🌇',
  15: 'una linda tarde 🥀', 16: 'una linda tarde 🌹', 17: 'una linda tarde 🌆',
  18: 'una linda noche 🌙', 19: 'una linda noche 🌃', 20: 'una linda noche 🌌',
  21: 'una linda noche 🌃', 22: 'una linda noche 🌙', 23: 'una linda noche 🌃',
}
const greeting = 'espero que tengas ' + (greetingMap[hour] || 'un buen día')

handler.command = ['xd']
handler.register = true
export default handler