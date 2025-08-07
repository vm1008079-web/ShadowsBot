/**
 * Comando: .copiabots
 * Autor: Ado-rgb
 * Repositorio: github.com/Ado-rgb
 * 🚫 No quitar créditos
 * 
 * Funcionalidad:
 * 📦 Comprime la carpeta ./JadiBots y la envía como un archivo ZIP
 */

import fs from 'fs'
import archiver from 'archiver'

let handler = async (m, { conn }) => {
  try {
    const carpeta = './JadiBots'

    if (!fs.existsSync(carpeta)) {
      return conn.sendMessage(m.chat, { text: '❌ No se encontró la carpeta ./JadiBots', ...global.rcanal }, { quoted: m })
    }

    await m.react('⏳')

    // Comprimir en memoria
    let buffer = await new Promise((resolve, reject) => {
      const chunks = []
      const archive = archiver('zip', { zlib: { level: 9 } })

      archive.on('data', chunk => chunks.push(chunk))
      archive.on('end', () => resolve(Buffer.concat(chunks)))
      archive.on('error', reject)

      archive.directory(carpeta, false)
      archive.finalize()
    })

    await conn.sendMessage(
      m.chat,
      {
        document: buffer,
        fileName: 'JadiBots.zip',
        mimetype: 'application/zip',
        ...global.rcanal
      },
      { quoted: m }
    )

    await m.react('✅')
  } catch (err) {
    console.error(err)
    await m.react('❌')
    conn.sendMessage(m.chat, { text: '❌ Error al comprimir o enviar la carpeta', ...global.rcanal }, { quoted: m })
  }
}

handler.help = ['copiabots']
handler.tags = ['owner']
handler.command = /^copiabots$/i
handler.rowner = true

export default handler