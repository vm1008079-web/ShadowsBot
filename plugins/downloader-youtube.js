import yts from 'yt-search'
import fetch from 'node-fetch'

let handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!args[0]) throw `✳️ Ingresa el nombre de una canción.\n\nEjemplo: *${usedPrefix + command} Arcade - Duncan Laurence*`

  let search = await yts(args.join(' '))
  let vid = search.videos[0]
  if (!vid) throw '❌ No se encontró ningún resultado'

  let res = await fetch(`https://apiadonix.vercel.app/api/ytmp4?url=${vid.url}&format=mp3`)
  let json = await res.json()

  if (!json.status) throw '❌ Error al descargar el audio'

  // 🧾 Mensaje con detalles del video
  let caption = `🎵 *Título:* ${vid.title}
🕒 *Duración:* ${vid.timestamp}
📅 *Publicado:* ${vid.ago}
👤 *Autor:* ${vid.author.name}
🔗 *URL:* ${vid.url}`

  await conn.sendMessage(m.chat, {
    image: { url: vid.thumbnail },
    caption: caption
  }, { quoted: m })

  // 🎧 Enviar el audio mp3
  await conn.sendMessage(m.chat, {
    audio: { url: json.result.download },
    mimetype: 'audio/mpeg',
    ptt: false
  }, { quoted: m })

}

handler.command = ['play']
export default handler