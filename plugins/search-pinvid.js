import fetch from 'node-fetch'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`✳️ Ejemplo de uso:\n${usedPrefix + command} gatitos`)
  }

  const query = encodeURIComponent(args.join(' '))
  const apiUrl = `https://theadonix-api.vercel.app/api/pinvid?q=${query}`

  try {
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!json.status || !json.videos || json.videos.length === 0) {
      return m.reply('❌ No se encontraron resultados.')
    }

    const video = json.videos[Math.floor(Math.random() * json.videos.length)]

    const msg = `
📌 *Título:* ${video.titulo || 'Sin título'}
👤 *Autor:* ${video.autor}
🔗 *Usuario:* ${video.usuario}
🌍 *Fuente:* ${video.fuente}
🎬 *Video aleatorio de Pinterest*
`.trim()

    await conn.sendMessage(m.chat, {
      video: { url: video.video },
      caption: msg,
      jpegThumbnail: await (await fetch(video.thumbnail)).buffer(),
      gifPlayback: true
    }, { quoted: m })

  } catch (err) {
    console.error(err)
    m.reply('❌ Error al obtener el video.')
  }
}

handler.help = ['pinvid <texto>']
handler.tags = ['buscadores']
handler.command = /^pinvid$/i

export default handler