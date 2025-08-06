import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

// Carpeta temporal
const tmpDir = path.join('./tmp')
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

// Ejecutar ffmpeg
function ffmpegRun(args) {
    return new Promise((resolve, reject) => {
        const ff = spawn('ffmpeg', args)
        ff.on('error', reject)
        ff.on('close', code => {
            if (code === 0) resolve()
            else reject(new Error(`FFmpeg cerró con código ${code}`))
        })
    })
}

// WebP → MP4
async function webpToMp4(webpBuffer) {
    const inPath = path.join(tmpDir, `${Date.now()}.webp`)
    const outPath = path.join(tmpDir, `${Date.now()}.mp4`)

    await fs.promises.writeFile(inPath, webpBuffer)

    await ffmpegRun([
        '-y',
        '-i', inPath,
        '-vf', 'scale=512:512:force_original_aspect_ratio=decrease',
        '-pix_fmt', 'yuv420p',
        outPath
    ])

    const buffer = await fs.promises.readFile(outPath)
    fs.unlinkSync(inPath)
    fs.unlinkSync(outPath)
    return buffer
}

// Audio → MP4 con fondo negro
async function audioToMp4(audioBuffer) {
    const inPath = path.join(tmpDir, `${Date.now()}.ogg`)
    const outPath = path.join(tmpDir, `${Date.now()}.mp4`)

    await fs.promises.writeFile(inPath, audioBuffer)

    await ffmpegRun([
        '-y',
        '-loop', '1',
        '-f', 'lavfi',
        '-i', 'color=size=512x512:color=black',
        '-i', inPath,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-shortest',
        outPath
    ])

    const buffer = await fs.promises.readFile(outPath)
    fs.unlinkSync(inPath)
    fs.unlinkSync(outPath)
    return buffer
}

const handler = async (m, { conn, usedPrefix, command }) => {
    if (!m.quoted) throw `📌 Responde a un *sticker* o *audio* para convertirlo en video\nEjemplo: ${usedPrefix + command}`

    const mime = m.quoted.mimetype || ''
    if (!/webp|audio/.test(mime)) throw `❌ Solo stickers (webp) o audios son soportados`

    await m.react('🕒')
    const media = await m.quoted.download()

    let result
    if (/webp/.test(mime)) {
        result = await webpToMp4(media)
    } else if (/audio/.test(mime)) {
        result = await audioToMp4(media)
    }

    await conn.sendFile(m.chat, result, 'out.mp4', '✅ *Conversión completada*', m)
    await m.react('✅')
}

handler.help = ['tovideo', 'tomp4']
handler.tags = ['sticker']
handler.command = ['tovideo', 'tomp4']

export default handler