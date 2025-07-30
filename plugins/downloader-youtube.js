// github.com/Ado-rgb
import fetch from 'node-fetch'
import yts from 'yt-search'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!args[0]) return m.reply(`*ꕥ Uso correcto ›* ${usedPrefix + command} <enlace o nombre>`)

  try {
    // Obtener nombre personalizado del subbot
    const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
    const configPath = path.join('./JadiBots', botActual, 'config.json')

    let nombreBot = global.namebot || '✧ michi ✧'
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        if (config.name) nombreBot = config.name
      } catch (err) {
        console.log('⚠️ No se pudo leer config del subbot:', err)
      }
    }

    let url = args[0]
    let videoInfo = null

    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      let search = await yts(args.join(' '))
      if (!search.videos || search.videos.length === 0) return m.reply('*ꕥ No encontré resultados*')
      videoInfo = search.videos[0]
      url = videoInfo.url
    } else {
      // Buscar info del video por enlace
      let id = url.split('v=')[1]?.split('&')[0] || url.split('/').pop()
      let search = await yts({ videoId: id })
      if (search && search.title) videoInfo = search
    }

    // ✂️ Validar duración
    if (videoInfo.seconds > 3780) { // 63 minutos x 60 segundos
      return m.reply(`⛔ El video dura más de *63 minutos*\n❌ No puedo descargarlo por ser muy largo`)
    }

    let apiUrl = ''
    let isAudio = false

    if (command == 'play' || command == 'ytmp3') {
      apiUrl = `https://myapiadonix.vercel.app/api/ytmp3?url=${encodeURIComponent(url)}`
      isAudio = true
    } else if (command == 'play2' || command == 'ytmp4') {
      apiUrl = `https://myapiadonix.vercel.app/api/ytmp4?url=${encodeURIComponent(url)}`
    } else {
      return m.reply('*ꕥ Comando no reconocido*')
    }

    let res = await fetch(apiUrl)
    if (!res.ok) throw new Error('No se pudo conectar a la API')
    let json = await res.json()
    if (!json.success) throw new Error('No se pudo obtener la información del video')

    let { title, thumbnail, quality, download } = json.data
    let duration = videoInfo?.timestamp || 'N/A'

    // Mensaje con detalles decorados
    let details = `› *${title}*
» Duración › *${duration}*
⚥ Calidad › *${quality}*
⛁ Tipo › *${isAudio ? 'Audio' : 'Video'}*
❒ Fuente › *YouTube*
    `.trim()

    await conn.sendMessage(m.chat, { 
      text: details, 
      contextInfo: { 
        externalAdReply: { 
          title: nombreBot, 
          body: 'Un momento..',
          thumbnailUrl: thumbnail,
          sourceUrl: 'https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    // Enviar archivo
    if (isAudio) {
      await conn.sendMessage(m.chat, { 
        audio: { url: download }, 
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        ptt: true
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, { 
        video: { url: download }, 
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`
      }, { quoted: m })
    }

  } catch (e) {
    console.error(e)
    m.reply('*ꕥ Ocurrió un error al procesar tu solicitud*')
  }
}

handler.help = ['play', 'ytmp3', 'play2', 'ytmp4']
handler.tags = ['downloader']
handler.command = ['play', 'play2', 'ytmp3', 'ytmp4']

export default handler