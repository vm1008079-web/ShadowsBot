import fetch from 'node-fetch'

async function mediaFire(url) {
  try {
    const res = await fetch(url)
    const html = await res.text()

    // Título del archivo
    const title = (html.match(/<title>(.*?)<\/title>/i) || [])[1]?.replace('MediaFire', '').trim() || ''

    // Buscar enlaces <a href="...">
    const allLinks = [...html.matchAll(/href="(https?:\/\/[^"]+)"/gi)].map(m => m[1])

    // Intentar encontrar el botón de descarga real
    const directUrl = allLinks.find(link => link.includes('download') || link.includes('mediafire.com/file')) || ''

    // Nombre de archivo
    const fileMatch = directUrl.match(/\/([^\/]+)$/)
    const filename = fileMatch ? fileMatch[1] : (title || 'file')

    // Tamaño
    const sizeMatch = html.match(/<li>File size: <strong>(.*?)<\/strong>/i)
    const size = sizeMatch ? sizeMatch[1] : 'Unknown'

    return {
      title,
      filename,
      url: directUrl,
      size,
      link: url,
      debugLinks: allLinks.slice(0, 10) // devolvemos los primeros 10 enlaces para inspección
    }
  } catch (e) {
    return { error: e.message }
  }
}

let handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply(`🚩 Ingrese el enlace de un archivo de Mediafire`)
  if (!args[0].match(/mediafire\.com/gi)) return m.reply('🚩 URL inválida, debe ser de MediaFire')

  m.react('💜')

  const result = await mediaFire(args[0])
  if (result.error) return m.reply(`Error: ${result.error}`)
  if (!result.url) {
    return m.reply(`🚩 No se pudo extraer el enlace de descarga.\n\n🔎 Enlaces encontrados:\n${result.debugLinks.join('\n')}`)
  }

  let info = `
乂  *M E D I A F I R E  -  D O W N L O A D*

✩ *💜 File Name:* ${result.title || result.filename}
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