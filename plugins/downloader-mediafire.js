import axios from 'axios'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('📎 *Por favor ingresa un enlace de Mediafire*')
  if (!text.includes('http')) return m.reply('❗ Ingresa un enlace válido que contenga "http"')

  try {
    const resmf = await axios.get('https://api.siputzx.my.id/api/d/mediafire?url=' + encodeURIComponent(text))
    m.reply('🕓') // ← Aquí el cambio

    const data = resmf.data.data
    const fileName = data.fileName
    const fileSize = data.fileSize
    const downloadLink = data.downloadLink

    await conn.sendFile(
      m.chat,
      downloadLink,
      downloadLink.split('/').pop(),
      `✅ *Nombre:* ${fileName}\n📦 *Tamaño:* ${fileSize}\n📄 *Tipo:* ${downloadLink.split('.').pop()}`,
      m
    )
  } catch (error) {
    console.error(error)
    m.reply('❌ Ocurrió un error al procesar el enlace')
  }
}

handler.help = ['mediafire']
handler.tags = ['downloader']
handler.command = ['mediafire']
handler.limit = true
export default handler