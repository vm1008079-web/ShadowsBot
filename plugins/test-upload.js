import fs from 'fs'
import path from 'path'
import quAx from '../lib/upload.js'

const handler = async (m, { conn }) => {
  if (!m.quoted) return conn.reply(m.chat, 'Responde a un archivo para testear subida', m)
  if (!m.quoted.download) return conn.reply(m.chat, 'Mensaje no tiene función de descarga', m)

  try {
    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

    const inputPath = path.join(tmpDir, `${Date.now()}_testfile`)
    const stream = await m.quoted.download()
    const fileStream = fs.createWriteStream(inputPath)

    for await (const chunk of stream) fileStream.write(chunk)
    fileStream.end()

    const res = await quAx(inputPath)
    await conn.reply(m.chat, `Respuesta upload: ${JSON.stringify(res)}`, m)

    fs.unlinkSync(inputPath)
  } catch (e) {
    await conn.reply(m.chat, `Error al subir: ${e.message}`, m)
  }
}

handler.command = /^testupload$/i
handler.tags = ['tools']
handler.help = ['testupload']
export default handler