//--> Creado por Ado (github.com/Ado-rgb)

import fetch from "node-fetch"

let handler = async (m, { conn, usedPrefix, args, command }) => {
  let texto
  if (args.length >= 1) {
    texto = args.slice(0).join(" ")
  } else if (m.quoted && m.quoted.text) {
    texto = m.quoted.text
  } else {
    return conn.sendMessage(m.chat, {
      text: `🌸 *Uso correcto:*\n\n> ${usedPrefix + command} <texto o responde a un mensaje>\n\nEjemplo:\n> ${usedPrefix + command} Me encanta programar 💻`,
      ...fkontak()
    })
  }

  let quote = await crearFrase(m.name, texto)
  await conn.sendMessage(m.chat, {
    image: { url: quote },
    caption: `🍂 *Cita generada* 🍂\n\n👤 *Autor:* ${m.name}\n📌 *Solicitado por:* ${m.name}`,
    ...fkontak()
  })
}

handler.tags = ["tools"]
handler.command = ["quozio"]
handler.help = ["quozio"]

export default handler

async function crearFrase(autor, mensaje) {
  const host = "https://quozio.com/"
  let path = "api/v1/quotes"
  const body = JSON.stringify({
    author: autor,
    quote: mensaje,
  })

  const quote = await fetch(host + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  }).then(res => res.json())

  const quoteId = quote["quoteId"]

  path = "api/v1/templates"
  const templates = await fetch(host + path).then(res => res.json()).then(val => val["data"])

  const index = Math.floor(Math.random() * templates.length)
  const templateId = templates[index]["templateId"]

  path = `api/v1/quotes/${quoteId}/imageUrls?templateId=${templateId}`
  const imageUrl = await fetch(host + path).then(res => res.json()).then(val => val["medium"])

  return imageUrl
}

// fkontak tipo contacto
function fkontak() {
  let nombreBot = "QUOZIO FUN 🧃"
  return {
    quoted: {
      key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
      message: {
        contactMessage: {
          displayName: nombreBot,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;Bot;;;\nFN:${nombreBot}\nTEL;type=CELL;type=VOICE;waid=50493732693:+504 93732693\nEND:VCARD`,
          jpegThumbnail: null
        }
      }
    }
  }
}