import fetch from "node-fetch"

const yt = {
    get baseUrl() {
        return { origin: 'https://ssvid.net' }
    },

    get baseHeaders() {
        return {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'origin': this.baseUrl.origin,
            'referer': this.baseUrl.origin + '/youtube-to-mp4'
        }
    },

    validateFormat(userFormat) {
        const validFormat = ['360p', '720p', '1080p']
        if (!validFormat.includes(userFormat)) throw Error(`Formato inválido!. Formatos disponibles: ${validFormat.join(', ')}`)
    },

    handleFormat(userFormat, searchJson) {
        this.validateFormat(userFormat)
        let result
        const allFormats = Object.entries(searchJson.links.mp4)
        const quality = allFormats.map(v => v[1].q).filter(v => /\d+p/.test(v)).map(v => parseInt(v)).sort((a, b) => b - a).map(v => v + 'p')

        let selectedFormat
        if (!quality.includes(userFormat)) {
            selectedFormat = quality[0]
            console.log(`formato ${userFormat} no existe. fallback a ${selectedFormat}`)
        } else {
            selectedFormat = userFormat
        }

        const find = allFormats.find(v => v[1].q == selectedFormat)
        result = find?.[1]?.k

        if (!result) throw Error(`${userFormat} no disponible`)
        return result
    },

    async hit(path, payload) {
        try {
            const body = new URLSearchParams(payload)
            const opts = { headers: this.baseHeaders, body, method: 'post' }
            const r = await fetch(`${this.baseUrl.origin}${path}`, opts)
            console.log('hit', path)
            if (!r.ok) throw Error(`${r.status} ${r.statusText}\n${await r.text()}`)
            return await r.json()
        } catch (e) {
            throw Error(`${path}\n${e.message}`)
        }
    },

    async download(queryOrYtUrl, userFormat = '360p') {
        this.validateFormat(userFormat)

        let search = await this.hit('/api/ajax/search', {
            "query": queryOrYtUrl,
            "cf_token": "",
            "vt": "youtube"
        })

        if (search.p == 'search') {
            if (!search?.items?.length) throw Error(`No encontré resultados para ${queryOrYtUrl}`)
            const { v, t } = search.items[0]
            const videoUrl = 'https://www.youtube.com/watch?v=' + v
            console.log(`[found]\ntitle : ${t}\nurl   : ${videoUrl}`)

            search = await this.hit('/api/ajax/search', {
                "query": videoUrl,
                "cf_token": "",
                "vt": "youtube"
            })
        }

        const vid = search.vid
        const k = this.handleFormat(userFormat, search)

        const convert = await this.hit('/api/ajax/convert', { k, vid })
        return convert
    }
}

let handler = async (m, { conn, args }) => {
    if (!args[0]) throw `Ingrese un enlace de YouTube`
    let format = args[1] || "360p"
    let res = await yt.download(args[0], format)
    if (!res || !res.url) throw `Error al descargar el video`

    await conn.sendMessage(m.chat, { video: { url: res.url }, mimetype: "video/mp4", caption: `✅ Aquí está tu video (${format})` }, { quoted: m })
}


handler.command = /^ytmp$/i

export default handler