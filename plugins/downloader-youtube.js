import AdonixScraper from 'adonix-scraper'
import ytSearch from 'yt-search'

const scraper = new AdonixScraper()

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply('📍 Pon el nombre o link de YouTube')

  try {
    let url = text
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      let search = await ytSearch(text)
      if (!search?.videos?.length) return m.reply('❌ No encontré resultados')
      url = search.videos[0].url
    }

    if (command === 'play') {
      const json = await scraper.ytmp3(url)
      if (!json.status) throw new Error('Error al obtener audio')

      const { title, thumbnail, audio } = json.result

      await conn.sendMessage(m.chat, {
        image: { url: thumbnail },
        caption: `🎵 *${title}*\n📥 Descargando audio...`
      }, { quoted: m })

      await new Promise(r => setTimeout(r, 1200))

      await conn.sendMessage(m.chat, {
        audio: { url: audio },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        ptt: false
      }, { quoted: m })

    } else if (command === 'ytvx') {
      const json = await scraper.ytmp4(url)
      if (!json.status) throw new Error('Error al obtener video')

      const { title, thumbnail, download } = json.result

      await conn.sendMessage(m.chat, {
        image: { url: thumbnail },
        caption: `🎬 *${title}*\n📥 Descargando video...`
      }, { quoted: m })

      await new Promise(r => setTimeout(r, 1200))

      await conn.sendMessage(m.chat, {
        video: { url: download },
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`,
        caption: `🎬 *${title}*`
      }, { quoted: m })
    }
  } catch (e) {
    console.error('❌ Error en adonix-scraper:', e)
    m.reply('❌ Error descargando, prueba con otro link o nombre')
  }
}

handler.help = ['play', 'ytvx']
handler.tags = ['descargas']
handler.command = /^(play|ytvx)$/i

export default handler