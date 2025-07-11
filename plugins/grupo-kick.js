const handler = async (msg, { conn, isOwner }) => {
  try {
    const chatId = msg.key.remoteJid
    const sender = (msg.key.participant || msg.participant || msg.key.remoteJid).replace(/[^0-9]/g, '')
    const isGroup = chatId.endsWith('@g.us')

    await conn.sendMessage(chatId, { react: { text: '🛑', key: msg.key } })

    if (!isGroup) {
      return await conn.sendMessage(chatId, {
        text: '📛 Este comando solo puede utilizarse en grupos.'
      }, { quoted: msg })
    }

    const metadata = await conn.groupMetadata(chatId)
    const groupAdmins = metadata.participants.filter(p => p.admin)
    const isSenderAdmin = groupAdmins.some(p => p.id.includes(sender))

    if (!isSenderAdmin && !isOwner) {
      return await conn.sendMessage(chatId, {
        text: '🚫 No tienes permisos suficientes para expulsar usuarios. Solo administradores o el propietario del bot pueden hacerlo.'
      }, { quoted: msg })
    }

    let userToKick = null

    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
      userToKick = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]
    } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
      userToKick = msg.message.extendedTextMessage.contextInfo.participant
    }

    if (!userToKick) {
      return await conn.sendMessage(chatId, {
        text: '❗ Por favor, menciona o responde al usuario que deseas expulsar.'
      }, { quoted: msg })
    }

    const isTargetAdmin = groupAdmins.some(p => p.id === userToKick)
    const botId = conn.user.id

    if (isTargetAdmin) {
      return await conn.sendMessage(chatId, {
        text: '⚠️ No puedo expulsar a un administrador del grupo.'
      }, { quoted: msg })
    }

    if (userToKick === botId) {
      return await conn.sendMessage(chatId, {
        text: '⚠️ No es posible autoexpulsarme.'
      }, { quoted: msg })
    }

    await conn.groupParticipantsUpdate(chatId, [userToKick], 'remove')

    await conn.sendMessage(chatId, {
      text: `✅ El usuario @${userToKick.split('@')[0]} ha sido retirado del grupo correctamente.`,
      mentions: [userToKick]
    }, { quoted: msg })

  } catch (error) {
    console.error('❌ Error en el comando kick:', error)
    await conn.sendMessage(msg.key.remoteJid, {
      text: '❌ Se produjo un error al intentar expulsar al usuario.'
    }, { quoted: msg })
  }
}

handler.help = ['kick']
handler.tags = ['grupo']
handler.command = ['kick']
handler.group = true

export default handler