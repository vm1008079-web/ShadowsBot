//--> Creado por Ado (github.com/Ado-rgb)

import fetch from "node-fetch"
import path from "path"
import fs from "fs"

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let texto
  if (args.length >= 1) {
    texto = args.join(" ")
  } else if (m.quoted && m.quoted.text) {
    texto = m.quoted.text
  } else {
    return m.reply(`🌸 *Uso correcto:*\n\n> ${usedPrefix + command} <texto o responde a un mensaje>\n\nEjemplo:\n> ${usedPrefix + command} La vida es bella 🌺`)
  }

  try {
    await m.react('🕓')

    const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
    const configPath = path.join('./JadiBots', botActual, 'config.json')
    let nombreBot = 'QUOZIO FUN 🧃'
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        if (config.name) nombreBot = config.name
      } catch {}
    }

    let quoteUrl = await crearFrase(m.pushName || m.name, texto)

    let fkontak = {
      key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
      message: {
        contactMessage: {
          displayName: nombreBot,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;Bot;;;\nFN:${nombreBot}\nTEL;type=CELL;type=VOICE;waid=50493732693:+504 93732693\nEND:VCARD`,
          jpegThumbnail: null
        }
      }
    }

    let caption = `🍂 *Cita generada* 🍂\n\n👤 *Autor:* ${m.pushName || m.name}\n📌 *Solicitado por:* ${m.pushName || m.name}`

    await conn.sendMessage(m.chat, {
      image: { url: quoteUrl },
      caption,
      contextInfo: { mentionedJid: [m.sender] }
    }, { quoted: fkontak })

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('❌ Ocurrió un error generando la cita.')
  }
}

handler.help = ['quozio']
handler.tags = ['tools']
handler.command = ['quozio']

export default handler

async function crearFrase(autor, mensaje) {
  const host = "https://quozio.com/"
  const body = JSON.stringify({ author: autor, quote: mensaje })

  const quote = await fetch(host + "api/v1/quotes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body
  }).then(res => res.json())

  const quoteId = quote.quoteId

  const templates = await fetch(host + "api/v1/templates")
    .then(res => res.json())
    .then(val => val.data)

  const templateId = templates[Math.floor(Math.random() * templates.length)].templateId

  const imageUrl = await fetch(`${host}api/v1/quotes/${quoteId}/imageUrls?templateId=${templateId}`)
    .then(res => res.json())
    .then(val => val.medium)

  return imageUrl
}