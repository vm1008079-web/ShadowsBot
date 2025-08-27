import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isOwner, groupMetadata }) => {
    if (!m.isGroup) return m.reply('🚫 *Este comando solo funciona en grupos*')
    
    if (!isAdmin && !isOwner) return m.reply('⛔ *Solo administradores pueden usar este comando*')

    const type = (args[0] || '').toLowerCase()
    const text = args.slice(1).join(' ')

    // COMANDO: .listadmin
    if (command === 'listadmin' || type === 'admins') {
        const metadata = await conn.groupMetadata(m.chat)
        const admins = metadata.participants.filter(p => p.admin).map(p => p.id)
        
        let adminList = '👑 *LISTA DE ADMINISTRADORES*\n\n'
        admins.forEach((admin, index) => {
            adminList += `${index + 1}. @${admin.split('@')[0]}\n`
        })
        
        return conn.sendMessage(m.chat, {
            text: adminList,
            mentions: admins
        }, { quoted: m })
    }

    // COMANDO: .setdesc <texto>
    if (command === 'setdesc' && text) {
        try {
            await conn.groupUpdateDescription(m.chat, text)
            return m.reply('✅ *Descripción del grupo actualizada*')
        } catch (error) {
            return m.reply('❌ *No se pudo cambiar la descripción*')
        }
    }

    // COMANDO: .setname <nuevo nombre>
    if (command === 'setname' && text) {
        try {
            await conn.groupUpdateSubject(m.chat, text)
            return m.reply('✅ *Nombre del grupo actualizado*')
        } catch (error) {
            return m.reply('❌ *No se pudo cambiar el nombre*')
        }
    }

    // COMANDO: .kick <@mencion>
    if (command === 'kick') {
        const mentioned = m.mentionedJid[0]
        if (!mentioned) return m.reply('📍 *Menciona a quien quieres expulsar*')
        
        try {
            await conn.groupParticipantsUpdate(m.chat, [mentioned], 'remove')
            return m.reply(`✅ *Usuario expulsado* @${mentioned.split('@')[0]}`, null, { mentions: [mentioned] })
        } catch (error) {
            return m.reply('❌ *No se pudo expulsar al usuario*')
        }
    }

    // COMANDO: .add <número>
    if (command === 'add') {
        const number = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        if (!number) return m.reply('📞 *Ingresa un número válido*')
        
        try {
            await conn.groupParticipantsUpdate(m.chat, [number], 'add')
            return m.reply(`✅ *Usuario agregado al grupo*`)
        } catch (error) {
            return m.reply('❌ *No se pudo agregar al usuario*')
        }
    }

    // COMANDO: .promote <@mencion>
    if (command === 'promote') {
        const mentioned = m.mentionedJid[0]
        if (!mentioned) return m.reply('📍 *Menciona a quien quieres hacer admin*')
        
        try {
            await conn.groupParticipantsUpdate(m.chat, [mentioned], 'promote')
            return m.reply(`✅ *Ahora es administrador* @${mentioned.split('@')[0]}`, null, { mentions: [mentioned] })
        } catch (error) {
            return m.reply('❌ *No se pudo promover a admin*')
        }
    }

    // COMANDO: .demote <@mencion>
    if (command === 'demote') {
        const mentioned = m.mentionedJid[0]
        if (!mentioned) return m.reply('📍 *Menciona a quien quieres quitar como admin*')
        
        try {
            await conn.groupParticipantsUpdate(m.chat, [mentioned], 'demote')
            return m.reply(`✅ *Ya no es administrador* @${mentioned.split('@')[0]}`, null, { mentions: [mentioned] })
        } catch (error) {
            return m.reply('❌ *No se pudo quitar como admin*')
        }
    }

    // COMANDO: .grupoinfo
    if (command === 'grupoinfo') {
        const metadata = await conn.groupMetadata(m.chat)
        const participants = metadata.participants
        const admins = participants.filter(p => p.admin)
        
        const info = `
👥 *INFORMACIÓN DEL GRUPO*

📛 *Nombre:* ${metadata.subject}
🔗 *ID:* ${metadata.id}
👥 *Miembros:* ${participants.length}
👑 *Administradores:* ${admins.length}
📅 *Creado:* ${new Date(metadata.creation * 1000).toLocaleDateString()}
🔒 *Grupo:* ${metadata.restrict ? 'Restringido' : 'Abierto'}
🌐 *Announce:* ${metadata.announce ? 'Solo admins' : 'Todos'}
        `.trim()
        
        return conn.sendMessage(m.chat, { 
            text: info,
            contextInfo: {
                externalAdReply: {
                    title: '📊 Información del Grupo',
                    body: `Miembros: ${participants.length}`,
                    thumbnail: await conn.profilePictureUrl(m.chat, 'image').catch(_ => null),
                    mediaType: 1
                }
            }
        }, { quoted: m })
    }

    // COMANDO: .linkgrupo
    if (command === 'linkgrupo') {
        try {
            const code = await conn.groupInviteCode(m.chat)
            const link = `https://chat.whatsapp.com/${code}`
            return m.reply(`🔗 *Enlace del grupo:*\n${link}`)
        } catch (error) {
            return m.reply('❌ *No se pudo obtener el enlace*')
        }
    }

    // COMANDO: .revokelink
    if (command === 'revokelink') {
        try {
            await conn.groupRevokeInvite(m.chat)
            return m.reply('✅ *Enlace del grupo revocado*')
        } catch (error) {
            return m.reply('❌ *No se pudo revocar el enlace*')
        }
    }

    // COMANDO: .mute <tiempo>
    if (command === 'mute') {
        const time = parseInt(text) || 1
        if (time > 24) return m.reply('⏰ *Máximo 24 horas*')
        
        try {
            await conn.groupSettingUpdate(m.chat, 'announcement')
            m.reply(`🔇 *Grupo silenciado por ${time} hora(s)*`)
            
            if (time > 0) {
                setTimeout(async () => {
                    await conn.groupSettingUpdate(m.chat, 'not_announcement')
                }, time * 3600000)
            }
        } catch (error) {
            return m.reply('❌ *No se pudo silenciar el grupo*')
        }
    }

    // COMANDO: .unmute
    if (command === 'unmute') {
        try {
            await conn.groupSettingUpdate(m.chat, 'not_announcement')
            return m.reply('🔊 *Grupo activado*')
        } catch (error) {
            return m.reply('❌ *No se pudo activar el grupo*')
        }
    }

    // COMANDO: .antifake <acción>
    if (command === 'antifake') {
        if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
        const chat = global.db.data.chats[m.chat]
        
        if (text === 'on') {
            chat.antifake = true
            return m.reply('✅ *Anti-Fake activado*')
        } else if (text === 'off') {
            chat.antifake = false
            return m.reply('❌ *Anti-Fake desactivado*')
        } else {
            return m.reply('⚙️ *Usa:* .antifake on/off')
        }
    }

    // COMANDO: .warn <@mencion>
    if (command === 'warn') {
        const mentioned = m.mentionedJid[0]
        if (!mentioned) return m.reply('📍 *Menciona al usuario*')
        
        if (!global.db.data.users[mentioned]) global.db.data.users[mentioned] = {}
        const user = global.db.data.users[mentioned]
        user.warns = (user.warns || 0) + 1
        
        return m.reply(`⚠️ *Advertencia para* @${mentioned.split('@')[0]}\n*Total:* ${user.warns}/3`, null, { mentions: [mentioned] })
    }

    // MENÚ DE AYUDA SI NO SE RECONOCE EL COMANDO
    const helpText = `
👥 *COMANDOS DE GRUPO*

👑 *Administración:*
• ${usedPrefix}listadmin - Lista de admins
• ${usedPrefix}promote @user - Hacer admin
• ${usedPrefix}demote @user - Quitar admin
• ${usedPrefix}kick @user - Expulsar usuario
• ${usedPrefix}add número - Agregar usuario

📋 *Configuración:*
• ${usedPrefix}setname <texto> - Cambiar nombre
• ${usedPrefix}setdesc <texto> - Cambiar descripción
• ${usedPrefix}linkgrupo - Obtener enlace
• ${usedPrefix}revokelink - Revocar enlace
• ${usedPrefix}mute <horas> - Silenciar grupo
• ${usedPrefix}unmute - Activar grupo

📊 *Información:*
• ${usedPrefix}grupoinfo - Info del grupo
• ${usedPrefix}antifake on/off - Anti números fake
• ${usedPrefix}warn @user - Advertir usuario

💡 *Nota:* Solo para administradores
    `.trim()

    return m.reply(helpText)
}

// Todos los comandos en un solo handler
handler.command = [
    'listadmin', 'admins', 
    'setdesc', 'setname', 
    'kick', 'add', 
    'promote', 'demote', 
    'grupoinfo', 'infogrupo',
    'linkgrupo', 'grouplink',
    'revokelink', 'revoke',
    'mute', 'unmute',
    'antifake', 'warn'
]

handler.tags = ['group']
handler.help = [
    'listadmin - Lista de administradores',
    'setdesc <texto> - Cambiar descripción del grupo',
    'setname <texto> - Cambiar nombre del grupo',
    'kick @user - Expulsar usuario del grupo',
    'add <número> - Agregar usuario al grupo',
    'promote @user - Hacer administrador',
    'demote @user - Quitar administrador',
    'grupoinfo - Información del grupo',
    'linkgrupo - Obtener enlace del grupo',
    'revokelink - Revocar enlace del grupo',
    'mute <horas> - Silenciar el grupo',
    'unmute - Activar el grupo',
    'antifake on/off - Activar/desactivar anti-fake',
    'warn @user - Advertir a usuario'
]

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
