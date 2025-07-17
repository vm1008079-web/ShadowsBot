// Plugin IA creado por Adonay 😎 github.com/Ado-rgb
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  if (m.isGroup || !m.text) return // ignorar en grupos o si no es texto

  const pregunta = m.text.trim()

  // Reacciona como IA
  if (conn.sendMessage) conn.sendMessage(m.chat, { react: { text: "🤖", key: m.key } })

  try {
    const res = await fetch(`https://apiadonix.vercel.app/api/adonix?q=${encodeURIComponent(pregunta)}`)
    const data = await res.json()

    if (!data || !data.respuesta) return m.reply('❌ No hubo respuesta de la IA')

    const respuestaIA = `🤖 *Adonix IA responde:*\n\n${data.respuesta}`

    await conn.sendMessage(m.chat, {
      text: respuestaIA
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('⚠️ Error al contactar con la IA')
  }
}

handler.customPrefix = /^(?![./!#]).+/i // activa con cualquier texto que no sea comando
handler.command = new RegExp() // sin comandos
export default handler