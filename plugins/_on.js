//--> Hecho por Ado-rgb (github.com/Ado-rgb)
// •|• No quites créditos..
import fetch from 'node-fetch'

let linkRegex = /chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}/i
let linkRegex1 = /whatsapp\.com\/channel\/[0-9A-Za-z]{20,24}/i
const defaultImage = 'https://files.catbox.moe/ubftco.jpg'

async function isAdminOrOwner(m, conn) {
  try {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const participant = groupMetadata.participants.find(p => p.id === m.sender)
    return participant?.admin || m.fromMe
  } catch {
    return false
  }
}

const handler = async (m, { conn, command, args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 Solo funciona en grupos.')

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]
  const type = (args[0] || '').toLowerCase()
  const enable = command === 'on'

  if (!['antilink', 'welcome', 'antiarabe', 'modoadmin'].includes(type)) {
    return m.reply(`✳️ Usa:\n*.on antilink* / *.off antilink*\n*.on welcome* / *.off welcome*\n*.on antiarabe* / *.off antiarabe*\n*.on modoadmin* / *.off modoadmin*`)
  }

  if (!isAdmin) return m.reply('❌ Solo admins (no owner) pueden activar o desactivar funciones.')

  if (type === 'antilink') {
    chat.antilink = enable
    return m.reply(`✅ Antilink ${enable ? 'activado' : 'desactivado'}.`)
  }

  if (type === 'welcome') {
    chat.welcome = enable
    return m.reply(`✅ Welcome ${enable ? 'activado' : 'desactivado'}.`)
  }

  if (type === 'antiarabe') {
    chat.antiarabe = enable
    return m.reply(`✅ Antiarabe ${enable ? 'activado' : 'desactivado'}.`)
  }

  if (type === 'modoadmin') {
    chat.modoadmin = enable
    return m.reply(`✅ Modo Admin ${enable ? 'activado' : 'desactivado'}.`)
  }
}

handler.command = ['on', 'off']
handler.group = true
handler.register = true
handler.tags = ['group']
handler.help = ['on welcome', 'off welcome', 'on antilink', 'off antilink', 'on modoadmin', 'off modoadmin']

handler.before = async (m, { conn }) => {
  if (!m.isGroup) return
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]

  if (chat.modoadmin) {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const isUserAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin
    if (!isUserAdmin && !m.fromMe) return
  }

  if (chat.antiarabe && m.messageStubType === 27) {
    const newJid = m.messageStubParameters?.[0]
    if (!newJid) return

    const number = newJid.split('@')[0].replace(/\D/g, '')
    const arabicPrefixes = ['212', '20', '971', '965', '966', '974', '973', '962']
    const isArab = arabicPrefixes.some(prefix => number.startsWith(prefix))

    if (isArab) {
      await conn.sendMessage(m.chat, { text: `Este pndj ${newJid} será expulsado, no queremos العرب aca, adiosito. [ Anti Arabe Activado ]` })
      await conn.groupParticipantsUpdate(m.chat, [newJid], 'remove')
      return true
    }
  }

  if (chat.antilink) {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const isUserAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin
    const text = m?.text || ''

    if (!isUserAdmin && (linkRegex.test(text) || linkRegex1.test(text))) {
      const userTag = `@${m.sender.split('@')[0]}`
      const delet = m.key.participant
      const msgID = m.key.id

      try {
        const ownGroupLink = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`
        if (text.includes(ownGroupLink)) return
      } catch { }

      try {
        await conn.sendMessage(m.chat, {
          text: `🚫 Hey ${userTag}, no se permiten links aquí.`,
          mentions: [m.sender]
        }, { quoted: m })

        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: msgID,
            participant: delet
          }
        })

        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      } catch {
        await conn.sendMessage(m.chat, {
          text: `⚠️ No pude eliminar ni expulsar a ${userTag}. Puede que no tenga permisos.`,
          mentions: [m.sender]
        }, { quoted: m })
      }
      return true
    }
  }

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
      const txtWelcome = '🌟 BIENVENIDO/A 🌟'
      const bienvenida = `
👋 Hola ${userMention}!

🙌 Te damos la bienvenida a *${groupMetadata.subject}*  
👥 Somos *${groupSize}* personas en esta comunidad.

📌 Porfa sigue las reglas para que todos la pasemos chido.

🛠️ Si necesitas ayuda, habla con algun admin.

✨ ¡Disfruta y participa activamente!

*──────────*
`.trim()

      await conn.sendMessage(m.chat, {
        image: { url: profilePic },
        caption: `${txtWelcome}\n\n${bienvenida}`,
        contextInfo: { mentionedJid: [userId] }
      })
    }

    if (m.messageStubType === 28 || m.messageStubType === 32) {
      const txtBye = '👋 HASTA PRONTO 👋'
      const despedida = `
⚠️ El usuario ${userMention} ha salido de *${groupMetadata.subject}*  
👥 Quedamos *${groupSize}* miembros.

🙏 Gracias por tu tiempo y esperamos verte de nuevo pronto.

💬 Recuerda que las puertas siempre están abiertas.

*──────────*
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