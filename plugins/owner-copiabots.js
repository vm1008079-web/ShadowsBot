/**
 * Comando: .copiabots
 * Autor: Ado-rgb
 * Repositorio: github.com/Ado-rgb
 * 🚫 No quitar créditos
 * 
 * Funcionalidad:
 * 📂 Envía todos los archivos dentro de ./JadiBots (incluyendo subcarpetas) sin comprimir
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

    // Función recursiva para obtener todos los archivos
    function obtenerArchivos(dir) {
      let resultados = []
      let lista = fs.readdirSync(dir)
      lista.forEach((archivo) => {
        let rutaCompleta = path.join(dir, archivo)
        let stat = fs.statSync(rutaCompleta)
        if (stat && stat.isDirectory()) {
          resultados = resultados.concat(obtenerArchivos(rutaCompleta))
        } else {
          resultados.push(rutaCompleta)
        }
      })
      return resultados
    }

    let archivos = obtenerArchivos(carpeta)

    if (!archivos.length) {
      return conn.sendMessage(m.chat, { text: '⚠️ La carpeta ./JadiBots está vacía', ...global.rcanal }, { quoted: m })
    }

    for (let ruta of archivos) {
      await conn.sendMessage(
        m.chat,
        {
          document: fs.readFileSync(ruta),
          fileName: path.relative(carpeta, ruta),
          mimetype: 'application/octet-stream',
          ...global.rcanal
        },
        { quoted: m }
      )
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