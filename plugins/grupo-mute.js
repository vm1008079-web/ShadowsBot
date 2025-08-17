import fetch from 'node-fetch'

// Comando: mute / unmute
let handler = async (m, { conn, command }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo funciona en grupos.')

  const groupMetadata = await conn.groupMetadata(m.chat)
  const senderData = groupMetadata.participants.find(p => p.id === m.sender)
  const senderIsAdmin = senderData?.admin || m.fromMe
  if (!senderIsAdmin) return m.reply('❌ Solo admins pueden usar este comando.')

  let target = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0])
  if (!target) return m.reply('🍬 Menciona a la persona que deseas mutar/desmutar.')

  // No mutear al creador del grupo ni al bot
  const groupOwner = groupMetadata.owner || m.chat.split('-')[0] + '@s.whatsapp.net'
  if (target === groupOwner) return m.reply('❌ No puedes mutear al creador del grupo.')
  if (target === conn.user.jid) return m.reply('❌ No puedes mutear al bot.')

  // No mutear admins
  const targetData = groupMetadata.participants.find(p => p.id === target)
  if (targetData?.admin) return m.reply('❌ No puedes mutear a un admin.')

  // Inicializar usuario en db
  if (!global.db.data.users[target]) global.db.data.users[target] = {}
  const userDb = global.db.data.users[target]

  if (command === 'mute') {
    if (userDb.muto) return m.reply('🍭 Este usuario ya ha sido mutado.')

    userDb.muto = true
    const msgInfo = {
      key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'Halo' },
      message: {
        locationMessage: {
          name: '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 𝗺𝘂𝘁𝗮𝗱𝗼',
          jpegThumbnail: await (await fetch('https://telegra.ph/file/f8324d9798fa2ed2317bc.png')).buffer(),
        }
      },
      participant: '0@s.whatsapp.net'
    }
    await conn.reply(m.chat, '🔇 Tus mensajes serán eliminados', msgInfo, null, { mentions: [target] })
  } else if (command === 'unmute') {
    if (!userDb.muto) return m.reply('🍭 Este usuario no ha sido mutado.')

    userDb.muto = false
    const msgInfo = {
      key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'Halo' },
      message: {
        locationMessage: {
          name: '𝗨𝘀𝘂𝗮𝗿𝗶𝗼 𝗱𝗲𝗺𝘂𝘁𝗮𝗱𝗼',
          jpegThumbnail: await (await fetch('https://telegra.ph/file/aea704d0b242b8c41bf15.png')).buffer(),
        }
      },
      participant: '0@s.whatsapp.net'
    }
    await conn.reply(m.chat, '🔊 Tus mensajes no serán eliminados', msgInfo, null, { mentions: [target] })
  }
}

// Middleware global para eliminar mensajes de muteados en todos los bots
global.conn.ev.on('messages.upsert', async ({ messages }) => {
  for (const msg of messages) {
    const chat = msg.key.remoteJid
    const user = msg.key.participant || msg.key.remoteJid

    if (!global.db.data.users[user]?.muto) continue

    // Recorremos todos los bots conectados
    for (const bot of Object.values(global.bots || {})) {
      try {
        const groupMetadata = await bot.groupMetadata(chat)
        const botIsAdmin = groupMetadata.participants.some(p => p.id === bot.user?.id && p.admin)

        if (botIsAdmin) {
          await bot.sendMessage(chat, { delete: msg.key })
        }
      } catch (e) {
        console.log('❌ Error eliminando mensaje muteado con subbot:', e)
      }
    }
  }
})

handler.command = ['mute', 'unmute']


export default handler