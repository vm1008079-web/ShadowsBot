
import fs from "fs"
import path from "path"
import crypto from "crypto"

const yt = {
  get baseUrl() {
    return { origin: "https://v1.yt1s.biz" }
  },
  get baseHeaders() {
    return {
      "accept": "application/json, text/plain, */*",
      "accept-encoding": "gzip, deflate, br, zstd",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      "origin": this.baseUrl.origin
    }
  },
  validateString(string) {
    if (typeof string !== "string" || !string?.trim()?.length) throw Error(`❌ La búsqueda no puede estar vacía.`)
  },
  handleFormat(userFormat) {
    const validFormat = ["64kbps","96kbps","128kbps","256kbps","320kbps","144p","240p","360p","480p","720p","1080p"]
    if (!validFormat.includes(userFormat)) throw Error(`⚠️ Formato inválido.\nElige: ${validFormat.join(", ")}`)
    const path = /p$/.test(userFormat) ? "/video" : "/audio"
    const quality = userFormat.match(/\d+/)[0]
    return { path, quality }
  },
  async hit(description, url, opts, returnType = "text") {
    try {
      const r = await fetch(url, opts)
      if (!r.ok) throw Error(`${r.status} ${r.statusText} ${await r.text() || "empty response"}`)
      let data
      if (returnType == "json") {
        data = await r.json()
      } else if (returnType == "text") {
        data = await r.text()
      } else throw Error("invalid return type")
      return { data, headers: r.headers }
    } catch (e) {
      throw Error(`❌ Error en request (${description}): ${e.message}`)
    }
  },
  async search(query) {
    this.validateString(query)
    const api = new URL("https://me0xn4hy3i.execute-api.us-east-1.amazonaws.com/staging/api/resolve/resolveYoutubeSearch")
    api.search = new URLSearchParams({ search: query })
    const { data: json } = await this.hit("search", api, null, "json")
    return json
  },
  async getSessionToken() {
    const headers = this.baseHeaders
    const api = "https://fast.dlsrv.online/"
    const { headers: h } = await this.hit("get session", api, { headers })
    const result = h.get("x-session-token")
    if (!result) throw Error("⚠️ No se pudo obtener session token.")
    return result
  },
  pow(session, path, startNonce = 0) {
    let nonce = startNonce
    let powHash = ""
    while (true) {
      const data = `${session}:${path}:${nonce}`
      powHash = crypto.createHash("SHA256").update(data).digest("hex")
      if (powHash.startsWith("0000")) {
        return { nonce: nonce.toString(), powHash }
      }
      nonce++
    }
  },
  apiSignature(session, path, timestamp) {
    const dataToSign = `${session}:${path}:${timestamp}`
    const secretKey = "a8d4e2456d59b90c8402fc4f060982aa"
    return crypto.createHmac("SHA256", secretKey).update(dataToSign).digest("hex")
  },
  async download(videoId, userFormat = "360p") {
    const { path, quality } = this.handleFormat(userFormat)
    const sessionToken = await this.getSessionToken()
    const timestamp = Date.now().toString()
    const signature = this.apiSignature(sessionToken, path, timestamp)
    const { nonce, powHash } = this.pow(sessionToken, path)

    const headers = {
      "content-type": "application/json",
      "x-api-auth": "Ig9CxOQPYu3RB7GC21sOcgRPy4uyxFKTx54bFDu07G3eAMkrdVqXY9bBatu4WqTpkADrQ",
      "x-session-token": sessionToken,
      "x-signature": signature,
      "x-signature-timestamp": timestamp,
      "nonce": nonce,
      "powhash": powHash,
      ...this.baseHeaders
    }
    const api = `https://fast.dlsrv.online/gateway/${path}`
    const body = JSON.stringify({ videoId, quality })
    const { data: result } = await this.hit("download", api, { headers, body, method: "post" }, "json")
    return result
  },
  async searchAndDownload(query, userFormat = "360p") {
    this.validateString(query)
    this.handleFormat(userFormat)
    const searchResult = await this.search(query)
    const { videoId, title } = searchResult?.data?.[0]
    if (!videoId) throw Error("❌ No se encontró el video.")
    const result = await this.download(videoId, userFormat)
    return { ...result, title }
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ Usa: *${usedPrefix + command}* nombre del video\n\nEjemplo: ${usedPrefix + command} Alan Walker Faded`)
  
  try {
    m.react("📹")
    const result = await yt.searchAndDownload(text, "360p")

    if (!result?.url) return m.reply("❌ No se pudo descargar el video.")
    let videoUrl = result.url
    let title = result.title || "video"

    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      mimetype: "video/mp4",
      fileName: `${title}.mp4`,
      caption: `🎬 ${title}`
    }, { quoted: m })
  } catch (e) {
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.help = ["video <texto>"]
handler.tags = ["downloader"]
handler.command = ["video"]

export default handler