import fetch from 'node-fetch'

async function mediaFire(url) {
  try {
    const res = await fetch(`https://api.mediafireapi.workers.dev/?url=${encodeURIComponent(url)}`)
    const data = await res.json()

    if (!data.success) {
      return { error: 'No se pudo obtener el enlace' }
    }

    return {
      title: data.filename || 'Unknown',
      filename: data.filename || 'file',
      url: data.link || '',
      size: data.filesize || 'Unknown',
      link: url
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