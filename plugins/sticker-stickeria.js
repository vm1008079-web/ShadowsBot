import fs from "fs"
import fetch from "node-fetch"
import { spawn } from "child_process"

const handler = async (m, { conn, command, usedPrefix, text }) => {
  if (!text) throw `⚠️ Usa: ${usedPrefix + command} <texto para la imagen>`

  let apiUrl = `https://api.botcahx.eu.org/api/search/openai-image?text=${text}&apikey=Apikey_Lu_Mas`
  let res = await fetch(apiUrl)
  if (!res.ok) throw "❌ Error al generar la imagen desde la API"
  let buffer = await res.buffer()

  // Guardamos la imagen temporal
  let imgPath = "./tmp/ai-sticker.png"
  let webpPath = "./tmp/ai-sticker.webp"
  fs.writeFileSync(imgPath, buffer)

  m.reply("✨ Generando tu sticker, espera un momento...")

  // Convertir a WebP con ffmpeg
  await new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-i", imgPath,
      "-vf", "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=white",
      "-vcodec", "libwebp",
      "-lossless", "1",
      "-qscale", "75",
      "-preset", "default",
      "-an", "-vsync", "0",
      webpPath
    ])

    ffmpeg.on("close", (code) => {
      if (code !== 0) return reject(new Error("Error en ffmpeg"))
      resolve()
    })
  })

  // Enviar el sticker
  await conn.sendMessage(m.chat, {
    sticker: { url: webpPath },
    mimetype: "image/webp"
  }, { quoted: m })

  // Borrar archivos temporales
  fs.unlinkSync(imgPath)
  fs.unlinkSync(webpPath)
}

handler.help = ["aisticker <texto>"]
handler.tags = ["sticker"]
handler.command = ["aisticker"]


export default handler