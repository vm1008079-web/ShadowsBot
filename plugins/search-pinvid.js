import fetch from 'node-fetch'
import { writeFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`📌 Ejemplo de uso:\n${usedPrefix + command} gatitos`)

  const query = encodeURIComponent(args.join(' '))
  const api = `https://theadonix-api.vercel.app/api/pinvid?q=${query}`

  try {
    const res = await fetch(api)
    const json = await res.json()

    if (!json.status || !json.videos?.length) {
      return m.reply('❌ No se encontraron resultados.')
    }

    const vid = json.videos[Math.floor(Math.random() * json.videos.length)]

    const vidUrl = vid.video
    const filePath = path.join(tmpdir(), `pinvid_${Date.now()}.mp4`)

    const videoRes = await fetch(vidUrl)
    const buffer = await videoRes.buffer()
    writeFileSync(filePath, buffer)

    await conn.sendMessage(m.chat, {
      video: { url: filePath },
      caption: `
🎬 *${vid.titulo || 'Sin título'}*
👤 Autor: ${vid.autor}
📎 Usuario: ${vid.usuario}
🌐 Fuente: ${vid.fuente}
`.trim(),
      mimetype: 'video/mp4'
    }, { quoted: m })

    // Limpieza
    setTimeout(() => unlinkSync(filePath), 10_000)

  } catch (e) {
    console.error(e)
    m.reply('⚠️ Error al obtener el video.')
  }
}

handler.command = ['pinvid']
handler.help = ['pinvid <texto>']
handler.tags = ['descargas']

export default handler