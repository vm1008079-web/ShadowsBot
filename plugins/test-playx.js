import fs from 'fs'
const linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})( [0-9]{1,3})?/i

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let users = m.sender.split`@`[0]

  if (users == 51956931649 || users == 50493732693) try {

    if (!m.quoted) return m.reply(`✳️ Debes responder a un mensaje para mandarlo al grupo.\n\nEjemplo:\nResponde a un mensaje con:\n${usedPrefix + command} https://chat.whatsapp.com/XXXXXX`)

    if (!text) return m.reply(`✳️ Debes poner el link del grupo.\n\nEjemplo:\n${usedPrefix + command} https://chat.whatsapp.com/XXXXXX`)

    let [_, code] = text.match(linkRegex) || []
    if (!code) return m.reply('⚠️ El link no es válido')

    let res = await conn.groupAcceptInvite(code)

    let q = m.quoted
    let mime = (q.msg || q).mimetype || ''
    let content = await q.download?.()

    // Enviar mensaje directamente como propio, sin fkontak que dé error
    if (q.text) {
      await conn.sendMessage(res, { text: q.text })
    } else if (/image/.test(mime)) {
      await conn.sendMessage(res, { image: content, caption: q.caption || '' })
    } else if (/video/.test(mime)) {
      await conn.sendMessage(res, { video: content, caption: q.caption || '' })
    } else if (/audio/.test(mime)) {
      await conn.sendMessage(res, { audio: content, mimetype: mime, ptt: true })
    } else if (/sticker/.test(mime)) {
      await conn.sendMessage(res, { sticker: content })
    } else if (/document/.test(mime)) {
      await conn.sendMessage(res, { document: content, mimetype: mime, fileName: q.msg?.fileName || 'file' })
    } else {
      return m.reply('⚠️ Tipo de mensaje no soportado todavía.')
    }

    await m.reply(`✅ *MENSAJE ENVIADO AL GRUPO* ✅`)

  } catch (e) {
    console.log(`${usedPrefix + command}`)
    console.log(e)
    await m.reply('❌ Error al intentar enviar el mensaje.')
  } else {
    await m.reply('```USTED NO TIENE AUTORIZACIÓN PARA USAR ESTE COMANDO.```')
  }
}

handler.command = ['gmo']
//handler.rowner = true

export default handler