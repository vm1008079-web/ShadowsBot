import fs from 'fs'

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid
  if (!msg.message) return // no hay mensaje
  const text = msg.message.conversation || msg.message?.extendedTextMessage?.text
  if (!text) return

  const removeEmojis = text =>
    text.replace(/[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')

  const normalizeText = text => removeEmojis(text).toLowerCase().trim()
  const searchKey = normalizeText(text)

  if (!searchKey) return

  if (!fs.existsSync('./guar.json')) return

  let guarData = JSON.parse(fs.readFileSync('./guar.json', 'utf-8'))
  const keys = Object.keys(guarData)
  const foundKey = keys.find(key => normalizeText(key) === searchKey)
  if (!foundKey) return

  const storedMedia = guarData[foundKey]
  const mediaBuffer = Buffer.from(storedMedia.buffer, 'base64')

  let messageOptions = { mimetype: storedMedia.mimetype }

  if (storedMedia.mimetype.startsWith('image') && storedMedia.extension !== 'webp') {
    messageOptions.image = mediaBuffer
  } else if (storedMedia.mimetype.startsWith('video')) {
    messageOptions.video = mediaBuffer
  } else if (storedMedia.mimetype.startsWith('audio')) {
    messageOptions.audio = mediaBuffer
  } else if (storedMedia.mimetype.startsWith('application')) {
    messageOptions.document = mediaBuffer
    messageOptions.fileName = `Archivo.${storedMedia.extension}`
  } else if (
    storedMedia.mimetype === 'image/webp' ||
    storedMedia.extension === 'webp'
  ) {
    messageOptions.sticker = mediaBuffer
  } else {
    return
  }

  await conn.sendMessage(chatId, messageOptions, { quoted: msg })
}


handler.all = true 
export default handler