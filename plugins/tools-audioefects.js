import { unlinkSync, readFileSync } from 'fs'
import { join } from 'path'
import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)

const handler = async (m, { conn, __dirname, usedPrefix, command }) => {
  try {
    const q = m.quoted || m
    const mime = (q.mimetype || '')

    if (!/audio/.test(mime)) {
      throw `🎧 Responde a un audio para aplicar el efecto.\n📌 Ej: *${usedPrefix + command}*`
    }

    const effect = getEffect(command)
    if (!effect) throw `❌ Efecto no reconocido.`

    const inputFile = await q.download(true)
    const outputFile = join(__dirname, '../tmp/', `${Date.now()}.mp3`)

    const cmd = `ffmpeg -i "${inputFile}" ${effect} -vn -acodec libmp3lame -b:a 128k "${outputFile}"`
    await execPromise(cmd)

    const duration = await getAudioDuration(outputFile)
    const buffer = readFileSync(outputFile)

    await conn.sendFile(m.chat, buffer, 'efecto.mp3', null, m, true, {
      type: 'audioMessage',
      ptt: duration <= 60 // nota de voz si dura poco
    })

    unlinkSync(inputFile)
    unlinkSync(outputFile)

  } catch (e) {
    console.error(e)
    throw typeof e === 'string' ? e : '⚠️ Error procesando el audio.'
  }
}

handler.help = ['bass', 'robot', 'earrape', 'nightcore', 'slow', 'deep'].map(v => v + ' [vn]')
handler.tags = ['audio']
handler.command = /^(bass|robot|earrape|nightcore|slow|deep)$/i
export default handler

function getEffect(cmd) {
  switch (cmd.toLowerCase()) {
    case 'bass': return '-af "equalizer=f=54:width_type=o:width=2:g=45"'
    case 'robot': return '-af "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"'
    case 'earrape': return '-af "volume=12"'
    case 'nightcore': return '-af "atempo=1.06,asetrate=44100*1.25"'
    case 'slow': return '-af "atempo=0.7,asetrate=44100"'
    case 'deep': return '-af "atempo=4/4,asetrate=44500*2/3"'
    default: return ''
  }
}

async function getAudioDuration(file) {
  try {
    const { stdout } = await execPromise(`ffprobe -i "${file}" -show_entries format=duration -v quiet -of csv="p=0"`)
    return parseFloat(stdout.trim())
  } catch {
    return 0
  }
}