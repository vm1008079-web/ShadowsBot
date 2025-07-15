import fetch from 'node-fetch'
import { exec } from 'child_process'
import { promisify } from 'util'
import { tmpdir } from 'os'
import { join } from 'path'
import { writeFile, unlink } from 'fs/promises'

const execAsync = promisify(exec)

const handler = async (m, { conn, args, command }) => {
  const query = args.join(' ') || 'gatitos'
  const res = await fetch(`https://theadonix-api.vercel.app/api/pinvid?q=${encodeURIComponent(query)}`)
  const json = await res.json()

  if (!json?.videos?.length) return m.reply('❌ No se encontraron videos')

  const vid = json.videos[Math.floor(Math.random() * json.videos.length)]
  const m3u8Url = vid.video

  const outPath = join(tmpdir(), `pinterest_${Date.now()}.mp4`)

  try {
    await execAsync(`ffmpeg -i "${m3u8Url}" -c copy -bsf:a aac_adtstoasc "${outPath}"`)
    await conn.sendMessage(m.chat, {
      video: { url: outPath },
      caption: `🎬 *${vid.titulo || 'Video'}*\n👤 *${vid.autor}* (${vid.usuario})\n🔗 ${vid.fuente}`
    }, { quoted: m })
  } catch (err) {
    console.error(err)
    m.reply('❌ Error al convertir el video. Revisa si tu entorno tiene ffmpeg.')
  } finally {
    // Limpieza
    setTimeout(() => unlink(outPath).catch(() => {}), 15_000)
  }
}

handler.command = ['pintest', 'pinvid']
handler.help = ['pinvid']
handler.tags = ['downloader']

export default handler