import axios from 'axios'

let pinterestCache = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const user = m.sender

  // Cuando le da clic al botón
  if (!text || text === 'SIGUIENTE_PINTEREST') {
    const cache = pinterestCache[user]
    if (!cache) return conn.reply(m.chat, '❌ No hay una búsqueda activa.\nUsa el comando otra vez:\n.ejemplo anime aesthetic', m)
    return sendPinterest(conn, m, user, cache)
  }

  try {
    const res = await axios.get(`https://api.stellarwa.xyz/search/pinterest?query=${encodeURIComponent(text)}`)
    const data = res.data?.data

    if (!data || !data.length) return conn.reply(m.chat, `❌ No se encontraron resultados para *${text}*`, m)

    // Guardamos la búsqueda por usuario
    pinterestCache[user] = {
      results: data,
      index: 0,
      query: text
    }

    return sendPinterest(conn, m, user, pinterestCache[user])

  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, '❌ Ocurrió un error al buscar en Pinterest.', m)
  }
}

async function sendPinterest(conn, m, user, cache) {
  const item = cache.results[cache.index]
  if (!item) return conn.reply(m.chat, '❌ Ya no hay más imágenes.', m)

  let caption = `╭─❀͜͡༺🌸༻❀─╮\n` +
                `✧ *「${item.title || 'Sin título'}」*\n` +
                `✦ 🧑‍🎨 *Autor:* ${item.full_name} (@${item.username})\n` +
                `✦ 🗓️ *Fecha:* ${item.created}\n` +
                `✦ 👍 *Likes:* ${item.likes} ┆ 👥 *Followers:* ${item.followers}\n` +
                `✦ 🔗 *Pin:* https://pinterest.com/pin/${item.id}\n` +
                `✦ 📝 *Descripción:* ${item.description || 'Sin descripción'}\n` +
                `╰─✦───────────────────╯`

  // Aumenta el índice pa que no repita
  cache.index = (cache.index + 1) % cache.results.length

  await conn.sendMessage(m.chat, {
    image: { url: item.hd },
    caption,
    buttons: [
      {
        buttonId: `${m.prefix}${m.command} SIGUIENTE_PINTEREST`,
        buttonText: { displayText: '❀ Siguiente Imagen' },
        type: 1
      }
    ],
    headerType: 4
  }, { quoted: m })
}

handler.help = ['pinterest <texto>']
handler.tags = ['search', 'image']
handler.command = ['pinterest', 'pin']

export default handler
