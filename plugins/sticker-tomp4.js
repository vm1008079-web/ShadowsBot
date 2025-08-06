import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import fetch from 'node-fetch'
import { fileTypeFromBuffer } from 'file-type'

const tmp = path.join(process.cwd(), 'tmp')
if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)

// Conversión de webp a mp4 usando ffmpeg
async function webpToMp4(webpBuffer) {
    const tmpFile = path.join(tmp, `${Date.now()}.webp`)
    const outFile = tmpFile.replace('.webp', '.mp4')

    await fs.promises.writeFile(tmpFile, webpBuffer)

    await new Promise((resolve, reject) => {
        spawn('ffmpeg', [
            '-y',
            '-i', tmpFile,
            '-movflags', 'faststart',
            '-pix_fmt', 'yuv420p',
            outFile
        ])
            .on('error', reject)
            .on('close', code => code === 0 ? resolve() : reject(new Error('Error en ffmpeg')))
    })

    const mp4Buffer = await fs.promises.readFile(outFile)
    fs.unlinkSync(tmpFile)
    fs.unlinkSync(outFile)
    return mp4Buffer
}

// Conversión de audio a mp4 (con fondo de color)
async function audioToMp4(audioBuffer) {
    const tmpAudio = path.join(tmp, `${Date.now()}.mp3`)
    const tmpVideo = tmpAudio.replace('.mp3', '.mp4')

    await fs.promises.writeFile(tmpAudio, audioBuffer)

    await new Promise((resolve, reject) => {
        spawn('ffmpeg', [
            '-y',
            '-loop', '1',
            '-f', 'lavfi',
            '-i', 'color=size=512x512:color=black',
            '-i', tmpAudio,
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-shortest',
            tmpVideo
        ])
            .on('error', reject)
            .on('close', code => code === 0 ? resolve() : reject(new Error('Error en ffmpeg')))
    })

    const videoBuffer = await fs.promises.readFile(tmpVideo)
    fs.unlinkSync(tmpAudio)
    fs.unlinkSync(tmpVideo)
    return videoBuffer
}

const handler = async (m, { conn, usedPrefix, command }) => {
    if (!m.quoted) throw `📌 Responde a un *sticker* o *audio* para convertirlo en video`

    let mime = m.quoted.mimetype || ''
    if (!/webp|audio/.test(mime)) throw `❌ Solo stickers webp o audios son soportados`

    await m.react('🕒')
    let media = await m.quoted.download()
    let result

    if (/webp/.test(mime)) {
        result = await webpToMp4(media)
    } else if (/audio/.test(mime)) {
        result = await audioToMp4(media)
    }

    await conn.sendFile(m.chat, result, 'out.mp4', '✅ *Conversión completada*', m)
    await m.react('✅')
}

handler.help = ['tovideo']
handler.tags = ['sticker']
handler.command = ['tovideo', 'tomp4']
handler.register = true

export default handler