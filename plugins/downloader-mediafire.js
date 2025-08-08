import axios from 'axios'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('📎 *Por favor ingresa un enlace de Mediafire*')
  if (!/^https?:\/\/.*mediafire\.com/.test(text)) return m.reply('❗ Ingresa un enlace válido de *Mediafire*')

  try {
    // Reacciona con el reloj mientras procesa
    await conn.sendMessage(m.chat, { react: { text: '🕓', key: m.key } })

    const res = await axios.get(`https://api.siputzx.my.id/api/d/mediafire?url=${encodeURIComponent(text)}`)
    const { fileName, fileSize, downloadLink } = res.data.data

    await conn.sendFile(
      m.chat,
      downloadLink,
      fileName,
      `✅ *Nombre:* ${fileName}\n📦 *Tamaño:* ${fileSize}\n📄 *Tipo:* ${downloadLink.split('.').pop()}`,
      m
    )
  } catch (err) {
    console.error(err)
    m.reply('❌ Ocurrió un error al procesar el enlace o la API está caída.')
  }
}

handler.help = ['mediafire']
handler.tags = ['downloader']
handler.command = ['mediafire']
handler.register = true
export default handler