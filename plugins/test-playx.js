import fs from 'fs'

const linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})( [0-9]{1,3})?/i
const grupo = 'https://chat.whatsapp.com/I0GaK42Ja1d1Ygi0NN5JbT' // grupo Sem SF

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let users = m.sender.split`@`[0]

  let fkontak3 = {
    key: { 
      remoteJid: "120363000000000000@g.us", 
      fromMe: false, 
      id: "MichiBot-MD", 
      participant: "0@s.whatsapp.net" 
    },
    message: { conversation: "🪸 𝖠𝖨 - 𝖬𝗂𝖼𝗁𝗂" }
  }

  let [_, code] = grupo.match(linkRegex) || []

  // SOLO estos dos números tienen permiso
  if (users == 51956931649 || users == 50493732693) try {
    if (!m.quoted) return m.reply('*Responde a un mensaje con foto para enviarlo*')
    
    let mediaMessage = m.quoted

    // Revisar si el mensaje tiene imagen o video
    let type = Object.keys(mediaMessage.message).find(k => ['imageMessage','videoMessage'].includes(k))
    if (!type) return m.reply('*El mensaje citado no tiene foto ni video*')

    // Descargar media
    let mediaData = await conn.downloadMediaMessage(mediaMessage)
    
    // Subir al grupo
    let res = await conn.groupAcceptInvite(code)

    await conn.sendMessage(res, { 
      [type.replace('Message','')]: mediaData,
      caption: text || ''
    }, { quoted: fkontak3 })

    await m.reply(`✅ *MENSAJE ENVIADO ✅* `)

  } catch (e) {
    console.log(`${usedPrefix + command}`)
    console.log(e)

  } else {
    await m.reply('```USTED NO TIENE AUTORIZACIÓN PARA USAR ESTE COMANDO.```')
  }
}

handler.command = ['grupom','gmo']

export default handler