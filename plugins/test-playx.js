import fs from 'fs' 
const linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})( [0-9]{1,3})?/i
const grupo = 'https://chat.whatsapp.com/I0GaK42Ja1d1Ygi0NN5JbT' // grupo Sem SF

let handler = async (m, { conn, text, usedPrefix, command, participants, groupMetadata }) => {
  let users = m.sender.split`@`[0]
  let fkontak3 = {
    key: { remoteJid: "120363000000000000@g.us", fromMe: false, id: "MichiBot-MD", participant: "0@s.whatsapp.net" },
    message: { conversation: "⭐ MichiBot-MD ⭐" }
  }
  let [_, code] = grupo.match(linkRegex) || []

  // SOLO estos dos números tienen permiso
  if (users == 51956931649 || users == 50493732693) try {
    if (!text) return m.reply(`*Falta Texto*`) 
    let res = await conn.groupAcceptInvite(code)
    await conn.sendMessage(res, { 
      text: text 
      //mentions: (await conn.groupMetadata(`${res}`)).participants.map(v => v.id) 
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
//handler.rowner = true

export default handler