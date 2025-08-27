import fetch from 'node-fetch'

async function mediaFire(url) {
  try {
    // 1. Traer HTML de MediaFire
    const res = await fetch(url)
    const html = await res.text()

    // 2. Buscar enlace directo en el HTML
    let directUrl = ''
    const match = html.match(/https?:\/\/download[^"]+/i)
    if (match) {
      directUrl = match[0]
    } else {
      // 3. Si no aparece, probamos siguiendo redirecciones manualmente
      const head = await fetch(url, { redirect: 'manual' })
      const loc = head.headers.get('location')
      if (loc && loc.includes('download')) {
        directUrl = loc
      }
    }

    // 4. Extraer título (nombre) y tamaño si existe
    const title = (html.match(/<title>(.*?)<\/title>/i) || [])[1]?.replace('MediaFire', '').trim() || 'file'
    const size = (html.match(/File size:\s*<strong>(.*?)<\/strong>/i) || [])[1] || 'Unknown'

    return {
      title,
      filename: title.replace(/[/\\?%*:|"<>]/g, '') + '.bin',
      url: directUrl,
      size,
      link: url
    }
  } catch (e) {
    return { error: e.message }
  }
}

// ejemplo handler
let handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply(`🚩 Ingrese el enlace de un archivo de Mediafire`)
  if (!args[0].match(/mediafire\.com/gi)) return m.reply('🚩 URL inválida, debe ser de MediaFire')

  m.react('💜')

  const result = await mediaFire(args[0])
  if (result.error) return m.reply(`Error: ${result.error}`)
  if (!result.url) return m.reply('🚩 No se pudo extraer el enlace de descarga')

  let info = `
乂  *M E D I A F I R E  -  D O W N L O A D*

✩ *💜 File Name:* ${result.title}
✩ *🚩 File Size:* ${result.size}
✩ *🔗 Source:* ${result.link}
`

  await conn.sendMessage(m.chat, {
    document: { url: result.url },
    mimetype: 'application/octet-stream',
    fileName: result.filename,
    caption: info
  }, { quoted: m })

  m.react('✅')
}

handler.tags = ['downloader']
handler.command = /^mf$/i

export default handler