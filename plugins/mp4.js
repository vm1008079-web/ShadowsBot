import axios from 'axios'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Pásame el link de YouTube')

  try {
    // Llamamos a tu API que devuelve título y link mp4
    const apiUrl = `https://myapiadonix.vercel.app/api/hd?url=${encodeURIComponent(text)}`
    const res = await axios.get(apiUrl)

    if (!res.data || !res.data.success) {
      return m.reply('No se pudo obtener el video o la API falló')
    }

    const { title, download } = res.data.data

    let mensaje = `🎬 *${title}*\n\n⬇️ Aquí tienes el enlace mp4:\n${download}`
    await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m })

  } catch (error) {
    console.error(error)
    m.reply('Error al obtener el video, intenta luego')
  }
}

handler.command = /^mp4$/i

export default handler