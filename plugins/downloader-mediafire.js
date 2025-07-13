import fetch from 'node-fetch'

const handler = async (msg, { conn, args, command }) => {
  const url = args[0]
  if (!url) {
    return await conn.sendMessage(msg.chat, {
      text: `❌ *Falta el link del video de YouTube*\n\n*Ejemplo:* ${global.prefix + command} https://youtu.be/abc123`
    }, { quoted: msg })
  }

  const api = `https://theadonix-api.vercel.app/api/ytmp42?url=${encodeURIComponent(url)}`
  try {
    await conn.sendMessage(msg.chat, { react: { text: '⏳', key: msg.key } })

    const res = await fetch(api)
    const json = await res.json()

    if (json.status !== 200 || !json.result?.video) {
      return await conn.sendMessage(msg.chat, {
        text: `❌ No se pudo descargar el video.\n${json.mensaje || 'Error desconocido.'}`
      }, { quoted: msg })
    }

    const { title, video, quality, size, filename } = json.result

    await conn.sendMessage(msg.chat, {
      video: { url: video },
      mimetype: 'video/mp4',
      caption: `🎬 *${title}*\n\n📦 *Calidad:* ${quality}\n💾 *Tamaño:* ${size}`,
    }, { quoted: msg })

  } catch (e) {
    console.error('[❌ ytmp42 error]', e)
    await conn.sendMessage(msg.chat, {
      text: '❌ Error al procesar el video. Puede que el enlace esté mal o haya fallado la API.'
    }, { quoted: msg })
  }
}

handler.command = ['ytmp42', 'mp42']
handler.help = ['ytmp42 <link>']
handler.tags = ['descargas']
handler.register = true

export default handler