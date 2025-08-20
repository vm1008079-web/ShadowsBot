//--> Creado por Ado (github.com/Ado-rgb)

import fetch from "node-fetch"

let handler = async (m, { conn, usedPrefix, args, command }) => {
  let texto
  if (args.length >= 1) {
    texto = args.slice(0).join(" ")
  } else if (m.quoted && m.quoted.text) {
    texto = m.quoted.text
  } else throw `🌸 *Uso correcto:*\n\n> ${usedPrefix + command} <texto o responde a un mensaje>\n\nEjemplo:\n> ${usedPrefix + command} Me encanta programar 💻`

  let quote = await crearFrase(m.name, texto)
  await conn.sendFile(m.chat, quote, '', `🍂 *Cita generada* 🍂\n\n👤 *Autor:* ${m.name}\n\n📌 *Solicitado por:* ${m.name}`, m)
}

handler.tags = ["tools"]
handler.command = handler.help = ["quozio"]

export default handler

async function crearFrase(autor, mensaje) {
  const host = "https://quozio.com/"
  let path = ""

  path = "api/v1/quotes"
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