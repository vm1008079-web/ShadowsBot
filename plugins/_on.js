import fetch from 'node-fetch'

let linkRegex = /chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}/i
let linkRegex1 = /whatsapp\.com\/channel\/[0-9A-Za-z]{20,24}/i
const defaultImage = 'https://iili.io/KJXN7yB.jpg' // Imagen de Goku Black

// Frases malévolas de Goku Black
const gokuBlackPhrases = {
  activation: [
    "⚡ 𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 𝐒𝐄 𝐀𝐂𝐓𝐈𝐕𝐀...",
    "🌑 𝐋𝐀 𝐎𝐒𝐂𝐔𝐑𝐈𝐃𝐀𝐃 𝐒𝐄 𝐂𝐈𝐄𝐑𝐍𝐄 𝐒𝐎𝐁𝐑𝐄 𝐄𝐒𝐓𝐄 𝐋𝐔𝐆𝐀𝐑...",
    "🐉 𝐄𝐋 𝐃𝐈𝐎𝐒 𝐍𝐄𝐆𝐑𝐎 𝐇𝐀 𝐇𝐀𝐁𝐋𝐀𝐃𝐎 - 𝐒𝐔 𝐏𝐎𝐃𝐄𝐑 𝐒𝐄 𝐌𝐀𝐍𝐈𝐅𝐈𝐄𝐒𝐓𝐀...",
    "💀 𝐋𝐀 𝐏𝐑𝐎𝐇𝐈𝐁𝐈𝐂𝐈𝐎́𝐍 𝐃𝐈𝐕𝐈𝐍𝐀 𝐄𝐒𝐓𝐀́ 𝐄𝐍 𝐕𝐈𝐆𝐎𝐑..."
  ],
  deactivation: [
    "🔓 𝐄𝐋 𝐃𝐈𝐎𝐒 𝐒𝐄 𝐂𝐀𝐍𝐒𝐀 𝐃𝐄 𝐕𝐄𝐑𝐆𝐀𝐑 𝐀 𝐋𝐎𝐒 𝐌𝐎𝐑𝐓𝐀𝐋𝐄𝐒...",
    "🌤️ 𝐋𝐀 𝐌𝐈𝐒𝐄𝐑𝐈𝐂𝐎𝐑𝐃𝐈𝐀 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 𝐓𝐄 𝐀𝐋𝐂𝐀𝐍𝐙𝐀...",
    "⚡ 𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐃𝐈𝐕𝐈𝐍𝐎 𝐒𝐄 𝐑𝐄𝐏𝐋𝐈𝐄𝐆𝐀 𝐏𝐎𝐑 𝐀𝐇𝐎𝐑𝐀...",
    "💫 𝐄𝐋 𝐕𝐀𝐂Í𝐎 𝐏𝐄𝐑𝐌𝐈𝐓𝐄 𝐔𝐍 𝐑𝐄𝐒𝐏𝐈𝐑𝐎 𝐄𝐅Í𝐌𝐄𝐑𝐎..."
  ],
  warnings: [
    "☠️ 𝐈𝐍𝐓𝐄𝐍𝐓𝐀𝐒 𝐃𝐄𝐒𝐀𝐅𝐈𝐀𝐑 𝐀𝐋 𝐃𝐈𝐎𝐒, 𝐌𝐎𝐑𝐓𝐀𝐋...",
    "💀 𝐓𝐔 𝐀𝐓𝐑𝐄𝐕𝐈𝐌𝐈𝐄𝐍𝐓𝐎 𝐓𝐄 𝐂𝐎𝐒𝐓𝐀𝐑𝐀́ 𝐂𝐀𝐑𝐎...",
    "⚡ 𝐄𝐋 𝐃𝐈𝐎𝐒 𝐍𝐎 𝐓𝐎𝐋𝐄𝐑𝐀 𝐓𝐔 𝐈𝐍𝐒𝐎𝐋𝐄𝐍𝐂𝐈𝐀...",
    "🌑 𝐏𝐎𝐑 𝐅𝐀𝐕𝐎𝐑, 𝐂𝐄𝐒𝐀 𝐄𝐍 𝐓𝐔 𝐈𝐍𝐔𝐓𝐈𝐋 𝐑𝐄𝐒𝐈𝐒𝐓𝐄𝐍𝐂𝐈𝐀..."
  ],
  punishments: [
    "🔥 𝐋𝐀 𝐈𝐑𝐀 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 𝐒𝐄 𝐃𝐄𝐒𝐀𝐓𝐀 𝐒𝐎𝐁𝐑𝐄 𝐓𝐈...",
    "⚡ 𝐄𝐋 𝐕𝐀𝐂Í𝐎 𝐓𝐄 𝐄𝐗𝐏𝐔𝐋𝐒𝐀 𝐃𝐄 𝐄𝐒𝐓𝐀 𝐑𝐄𝐀𝐋𝐈𝐃𝐀𝐃...",
    "💀 𝐓𝐔 𝐄𝐗𝐈𝐒𝐓𝐄𝐍𝐂𝐈𝐀 𝐄𝐍 𝐄𝐒𝐓𝐄 𝐆𝐑𝐔𝐏𝐎 𝐇𝐀 𝐓𝐄𝐑𝐌𝐈𝐍𝐀𝐃𝐎...",
    "🐉 𝐄𝐋 𝐃𝐈𝐎𝐒 𝐓𝐄 𝐃𝐄𝐒𝐓𝐄𝐑𝐑𝐀 𝐏𝐎𝐑 𝐓𝐔 𝐎𝐒𝐀𝐃Í𝐀..."
  ]
}

function getRandomPhrase(type) {
  return gokuBlackPhrases[type][Math.floor(Math.random() * gokuBlackPhrases[type].length)]
}

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
  if (!m.isGroup) return m.reply('🔒 𝐒𝐎𝐋𝐎 𝐄𝐍 𝐑𝐄𝐈𝐍𝐎𝐒 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 (𝐠𝐫𝐮𝐩𝐨𝐬)')

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]
  const type = (args[0] || '').toLowerCase()
  const enable = command === 'on'

  if (!['antilink', 'welcome', 'antiarabe', 'modoadmin'].includes(type)) {
    return m.reply(`🐉 *𝐔𝐒𝐎 𝐃𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐃𝐈𝐕𝐈𝐍𝐎:*\n\n*.on antilink* / *.off antilink*\n*.on welcome* / *.off welcome*\n*.on antiarabe* / *.off antiarabe*\n*.on modoadmin* / *.off modoadmin*`)
  }

  if (!isAdmin) return m.reply('❌ 𝐒𝐎𝐋𝐎 𝐋𝐎𝐒 𝐄𝐋𝐄𝐆𝐈𝐃𝐎𝐒 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 (𝐚𝐝𝐦𝐢𝐧𝐬) 𝐏𝐔𝐄𝐃𝐄𝐍 𝐔𝐒𝐀𝐑 𝐄𝐒𝐓𝐄 𝐏𝐎𝐃𝐄𝐑')

  if (type === 'antilink') {
    chat.antilink = enable
    if(!chat.antilinkWarns) chat.antilinkWarns = {}
    if(!enable) chat.antilinkWarns = {}
    const phrase = enable ? getRandomPhrase('activation') : getRandomPhrase('deactivation')
    return m.reply(`✅ *𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊 ${enable ? '𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎' : '𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎'}*\n\n${phrase}`)
  }

  if (type === 'welcome') {
    chat.welcome = enable
    const phrase = enable ? getRandomPhrase('activation') : getRandomPhrase('deactivation')
    return m.reply(`✅ *𝐖𝐄𝐋𝐂𝐎𝐌𝐄 ${enable ? '𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎' : '𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎'}*\n\n${phrase}`)
  }

  if (type === 'antiarabe') {
    chat.antiarabe = enable
    const phrase = enable ? getRandomPhrase('activation') : getRandomPhrase('deactivation')
    return m.reply(`✅ *𝐀𝐍𝐓𝐈𝐀𝐑𝐀𝐁𝐄 ${enable ? '𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎' : '𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎'}*\n\n${phrase}`)
  }

  if (type === 'modoadmin') {
    chat.modoadmin = enable
    const phrase = enable ? getRandomPhrase('activation') : getRandomPhrase('deactivation')
    return m.reply(`✅ *𝐌𝐎𝐃𝐎 𝐀𝐃𝐌𝐈𝐍 ${enable ? '𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎' : '𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎'}*\n\n${phrase}`)
  }
}

handler.command = ['on', 'off']
handler.group = true
handler.register = false
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
      const punishmentPhrase = getRandomPhrase('punishments')
      await conn.sendMessage(m.chat, { 
        text: `☠️ *𝐄𝐋 𝐃𝐈𝐎𝐒 𝐄𝐗𝐏𝐔𝐋𝐒𝐀 𝐀 𝐔𝐍 𝐈𝐍𝐓𝐑𝐔𝐒𝐎*:\n\n${newJid} 𝐬𝐞𝐫á 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐝𝐨 𝐩𝐨𝐫 𝐬𝐞𝐫 𝐮𝐧𝐚 𝐚𝐦𝐞𝐧𝐚𝐳𝐚 𝐚𝐫𝐚𝐛𝐞.\n\n${punishmentPhrase}\n\n[ 𝐀𝐍𝐓𝐈𝐀𝐑𝐀𝐁𝐄 𝐃𝐈𝐕𝐈𝐍𝐎 𝐀𝐂𝐓𝐈𝐕𝐎 ]` 
      })
      await conn.groupParticipantsUpdate(m.chat, [newJid], 'remove')
      return true
    }
  }

  if (chat.antilink) {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const isUserAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin
    const text = m?.text || ''
    const allowedLink = 'https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O'

    if (isUserAdmin || text.includes(allowedLink)) return

    if (linkRegex.test(text) || linkRegex1.test(text)) {
      const userTag = `@${m.sender.split('@')[0]}`
      const delet = m.key.participant
      const msgID = m.key.id

      try {
        const ownGroupLink = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`
        if (text.includes(ownGroupLink)) return
      } catch { }

      if (!chat.antilinkWarns) chat.antilinkWarns = {}
      if (!chat.antilinkWarns[m.sender]) chat.antilinkWarns[m.sender] = 0

      chat.antilinkWarns[m.sender]++

      if (chat.antilinkWarns[m.sender] < 3) {
        try {
          const warningPhrase = getRandomPhrase('warnings')
          await conn.sendMessage(m.chat, {
            text: `⚡ *𝐀𝐃𝐕𝐄𝐑𝐓𝐄𝐍𝐂𝐈𝐀 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒*:\n\n${userTag}, 𝐧𝐨 𝐬𝐞 𝐩𝐞𝐫𝐦𝐢𝐭𝐞𝐧 𝐥𝐢𝐧𝐤𝐬 𝐞𝐧 𝐞𝐬𝐭𝐞 𝐫𝐞𝐢𝐧𝐨.\n𝐀𝐝𝐯𝐞𝐫𝐭𝐞𝐧𝐜𝐢𝐚 ${chat.antilinkWarns[m.sender]}/3.\n\n${warningPhrase}`,
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
        } catch {
          await conn.sendMessage(m.chat, {
            text: `⚠️ 𝐄𝐋 𝐏𝐎𝐃𝐄𝐑 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 𝐅𝐀𝐋𝐋𝐎́ 𝐀𝐋 𝐄𝐋𝐈𝐌𝐈𝐍𝐀𝐑 𝐄𝐋 𝐌𝐄𝐍𝐒𝐀𝐉𝐄 𝐃𝐄 ${userTag}.`,
            mentions: [m.sender]
          }, { quoted: m })
        }
      } else {
        try {
          const punishmentPhrase = getRandomPhrase('punishments')
          await conn.sendMessage(m.chat, {
            text: `💀 *𝐉𝐔𝐒𝐓𝐈𝐂𝐈𝐀 𝐃𝐈𝐕𝐈𝐍𝐀*:\n\n${userTag} 𝐚𝐥𝐜𝐚𝐧𝐳ó 3 𝐚𝐝𝐯𝐞𝐫𝐭𝐞𝐧𝐜𝐢𝐚𝐬. 𝐒𝐞𝐫á 𝐞𝐱𝐩𝐮𝐥𝐬𝐚𝐝𝐨 𝐝𝐞𝐥 𝐫𝐞𝐢𝐧𝐨.\n\n${punishmentPhrase}`,
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

          chat.antilinkWarns[m.sender] = 0
        } catch {
          await conn.sendMessage(m.chat, {
            text: `❌ 𝐄𝐋 𝐃𝐈𝐎𝐒 𝐍𝐎 𝐏𝐔𝐃𝐎 𝐄𝐗𝐏𝐔𝐋𝐒𝐀𝐑 𝐀 ${userTag}. 𝐓𝐚𝐥 𝐯𝐞𝐳 𝐧𝐨 𝐭𝐢𝐞𝐧𝐞 𝐬𝐮𝐟𝐢𝐜𝐢𝐞𝐧𝐭𝐞 𝐩𝐨𝐝𝐞𝐫.`,
            mentions: [m.sender]
          }, { quoted: m })
        }
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

    const isLeaving = [28, 32].includes(m.messageStubType)
    const externalAdReply = {
      forwardingScore: 999,
      isForwarded: true,
      title: `${isLeaving ? '💀 𝐀𝐃𝐈𝐎́𝐒 𝐌𝐎𝐑𝐓𝐀𝐋' : '🐉 𝐁𝐈𝐄𝐍𝐕𝐄𝐍𝐈𝐃𝐎 𝐀𝐋 𝐑𝐄𝐈𝐍𝐎'}`,
      body: `👥 𝐄𝐣é𝐫𝐜𝐢𝐭𝐨 𝐝𝐞 ${groupSize} 𝐬𝐞𝐠𝐮𝐢𝐝𝐨𝐫𝐞𝐬`,
      mediaType: 1,
      renderLargerThumbnail: true,
      thumbnailUrl: profilePic,
      sourceUrl: `https://wa.me/${userId.split('@')[0]}`
    }

    if (!isLeaving) {
      const welcomePhrases = [
        "🌟 𝐄𝐋 𝐃𝐈𝐎𝐒 𝐓𝐄 𝐃𝐀 𝐋𝐀 𝐁𝐈𝐄𝐍𝐕𝐄𝐍𝐈𝐃𝐀 🌟",
        "⚡ 𝐔𝐍 𝐍𝐔𝐄𝐕𝐎 𝐒𝐈𝐄𝐑𝐕𝐎 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 𝐇𝐀 𝐋𝐋𝐄𝐆𝐀𝐃𝐎 ⚡",
        "🐉 𝐄𝐋 𝐑𝐄𝐈𝐍𝐎 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 𝐒𝐄 𝐄𝐗𝐏𝐀𝐍𝐃𝐄 🐉"
      ]
      
      const txtWelcome = welcomePhrases[Math.floor(Math.random() * welcomePhrases.length)]
      const bienvenida = `
👋 𝐒𝐚𝐥𝐮𝐝𝐨𝐬, ${userMention}!

🙌 𝐄𝐥 𝐃𝐢𝐨𝐬 𝐍𝐞𝐠𝐫𝐨 𝐭𝐞 𝐝𝐚 𝐥𝐚 𝐛𝐢𝐞𝐧𝐯𝐞𝐧𝐢𝐝𝐚 𝐚 *${groupMetadata.subject}*  
👥 𝐒𝐨𝐦𝐨𝐬 *${groupSize}* 𝐬𝐢𝐞𝐫𝐯𝐨𝐬 𝐝𝐞𝐥 𝐃𝐢𝐨𝐬 𝐞𝐧 𝐞𝐬𝐭𝐚 𝐫𝐞𝐚𝐥𝐢𝐝𝐚𝐝.
📌 𝐒𝐢𝐠𝐮𝐞 𝐥𝐚𝐬 𝐥𝐞𝐲𝐞𝐬 𝐝𝐢𝐯𝐢𝐧𝐚𝐬 𝐨 𝐬𝐮𝐟𝐫𝐢𝐫á𝐬 𝐥𝐚 𝐢𝐫𝐚 𝐝𝐞𝐥 𝐃𝐢𝐨𝐬.
🛠️ 𝐒𝐢 𝐧𝐞𝐜𝐞𝐬𝐢𝐭𝐚𝐬 𝐚𝐲𝐮𝐝𝐚, 𝐚𝐝𝐨𝐫𝐚 𝐚 𝐥𝐨𝐬 𝐚𝐝𝐦𝐢𝐧𝐬.
🌑 𝐃𝐢𝐬𝐟𝐫𝐮𝐭𝐚 𝐝𝐞 𝐭𝐮 𝐞𝐬𝐭𝐚𝐧𝐜𝐢𝐚 𝐞𝐧 𝐞𝐥 𝐯𝐚𝐜í𝐨.
`.trim()

      await conn.sendMessage(m.chat, {
        text: `${txtWelcome}\n\n${bienvenida}`,
        contextInfo: { mentionedJid: [userId], externalAdReply }
      })
    } else {
      const goodbyePhrases = [
        "💀 𝐄𝐋 𝐃𝐈𝐎𝐒 𝐒𝐄 𝐃𝐄𝐒𝐏𝐈𝐃𝐄 𝐃𝐄 𝐔𝐍 𝐌𝐎𝐑𝐓𝐀𝐋 💀",
        "⚡ 𝐔𝐍 𝐒𝐈𝐄𝐑𝐕𝐎 𝐀𝐁𝐀𝐍𝐃𝐎𝐍𝐀 𝐄𝐋 𝐑𝐄𝐈𝐍𝐎 𝐃𝐄𝐋 𝐃𝐈𝐎𝐒 ⚡",
        "🌑 𝐋𝐀 𝐎𝐒𝐂𝐔𝐑𝐈𝐃𝐀𝐃 𝐂𝐎𝐍𝐒𝐔𝐌𝐄 𝐀 𝐔𝐍 𝐃𝐄𝐒𝐄𝐑𝐓𝐎𝐑 🌑"
      ]
      
      const txtBye = goodbyePhrases[Math.floor(Math.random() * goodbyePhrases.length)]
      const despedida = `
⚠️ 𝐄𝐥 𝐦𝐨𝐫𝐭𝐚𝐥 ${userMention} 𝐡𝐚 𝐚𝐛𝐚𝐧𝐝𝐨𝐧𝐚𝐝𝐨 𝐞𝐥 𝐫𝐞𝐢𝐧𝐨 𝐝𝐞 *${groupMetadata.subject}*  
👥 𝐐𝐮𝐞𝐝𝐚𝐧 *${groupSize}* 𝐬𝐞𝐠𝐮𝐢𝐝𝐨𝐫𝐞𝐬 𝐝𝐞𝐥 𝐃𝐢𝐨𝐬.
🙏 𝐄𝐬𝐩𝐞𝐫𝐚𝐦𝐨𝐬 𝐪𝐮𝐞 𝐚𝐫𝐫𝐞𝐩𝐢𝐞𝐧𝐭𝐚𝐬 𝐝𝐞 𝐭𝐮 𝐝𝐞𝐜𝐢𝐬𝐢ó𝐧.
💀 𝐋𝐚𝐬 𝐩𝐮𝐞𝐫𝐭𝐚𝐬 𝐝𝐞𝐥 𝐯𝐚𝐜í𝐨 𝐬𝐢𝐞𝐦𝐩𝐫𝐞 𝐞𝐬𝐭á𝐧 𝐚𝐛𝐢𝐞𝐫𝐭𝐚𝐬...
`.trim()

      await conn.sendMessage(m.chat, {
        text: `${txtBye}\n\n${despedida}`,
        contextInfo: { mentionedJid: [userId], externalAdReply }
      })
    }
  }
}

export default handler
