import axios from 'axios'

let HS = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `✎ Ingresa un texto para buscar en pinterest`, m)

  try {
    let api = await axios.get(`https://api.stellarwa.xyz/search/pinterest?query=${encodeURIComponent(text)}`)
    let json = api.data?.data

    if (!json || !json.length) return conn.reply(m.chat, `❌ No se encontraron resultados para *${text}*`, m)

    let data = json[Math.floor(Math.random() * json.length)]

    let { id, created, hd, title } = data
    let HS = `*「✦」 ${title || 'Sin título'}*

> *❀ Creador: » ${created}*
> *🜸 Cink: » https://pinterest.com/pin/${id}*`

    await conn.sendMessage(m.chat, {
      image: { url: hd },
      caption: HS
    }, { quoted: m })

  } catch (error) {
    console.error(error)
    conn.reply(m.chat, '❌ Ocurrió un error al buscar en Pinterest.', m)
  }
}

HS.help = ['pinterest']
HS.tags = ['search']
HS.command = ['pinterest', 'pin, 'pinterestsearch']
HS.register = true
export default HS
