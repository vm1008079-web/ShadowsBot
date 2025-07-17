import AdonixScraper from 'adonix-scraper'
import ytSearch from 'yt-search'

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply('📍 Pon nombre o link de YouTube')

  try {
    let url = text
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      const search = await ytSearch(text)
      if (!search?.videos?.length) return m.reply('❌ No encontré resultados')
      url = search.videos[0].url
    }

    if (command === 'play') {
      const res = await AdonixScraper.download(url, '320', 'audio')
      if (!res.status) throw new Error(res.error || 'Error al descargar audio')

      const { title, thumbnail, download } = res.result

      await conn.sendMessage(m.chat, {
        image: { url: thumbnail },
        caption: `🎵 *${title}*\n📥 Descargando audio...`
      }, { quoted: m })

      await new Promise(r => setTimeout(r, 1000))

      await conn.sendMessage(m.chat, {
        audio: { url: download },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        ptt: false
      }, { quoted: m })

    } else if (command === 'ytvx') {
      const res = await AdonixScraper.download(url, '720', 'video')
      if (!res.status) throw new Error(res.error || 'Error al descargar video')

      const { title, thumbnail, download } = res.result

      await conn.sendMessage(m.chat, {
        image: { url: thumbnail },
        caption: `🎬 *${title}*\n📥 Descargando video...`
      }, { quoted: m })

      await new Promise(r => setTimeout(r, 1000))

      await conn.sendMessage(m.chat, {
        video: { url: download },
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`,
        caption: `🎬 *${title}*`
      }, { quoted: m })
    }
  } catch (e) {
    console.error('❌ Error:', e)
    m.reply('❌ Error descargando, prueba con otro link o nombre')
  }
}

handler.help = ['play', 'ytvx']
handler.tags = ['descargas']
handler.command = /^(play|ytvx)$/i

export default handler