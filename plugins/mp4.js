import fetch from 'node-fetch'
import yts from 'yt-search'
import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'

const TMP_DIR = path.resolve('./tmp')

function ensureTmpDir() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true })
}

function sanitizeFilename(name = '') {
  return (name || 'video')
    .replace(/[/\\?%*:|"<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200)
}

async function uniquePath(basePath) {
  const dir = path.dirname(basePath)
  const ext = path.extname(basePath)
  const name = path.basename(basePath, ext)
  let i = 1
  let candidate = basePath
  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${name} (${i})${ext}`)
    i++
  }
  return candidate
}

async function downloadFile(url, destPath) {
  const res = await fetch(url)
  if (!res.ok || !res.body) throw new Error('No se pudo descargar el archivo desde la API.')
  const fileStream = fs.createWriteStream(destPath)
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream)
    res.body.on('error', reject)
    fileStream.on('finish', resolve)
  })
}

let handler = async (m, { conn, args, command, usedPrefix }) => {
  if (!args[0]) return m.reply(`✅ Uso: ${usedPrefix + command} <enlace de YouTube o nombre>`)

  try {
    ensureTmpDir()

    // Cargar nombre del bot
    const botActual = conn.user?.jid?.split('@')[0].replace(/\D/g, '')
    const configPath = path.join('./JadiBots', botActual || '', 'config.json')

    let nombreBot = global.namebot || '⎯⎯⎯⎯⎯⎯ Bot Principal ⎯⎯⎯⎯⎯⎯'
    if (botActual && fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        if (config.name) nombreBot = config.name
      } catch {}
    }

    // Resolver URL de YouTube desde búsqueda si fue necesario
    let url = args[0]
    let videoInfo = null

    if (!/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url)) {
      const search = await yts(args.join(' '))
      if (!search.videos || search.videos.length === 0) return m.reply('No se encontraron resultados.')
      videoInfo = search.videos[0]
      url = videoInfo.url
    } else {
      const id = url.split('v=')[1]?.split('&')[0] || url.split('/').pop()
      const search = await yts({ videoId: id })
      if (search && search.title) videoInfo = search
    }

    // Usar API de video
    const apiUrl = `https://myapiadonix.vercel.app/api/ytmp4?url=${encodeURIComponent(url)}`
    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error('Error al conectar con la API.')
    const json = await res.json()
    if (!json.success) throw new Error('No se pudo obtener información del video.')

    const { title, thumbnail, quality, download } = json.data
    const duration = videoInfo?.timestamp || 'Desconocida'

    // Anunciar procesamiento
    const details = `
📌 Título : *${title}*
📁 Duración : *${duration}*
📥 Calidad : *${quality || 'Desconocida'}*
📄 Envío : *Documento (MP4)*
📂 Temp : *./tmp*
🌐 Fuente : *YouTube*`.trim()

    await conn.sendMessage(m.chat, {
      text: details,
      contextInfo: {
        externalAdReply: {
          title: nombreBot,
          body: 'Descargando y preparando el archivo…',
          thumbnailUrl: thumbnail,
          sourceUrl: 'https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    // Guardar en ./tmp
    const safeTitle = sanitizeFilename(title)
    const outPath = await uniquePath(path.join(TMP_DIR, `${safeTitle}.mp4`))

    await downloadFile(download, outPath)

    // Tamaño final
    const stat = await fsp.stat(outPath).catch(() => null)
    const sizeTxt = stat ? `${(stat.size / (1024 ** 2)).toFixed(1)} MB` : 'Desconocido'

    // ✅ Enviar como documento usando stream local
    await conn.sendMessage(m.chat, {
      document: fs.readFileSync(outPath),
      mimetype: 'video/mp4',
      fileName: path.basename(outPath),
      caption: `✅ Listo\n📌 ${title}\n📥 ${quality || '—'}\n💾 ${sizeTxt}`
    }, { quoted: m })

    // Limpieza
    setTimeout(() => {
      fsp.unlink(outPath).catch(() => {})
    }, 10_000)

  } catch (e) {
    console.error('YT DOC error:', e?.message || e)
    m.reply('❌ Ocurrió un error al procesar o descargar el video.')
  }
}


handler.command = ['ytvideo']

export default handler