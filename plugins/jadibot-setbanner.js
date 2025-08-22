import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import FormData from 'form-data'

async function uploadImage(buffer) {
  const form = new FormData()
  form.append('fileToUpload', buffer, 'banner.png')
  form.append('reqtype', 'fileupload')

  const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form })
  if (!res.ok) throw new Error('❌ Error al subir la imagen')
  return await res.text()
}

const handler = async (m, { conn, usedPrefix, command }) => {
  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./JadiBots', senderNumber)
  const configPath = path.join(botPath, 'config.json')

  if (!fs.existsSync(botPath)) {
    return m.reply('✧ Este comando es solo para los sub bots.')
  }

  try {
    await m.react('🕓')

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!mime) {
      return conn.sendMessage(m.chat, {
        text: `❀ Por favor, responde a una imagen usando *${usedPrefix + command}*`,
      }, { quoted: m })
    }

    if (!/image\/(jpe?g|png|webp)/.test(mime)) {
      return conn.sendMessage(m.chat, {
        text: `✧ El formato (${mime}) no es compatible, usa JPG, PNG o WEBP.`,
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
      text: `✧ Subiendo tu banner, espera...`,
    }, { quoted: m })

    let img = await q.download?.()
    if (!img) throw new Error('❌ No se pudo descargar la imagen.')

    let uploadedUrl = await uploadImage(img)

    // Guardar en config.json
    const config = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath))
      : {}

    config.banner = uploadedUrl
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

    await conn.sendMessage(m.chat, {
      text: `☁︎ Banner actualizado correctamente:\n${uploadedUrl}`,
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('✖️')
    await conn.sendMessage(m.chat, {
      text: '❌ No se pudo subir el banner, inténtalo más tarde.',
    }, { quoted: m })
  }
}

handler.help = ['setbanner']
handler.tags = ['serbot']
handler.command = /^setbanner$/i
handler.owner = false
export default handler