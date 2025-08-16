/**
 * Comando: .apk
 * Autor: Ado-rgb
 * Repositorio: github.com/Ado-rgb
 * 🚫 No quitar créditos
 */

import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  conn.apk = conn.apk || {}

  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `⚡ Ingresa el nombre de la aplicación que quieres buscar.\n\n📌 Ejemplo:\n${usedPrefix + command} Facebook Lite`
    }, { quoted: m })
  }

  if (!isNaN(text) && m.sender in conn.apk) {
    const idx = parseInt(text) - 1
    let dt = conn.apk[m.sender]

    if (dt.download) {
      return conn.sendMessage(m.chat, { text: "⏳ Ya estás descargando un archivo, espera a que termine para continuar." }, { quoted: m })
    }

    if (!dt.data[idx]) {
      return conn.sendMessage(m.chat, { text: "❌ El número que ingresaste no es válido. Por favor, selecciona uno de la lista." }, { quoted: m })
    }

    try {
      dt.download = true
      let data = await aptoide.download(dt.data[idx].id)
      let dl = await conn.getFile(data.link)

      await conn.sendMessage(m.chat, {
        document: dl.data,
        fileName: `${data.appname}.apk`,
        mimetype: 'application/vnd.android.package-archive',
        caption: `✅ *APK Descargado*\n\n📱 *Nombre:* ${data.appname}\n👨‍💻 *Desarrollador:* ${data.developer}\n📦 *Versión:* ${dt.data[idx].version}\n📊 *Tamaño:* ${(dt.data[idx].size / (1024 * 1024)).toFixed(2)} MB`
      }, { quoted: m })

    } catch (e) {
      console.error(e)
      conn.sendMessage(m.chat, { text: "❌ Ocurrió un error al descargar el APK. Intenta de nuevo más tarde." }, { quoted: m })
    } finally {
      dt.download = false
      if (dt.time) clearTimeout(dt.time)
      delete conn.apk[m.sender]
    }
    return
  }

  try {
    let results = await aptoide.search(text)
    if (!results.length) {
      return conn.sendMessage(m.chat, { text: "⚠️ No se encontraron resultados para tu búsqueda. Intenta con un nombre diferente." }, { quoted: m })
    }

    conn.apk[m.sender] = {
      data: results,
      download: false,
      time: setTimeout(() => delete conn.apk[m.sender], 10 * 60 * 1000)
    }

    const top5 = results.slice(0, 5)
    let msg = `🦞 Resultados para: *${text}*\n\nSelecciona un número para descargar:\n\n`

    top5.forEach((app, i) => {
      msg += `*${i + 1}.* ${app.name}\n`
      msg += `   ╰— Versión: ${app.version}\n`
      msg += `   ╰— Tamaño: ${(app.size / (1024 * 1024)).toFixed(2)} MB\n\n`
    })

    msg += `📦 Mostrando las ${top5.length} mejores de ${results.length} resultados.`

    await conn.sendMessage(m.chat, { text: msg }, { quoted: m })
  } catch (e) {
    console.error(e)
    conn.sendMessage(m.chat, { text: "❌ Ocurrió un error al buscar las aplicaciones. Intenta de nuevo más tarde." }, { quoted: m })
  }
}

handler.help = ["apk"]
handler.tags = ["downloader"]
handler.command = /^apk$/i
handler.register = false

export default handler

const aptoide = {
  search: async function (query) {
    let res = await fetch(`https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(query)}&limit=100`)
    res = await res.json()
    if (!res.datalist?.list?.length) return []

    return res.datalist.list.map((v) => ({
      name: v.name,
      size: v.size,
      version: v.file?.vername || "N/A",
      id: v.package,
      download: v.stats?.downloads || 0
    }))
  },

  download: async function (id) {
    let res = await fetch(`https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(id)}&limit=1`)
    res = await res.json()
    if (!res.datalist?.list?.length) throw new Error("App no encontrada")

    const app = res.datalist.list[0]
    return {
      img: app.icon,
      developer: app.store?.name || "Desconocido",
      appname: app.name,
      link: app.file?.path
    }
  }
}