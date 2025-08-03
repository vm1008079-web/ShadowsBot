import axios from "axios"

const MESSI_JSON_URL = `https://raw.githubusercontent.com/davidprospero123/api-anime/main/BOT-JSON/Messi.json`
const MESSI_CONTEXT = new Set() // Para guardar los IDs de mensaje con Messi

let handler = async (m, { conn, text, command }) => {
  const isMessiCommand = /^messi$/i.test(command)
  const isNext = /^(siguiente|otra|ver más|ver mas|mas)$/i.test(text)
  const isReplyToMessi = m.quoted && MESSI_CONTEXT.has(m.quoted.id)

  if (!isMessiCommand && !(isNext && isReplyToMessi)) return

  let res
  try {
    res = (await axios.get(MESSI_JSON_URL)).data
  } catch (e) {
    return m.reply('Error al obtener imágenes de Messi 😿')
  }

  if (!Array.isArray(res) || res.length === 0) {
    return m.reply('No se encontraron imágenes de Messi 😿')
  }

  let url = res[Math.floor(Math.random() * res.length)]

  let sentMsg = await conn.sendMessage(
    m.chat,
    {
      image: { url },
      caption: "*Aquí tienes otra de Messi ⚽*",
        ...global.rcanal
      }
    },
    { quoted: m }
  )

  if (sentMsg.key?.id) {
    MESSI_CONTEXT.add(sentMsg.key.id)
    setTimeout(() => MESSI_CONTEXT.delete(sentMsg.key.id), 60 * 1000)
  }
}

handler.help = ['messi']
handler.tags = ['fun']
handler.command = /^messi$/i

export default handler