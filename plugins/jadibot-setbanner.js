import fs from 'fs'
import path from 'path'
import axios from 'axios'
import FormData from 'form-data'

const handler = async (m, { conn, usedPrefix, command }) => {
  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./JadiBots', senderNumber)
  const configPath = path.join(botPath, 'config.json')

  if (!fs.existsSync(botPath)) {
    return m.reply('✧ Este comando es sólo para los sub bots.')
  }

  const quoted = m.quoted
  let imageMsg

  if (quoted) {
    // Intentar obtener el mensaje directamente
    imageMsg = quoted.message?.imageMessage 
               || quoted.message?.documentMessage 
               || quoted.message?.stickerMessage
               || quoted.message?.videoMessage

    // Validar que tenga mimetype de imagen
    if (imageMsg && imageMsg.mimetype && imageMsg.mimetype.startsWith('image/')) {
      // todo bien
    } else {
      return m.reply(`> 📸 Responde a una imagen (jpg/png/webp/gif) usando *${usedPrefix + command}* para establecer el banner.`)
    }
  } else {
    return m.reply(`> 📸 Responde a una imagen (jpg/png/webp/gif) usando *${usedPrefix + command}* para establecer el banner.`)
  }

  try {
    const stream = await conn.downloadMediaMessage(quoted)
    const buffer = Buffer.from(await stream.arrayBuffer())

    // Subir a Catbox
    const form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append('fileToUpload', buffer, 'banner.png')

    const res = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders()
    })

    const bannerURL = res.data

    // Guardar en config.json
    const config = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath))
      : {}

    config.banner = bannerURL
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

    m.reply(`☁︎ Banner actualizado correctamente:\n${bannerURL}`)
  } catch (e) {
    console.error(e)
    m.reply('❌ No se pudo subir el banner.')
  }
}

handler.help = ['setbanner']
handler.tags = ['serbot']
handler.command = /^setbanner$/i
handler.owner = false
export default handler