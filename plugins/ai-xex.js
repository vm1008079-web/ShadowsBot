import fetch from 'node-fetch'

// ======== MOTOR ORIGINAL SIN CAMBIOS ========
const yt = {
    get url() {
        return {
            origin: 'https://convert.ytmp3.wf',
        }
    },

    get randomCookie() {
        const length = 26
        const charset = '0123456789abcdefghijklmnopqrstuvwxyz'
        const charsetArray = charset.split("")
        const pickRandom = (array) => array[Math.floor(Math.random() * array.length)]
        const result = Array.from({ length }, _ => pickRandom(charsetArray)).join("")
        return result
    },

    formatHandling(userFormat) {
        const validFormat = ['audio', 'best_video', '144p', '240p', '360p', '480p', '720p', '1080p', '1440p', '2160p']
        if (!validFormat.includes(userFormat)) throw Error(`invalid format!. available format: ${validFormat.join(', ')}`)
        let isVideo = false, quality = null
        if (userFormat != 'audio') {
            isVideo = true
            if (userFormat == 'best_video') {
                quality = '10000'
            } else {
                quality = userFormat.match(/\d+/)[0]
            }
        }
        return { isVideo, quality }
    },

    async download(youtubeUrl, userFormat = 'audio') {
        // format handling
        const f = this.formatHandling(userFormat)

        // path decision
        const pathButton = f.isVideo ? '/vidbutton/' : '/button/'
        const pathConvert = f.isVideo ? '/vidconvert/' : '/convert/'

        // generate random cookiie
        const cookie = `PHPSESSID=${this.randomCookie}`
        console.log('generate random cookie')

        // client hit mirip axios :v 
        const headers = {
            "accept-encoding": "gzip, deflate, br, zstd",
            "cookie": cookie,
            "referer": this.url.origin
        }
        const hit = async (method, path, body, returnType = 'text') => {
            try {
                const url = `${this.url.origin}${path}`
                const opts = { method, body, headers }
                const r = await fetch(url, opts)
                if (!r.ok) throw Error(`${r.status} ${r.statusText}\n${await r.text()}`)
                const res = returnType == "json" ? await r.json() : await r.text()
                return res
            } catch (e) {
                throw Error(`gagal hit ${path}. karena ${e.message}`)
            }
        }

        // first hit
        const html = await hit('get', `${pathButton}?url=${youtubeUrl}`)
        console.log(`button hit`)
        let m1 = html.match(/data: (.+?)\n\t\t\t\tsuccess/ms)?.[1].replace('},', '}').trim()
        if (f.isVideo) {
            m1 = m1.replace(`$('#height').val()`, f.quality)
        }
        const payload = eval("(" + m1 + ")")

        // second hit
        headers.referer = `${this.url.origin}${pathButton}?url=${youtubeUrl}`
        headers.origin = this.url.origin,
        headers["x-requested-with"] = "XMLHttpRequest"
        const j2 = await hit('post', pathConvert, new URLSearchParams(payload), 'json')
        console.log(`convert hit`)

        // progress checking
        let j3, fetchCount = 0
        const MAX_FETCH_ATTEMPT = 60

        do {
            fetchCount++
            j3 = await hit('get', `${pathConvert}?jobid=${j2.jobid}&time=${Date.now()}`, null, 'json')
            if (j3.dlurl) {
                return j3
            } else if (j3.error) {
                throw Error(`oops.. ada kesalahan nih raw jsonnya i have no idea. mungkin video gak di support.\n${JSON.stringify(j3, null, 2)}`)
            }
            let print
            if (/^Downloading audio data/.test(j3.retry)) {
                const match = j3.retry.match(/^(.+?)<(?:.+?)valuenow="(.+?)" /)
                print = `${match[1]} ${match[2]}%`
            } else {
                print = j3.retry.match(/^(.+?)</)?.[1] || `unknown status`
            }
            console.log(print)
            await new Promise(re => setTimeout(re, 3000))

        } while (fetchCount < MAX_FETCH_ATTEMPT)
        throw Error(`mencapai maksimal limit fetch`)
    }
}
// ======== FIN MOTOR ORIGINAL ========


// ======== PLUGIN .video ========
let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) throw `⚠️ Uso: ${usedPrefix + command} <url> [formato]\nEj: ${usedPrefix + command} https://youtu.be/ID 360p\nFormatos: audio,best_video,144p,240p,360p,480p,720p,1080p,1440p,2160p`

    const url = args[0]
    const format = (args[1] || '360p').toLowerCase()

    try {
        if (typeof m.react === 'function') await m.react('⏳').catch(() => {})

        const res = await yt.download(url, format)
        const title = res.title || 'video'
        const filename = (format === 'audio') ? `${title}.mp3` : `${title}.mp4`

        if (format === 'audio') {
            await conn.sendMessage(m.chat, {
                audio: { url: res.dlurl },
                mimetype: 'audio/mpeg',
                fileName: filename,
                caption: `✅ ${title}`
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, {
                video: { url: res.dlurl },
                fileName: filename,
                caption: `✅ ${title} (${format})`
            }, { quoted: m })
        }

        if (typeof m.react === 'function') await m.react('✅').catch(() => {})
    } catch (e) {
        if (typeof m.react === 'function') await m.react('❌').catch(() => {})
        await m.reply(`❌ ${e.message}`)
    }
}

handler.help = ['video <url> [formato]']
handler.tags = ['downloader']
handler.command = /^video$/i
export default handler
// ======== FIN PLUGIN ========