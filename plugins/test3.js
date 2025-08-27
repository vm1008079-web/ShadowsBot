import fetch from 'node-fetch'

async function mediafireDl(url) {
  const res = await fetch(url)
  const html = await res.text()

  // Buscar enlace directo de descarga
  const match = html.match(/https?:\/\/download[^"]+/i)
  if (!match) throw new Error('No se encontró el enlace de descarga')

  const directUrl = match[0]

  // Nombre del archivo
  const filename = directUrl.split('/').pop().split('?')[0]

  // Tamaño (opcional, si aparece en la página)
  const size = (html.match(/<li>File size: <span>(.*?)<\/span><\/li>/i) || [])[1] || 'Desconocido'

  return {
    url: directUrl,
    filename,
    size
  }
}

// Ejemplo de handler
let handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply('🚩 Ingresa un link de MediaFire')
  if (!args[0].includes('mediafire.com')) return m.reply('🚩 El enlace debe ser de MediaFire')

  m.react('⏳')
  try {
    let file = await mediafireDl(args[0])

    let info = `
乂  *M E D I A F I R E  -  D O W N L O A D*

✩ *Nombre:* ${file.filename}
✩ *Tamaño:* ${file.size}
✩ *Link directo:* ${file.url}
`

    await conn.sendMessage(m.chat, {
      document: { url: file.url },
      fileName: file.filename,
      mimetype: 'application/octet-stream',
      caption: info
    }, { quoted: m })

    m.react('✅')
  } catch (e) {
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.command = /^mf$/i
export default handler