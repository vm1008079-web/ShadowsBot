import yts from 'yt-search'
import fetch from 'node-fetch'

let handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!args[0]) throw `✳️ Ingresa el nombre de una canción.\n\nEjemplo: *${usedPrefix + command} Arcade - Duncan Laurence*`

  let search = await yts(args.join(' '))
  let vid = search.videos[0]
  if (!vid) throw '❌ No se encontró ningún resultado'

  // Usa la nueva API de ytmp3
  let res = await fetch(`https://apiadonix.vercel.app/api/ytmp3?url=${vid.url}`)
  let json = await res.json()

  if (json.status !== 200) throw '❌ Error al descargar el audio'

  // Mensaje con detalles del video
  let caption = `🎵 *Título:* ${json.result.title}
🕒 *Duración:* ${vid.timestamp}
📅 *Publicado:* ${vid.ago}
👤 *Autor:* ${vid.author.name}
🔗 *URL:* ${vid.url}`

  // Manda la miniatura y detalles
  await conn.sendMessage(m.chat, {
    image: { url: vid.thumbnail },
    caption: caption
  }, { quoted: m })

  // Manda el audio mp3 desde el enlace que devuelve la API nueva
  await conn.sendMessage(m.chat, {
    audio: { url: json.result.audio },
    mimetype: 'audio/mpeg',
    ptt: false
  }, { quoted: m })
}

handler.command = ['play']
export default handler