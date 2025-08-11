//--> Hecho por Ado-rgb (github.com/Ado-rgb)
// •|• No quites créditos..
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

let linkRegex = /chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}/i
let linkRegex1 = /whatsapp\.com\/channel\/[0-9A-Za-z]{20,24}/i
const defaultImage = 'https://files.catbox.moe/ubftco.jpg'

// Prefijos de números árabes
const arabicPrefixes = ['212', '20', '971', '965', '966', '974', '973', '962']

// Ruta carpeta subbots
const jadiBotsFolder = path.join(process.cwd(), './JadiBots/')

// Función para verificar si es Owner o Subbot
function isOwnerOrSubbot(jid) {
  const number = jid.split('@')[0]
  if (number === '5093732693') return true // Owner
  const folders = fs.existsSync(jadiBotsFolder) ? fs.readdirSync(jadiBotsFolder) : []
  return folders.includes(number)
}

// Función para detectar si un número es árabe
function isArabNumber(jid) {
  const number = jid.split('@')[0].replace(/\D/g, '')
  return arabicPrefixes.some(prefix => number.startsWith(prefix))
}

const handler = async (m, { conn, command, args, isAdmin }) => {
  if (!m.isGroup) return m.reply('🔒 Solo funciona en grupos.')

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]
  const type = (args[0] || '').toLowerCase()
  const enable = command === 'on'

  if (!['antilink', 'welcome', 'antiarabe', 'antiarabepriv', 'modoadmin'].includes(type)) {
    return m.reply(`✳️ Usa:\n*.on antilink* / *.off antilink*\n*.on welcome* / *.off welcome*\n*.on antiarabe* / *.off antiarabe*\n*.on antiarabepriv* / *.off antiarabepriv*\n*.on modoadmin* / *.off modoadmin*`)
  }

  if (['antilink', 'welcome', 'antiarabe', 'modoadmin'].includes(type) && !isAdmin) {
    return m.reply('❌ Solo admins pueden activar o desactivar funciones.')
  }

  if (type === 'antiarabepriv' && !isOwnerOrSubbot(m.sender)) {
    return m.reply('⛔ Solo el owner o subbots autorizados pueden activar/desactivar el AntiArabePriv.')
  }

  chat[type] = enable
  return m.reply(`✅ ${type} ${enable ? 'activado' : 'desactivado'}.`)
}

handler.command = ['on', 'off']
handler.group = true
handler.register = true
handler.tags = ['group']
handler.help = ['on welcome', 'off welcome', 'on antilink', 'off antilink', 'on antiarabe', 'off antiarabe', 'on antiarabepriv', 'off antiarabepriv', 'on modoadmin', 'off modoadmin']

handler.before = async (m, { conn }) => {
  if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
  if (!m.isGroup) {
    // 🚫 Bloqueo automático en privado si AntiArabePriv está activo y es árabe
    const botNumber = conn.user?.id?.split('@')[0]
    const isSubbot = fs.existsSync(path.join(jadiBotsFolder, botNumber))
    if (isSubbot) {
      const botChat = global.db.data.chats[botNumber] || {}
      if (botChat.antiarabepriv && isArabNumber(m.sender)) {
        await conn.sendMessage(m.sender, { text: '⛔ Bloqueado automáticamente por ser número árabe.' })
        await conn.updateBlockStatus(m.sender, 'block')
        return
      }
    }
    return
  }

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]
  let user = global.db.data.users[m.sender]
  if (typeof user.antilinkWarnings !== 'number') user.antilinkWarnings = 0

  if (chat.modoadmin) {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const isUserAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin
    if (!isUserAdmin && !m.fromMe) return
  }

  // ANTIARABE normal
  if (chat.antiarabe && m.messageStubType === 27) {
    const newJid = m.messageStubParameters?.[0]
    if (!newJid) return
    if (isArabNumber(newJid)) {
      await conn.sendMessage(m.chat, { text: `Este pndj ${newJid} será expulsado, no queremos العرب aca. [ Anti Arabe Activado ]` })
      await conn.groupParticipantsUpdate(m.chat, [newJid], 'remove')
      return true
    }
  }

  // ANTIARABE PRIV en grupos
  if (chat.antiarabepriv && m.messageStubType === 27) {
    const newJid = m.messageStubParameters?.[0]
    if (!newJid) return
    if (isArabNumber(newJid)) {
      await conn.sendMessage(m.chat, { text: `⛔ Expulsión automática: ${newJid} es detectado como árabe. [ Anti Arabe PRIV Activado ]` })
      await conn.groupParticipantsUpdate(m.chat, [newJid], 'remove')
      return true
    }
  }

  // ANTILINK
  if (chat.antilink) {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const isUserAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin
    const text = m?.text || ''

    if (!isUserAdmin && (linkRegex.test(text) || linkRegex1.test(text))) {
      try {
        const ownGroupLink = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`
        if (text.includes(ownGroupLink)) return
      } catch { }

      user.antilinkWarnings++
      if (user.antilinkWarnings < 3) {
        await conn.sendMessage(m.chat, {
          text: `⚠️ ${m.sender.split('@')[0]} advertencia ${user.antilinkWarnings}/3 por enviar links\nSi llegas a 3 serás expulsado`,
          mentions: [m.sender]
        }, { quoted: m })

        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.key.id,
            participant: m.key.participant
          }
        })
      } else {
        await conn.sendMessage(m.chat, {
          text: `🚫 ${m.sender.split('@')[0]} alcanzó las 3 advertencias y será expulsado`,
          mentions: [m.sender]
        }, { quoted: m })

        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        user.antilinkWarnings = 0
      }
      return true
    }
  }

  // WELCOME / BYE
  if (chat.welcome && [27, 28, 32].includes(m.messageStubType)) {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupSize = groupMetadata.participants.length
    const userId = m.messageStubParameters?.[0] || m.sender
    const userMention = `@${userId.split('@')[0]}`
    let profilePic

    try {
      profilePic = await conn.profilePictureUrl(userId, 'image')
    } catch {
      profilePic = defaultImage
    }

    if (m.messageStubType === 27) {
      const txtWelcome = '↷✦; w e l c o m e ❞'
      const bienvenida = `
✿ *Bienvenid@* a *${groupMetadata.subject}*   
✰ ${userMention}, qué gusto :D 
✦ Ahora somos *${groupSize}*
`.trim()

      await conn.sendMessage(m.chat, {
        image: { url: profilePic },
        caption: `${txtWelcome}\n\n${bienvenida}`,
        contextInfo: { mentionedJid: [userId] }
      })
    }

    if (m.messageStubType === 28 || m.messageStubType === 32) {
      const txtBye = '↷✦; b y e ❞'
      const despedida = `
✿ *Adiós* de *${groupMetadata.subject}*   
✰ ${userMention}, vuelve pronto :>  
✦ Somos *${groupSize}* aún.  
`.trim()

      await conn.sendMessage(m.chat, {
        image: { url: profilePic },
        caption: `${txtBye}\n\n${despedida}`,
        contextInfo: { mentionedJid: [userId] }
      })
    }
  }
}

export default handler