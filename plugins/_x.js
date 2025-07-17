// Plugin creado por Ado 🧠💻
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  // ignorar mensajes de grupo o si no es texto
  if (m.isGroup || !m.text) return

  // texto que el usuario escribió
  const pregunta = m.text.trim()

  // reacción pensando 🤔
  if (conn.sendMessage) conn.sendMessage(m.chat, { react: { text: "🤖", key: m.key } })

  // consultar tu API Adonix
  let res = await fetch(`https://apiadonix.vercel.app/api/adonix?q=${encodeURIComponent(pregunta)}`)
  let data = await res.json()

  if (!data || !data.respuesta) return m.reply('❌ Error al obtener respuesta de la IA')

  // armar el texto final
  const textoFinal = `🌐 *Adonix IA*\n\n${data.respuesta}\n\n🕓 _${data.timestamp}_\n🔋 Powered by ${data.powered_by}`

  // enviar como mensaje bonito estilo IA
  await conn.sendMessage(m.chat, {
    text: textoFinal,
    contextInfo: {
      externalAdReply: {
        title: "☕ Adonix IA",
        body: "Respuestas inteligentes con sabor latino 🤖",
        sourceUrl: "https://wa.me/50493732693", // tu número o comunidad
        thumbnailUrl: "https://telegra.ph/file/ba8101e9ae89c2b1a5b38.jpg", // poné la miniatura que quieras
        renderLargerThumbnail: true,
        showAdAttribution: true
      }
    }
  }, { quoted: m })

}

handler.customPrefix = /^(?![./!#]).+/i // detecta todo mensaje sin prefijo
handler.command = new RegExp() // sin comandos
export default handler