/**
 * Comando: .copiabots
 * Autor: Ado-rgb
 * Repositorio: github.com/Ado-rgb
 * 🚫 No quitar créditos
 * 
 * Funcionalidad:
 * 📦 Comprime la carpeta ./JadiBots usando el comando zip del sistema y la envía
 */

import { exec } from 'child_process'
import fs from 'fs'

let handler = async (m, { conn }) => {
  try {
    const carpeta = './JadiBots'
    const archivoZip = './JadiBots.zip'

    if (!fs.existsSync(carpeta)) {
      return conn.sendMessage(m.chat, { text: '❌ No se encontró la carpeta ./JadiBots', ...global.rcanal }, { quoted: m })
    }

    await m.react('⏳')

    // Comprimir usando el comando zip del sistema
    await new Promise((resolve, reject) => {
      exec(`zip -r ${archivoZip} JadiBots`, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    // Enviar el archivo ZIP
    await conn.sendMessage(
      m.chat,
      {
        document: fs.readFileSync(archivoZip),
        fileName: 'JadiBots.zip',
        mimetype: 'application/zip',
        ...global.rcanal
      },
      { quoted: m }
    )

    await m.react('✅')

    // Eliminar el archivo temporal
    fs.unlinkSync(archivoZip)

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