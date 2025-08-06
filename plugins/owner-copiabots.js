/**
 * Comando: .copiabots
 * Autor: Ado-rgb
 * Repositorio: github.com/Ado-rgb
 * 🚫 No quitar créditos
 * 
 * Funcionalidad:
 * 📂 Envía todos los archivos de la carpeta ./JadiBots sin comprimir
 */

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
  try {
    const carpeta = './JadiBots'

    if (!fs.existsSync(carpeta)) {
      return conn.sendMessage(m.chat, { text: '❌ No se encontró la carpeta ./JadiBots', ...global.rcanal }, { quoted: m })
    }

    await m.react('⏳')

    const archivos = fs.readdirSync(carpeta)

    if (!archivos.length) {
      return conn.sendMessage(m.chat, { text: '⚠️ La carpeta ./JadiBots está vacía', ...global.rcanal }, { quoted: m })
    }

    for (let archivo of archivos) {
      let ruta = path.join(carpeta, archivo)
      if (fs.lstatSync(ruta).isFile()) {
        await conn.sendMessage(
          m.chat,
          {
            document: fs.readFileSync(ruta),
            fileName: archivo,
            mimetype: 'application/octet-stream',
            ...global.rcanal
          },
          { quoted: m }
        )
      }
    }

    await m.react('✅')
  } catch (err) {
    console.error(err)
    await m.react('❌')
    conn.sendMessage(m.chat, { text: '❌ Error al enviar los archivos de ./JadiBots', ...global.rcanal }, { quoted: m })
  }
}

handler.help = ['copiabots']
handler.tags = ['owner']
handler.command = /^copiabots$/i
handler.rowner = true

export default handler