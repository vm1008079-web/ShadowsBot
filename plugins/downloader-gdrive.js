// >>⟩ Creador original GianPoolS < github.com/GianPoolS >
// >>⟩ No quites los creditos

import fetch from 'node-fetch'
import { sizeFormatter } from 'human-readable'

const formatSize = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`
})

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) 
    return m.reply(`❗ Uso: ${usedPrefix + command} https://drive.google.com/file/d/ID/view`)

  let url = args[0]
  if (!(url && url.match(/drive\.google\.com\/file/i))) 
    return m.reply('❌ Por favor ingresa una URL válida de Google Drive.')

  try {
    const res = await fdrivedl(url)

    if (!res || !res.downloadUrl) 
      return m.reply('❌ No se pudo obtener la descarga del archivo.')

    let caption = `
🌦 MichiBot-MD 🍁
📄 Archivo: ${res.fileName}
📦 Tamaño: ${res.fileSize}
🗂 Tipo: ${res.mimetype}
🔗 Link original: ${url}
`.trim()

    // Evita archivos muy grandes
    if (res.fileSize.includes('GB') && parseFloat(res.fileSize.replace(' GB', '')) > 1.8)
      return m.reply('❌ El archivo es muy pesado para enviar.')

    await m.reply(caption)
    await conn.sendMessage(m.chat, {
      document: { url: res.downloadUrl },
      fileName: res.fileName,
      mimetype: res.mimetype
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    return m.reply('❌ Por favor ingresa una URL válida de Google Drive.')
  }
}

async function fdrivedl(url) {
  let id = (url.match(/\/?id=(.+)/i) || url.match(/\/d\/(.*?)\//))?.[1]
  if (!id) throw '❌ No se encontró ID de descarga.'

  const res = await fetch(`https://drive.google.com/uc?id=${id}&authuser=0&export=download`, {
    method: 'post',
    headers: {
      'accept-encoding': 'gzip, deflate, br',
      'content-length': 0,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      origin: 'https://drive.google.com',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'x-client-data': 'CKG1yQEIkbbJAQiitskBCMS2yQEIqZ3KAQioo8oBGLeYygE=',
      'x-drive-first-party': 'DriveWebUi',
      'x-json-requested': 'true'
    }
  })

  const { fileName, sizeBytes, downloadUrl } = JSON.parse((await res.text()).slice(4))
  if (!downloadUrl) throw '❌ Se excedió el límite de descargas del link.'

  const data = await fetch(downloadUrl)
  if (data.status !== 200) throw data.statusText

  return {
    downloadUrl,
    fileName,
    fileSize: formatSize(sizeBytes),
    mimetype: data.headers.get('content-type')
  }
}

handler.help = ['drive <url>']
handler.tags = ['downloader']
handler.command = /^(drive|drivedl|dldrive|gdrive)$/i
//handler.register = true
export default handler
