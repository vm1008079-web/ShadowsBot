import fetch from 'node-fetch'

const yt = {
    get url() {
        return { origin: 'https://convert.ytmp3.wf' }
    },

    get randomCookie() {
        const length = 26
        const charset = '0123456789abcdefghijklmnopqrstuvwxyz'
        return Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join("")
    },

    formatHandling(userFormat) {
        const validFormat = ['audio', 'best_video', '144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p']
        if (!validFormat.includes(userFormat)) throw Error(`Formato inválido! Usa: ${validFormat.join(', ')}`)
        let isVideo = false, quality = null
        if (userFormat != 'audio') {
            isVideo = true
            quality = userFormat == 'best_video' ? '10000' : userFormat.match(/\d+/)[0]
        }
        return { isVideo, quality }
    },

    async download(youtubeUrl, userFormat = '360p') {
        const f = this.formatHandling(userFormat)
        const pathButton = f.isVideo ? '/vidbutton/' : '/button/'
        const pathConvert = f.isVideo ? '/vidconvert/' : '/convert/'
        const cookie = `PHPSESSID=${this.randomCookie}`

        const headers = {
            "accept-encoding": "gzip, deflate, br, zstd",
            "cookie": cookie,
            "referer": this.url.origin
        }

        const hit = async (method, path, body, returnType = 'text') => {
            const url = `${this.url.origin}${path}`
            const opts = { method, body, headers }
            const r = await fetch(url, opts)
            if (!r.ok) throw Error(`${r.status} ${r.statusText}\n${await r.text()}`)
            return returnType == "json" ? await r.json() : await r.text()
        }

        // 1st request
        const html = await hit('get', `${pathButton}?url=${youtubeUrl}`)
        let m1 = html.match(/data: (.+?)\n\t\t\t\tsuccess/ms)?.[1].replace('},', '}').trim()
        if (f.isVideo) m1 = m1.replace(`$('#height').val()`, f.quality)
        const payload = eval("(" + m1 + ")")

        // 2nd request
        headers.referer = `${this.url.origin}${pathButton}?url=${youtubeUrl}`
        headers.origin = this.url.origin
        headers["x-requested-with"] = "XMLHttpRequest"
        const j2 = await hit('post', pathConvert, new URLSearchParams(payload), 'json')

        // Progress
        let j3, fetchCount = 0
        const MAX_FETCH_ATTEMPT = 60
        do {
            fetchCount++
            j3 = await hit('get', `${pathConvert}?jobid=${j2.jobid}&time=${Date.now()}`, null, 'json')
            if (j3.dlurl) return j3
            if (j3.error) throw Error(`Error: ${JSON.stringify(j3, null, 2)}`)
            await new Promise(re => setTimeout(re, 3000))
        } while (fetchCount < MAX_FETCH_ATTEMPT)

        throw Error(`Tiempo de espera alcanzado`)
    }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) throw `⚠️ Uso: ${usedPrefix + command} <enlace de YouTube>`
    try {
        m.react('⏳')
        let res = await yt.download(args[0], '360p')
        let title = res.title || "video"
        await conn.sendMessage(m.chat, { video: { url: res.dlurl }, fileName: `${title}.mp4`, caption: `✅ Aquí está tu video:\n${title}` }, { quoted: m })
        m.react('✅')
    } catch (e) {
        m.reply(`❌ Error: ${e.message}`)
    }
}
handler.command = /^video$/i
export default handler