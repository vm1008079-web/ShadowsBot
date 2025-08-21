import fetch from 'node-fetch'

const keepv = {
    tools: {
        generateHex: (length = 10, config = { prefix: "" }) => {
            const charSet = "0123456789abcdef"
            const charSetArr = charSet.split("")
            const getRandom = (array) => array[Math.floor(Math.random() * array.length)]
            const randomString = Array.from({ length }, _ => getRandom(charSetArr)).join("")
            return config.prefix + randomString
        },
        generateTokenValidTo: () => (Date.now() + (1000 * 60 * 20)).toString().substring(0, 10),
        mintaJson: async (description, url, options) => {
            try {
                const response = await fetch(url, options)
                if (!response.ok) throw Error(`${response.status} ${response.statusText}\n${await response.text() || '(empty content)'}`)
                const json = await response.json()
                return json
            } catch (err) {
                throw Error(`gagal mintaJson ${description} -> ${err.message}`)
            }
        },
        validateString: (description, theVariable) => {
            if (typeof (theVariable) !== "string" || theVariable?.trim()?.length === 0) {
                throw Error(`variabel ${description} harus string dan gak boleh kosong`)
            }
        },
        delay: async (ms) => new Promise(re => setTimeout(re, ms)),
        handleFormat: (desireFormat) => {
            const validParam = ["audio", "240p", "360p", "480p", "720p", "1080p", "best_video"]
            if (!validParam.includes(desireFormat)) throw Error(`${desireFormat} is invalid format. just pick one of these: ${validParam.join(", ")}`)
            let result
            result = desireFormat.match(/^(\d+)p/)?.[1]
            if (!result) {
                desireFormat === validParam[0] ? result = desireFormat : result = "10000"
            }
            return result
        }
    },
    konstanta: {
        origin: "https://keepv.id",
        baseHeaders: {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
    },
    async getCookieAndRedirectUrl(origin, baseHeaders){
        const r = await fetch(origin, { headers: baseHeaders })
        if(!r.ok) throw Error(`${r.status} ${r.statusText}\n${await r.text() || '(empty response)'}`)
        const cookies = r.headers.get('set-cookie')?.split(';')?.[0]
        if(!cookies) throw Error('cookie gak ada >:o')
        return { cookie: cookies, urlRedirect: r.url }
    },
    async validateCookie(resultGetCookieAndRedirectUrl, origin, youtubeUrl, baseHeaders, format){
        const { cookie, urlRedirect } = resultGetCookieAndRedirectUrl
        const pathname = format==="audio"?"button":"vidbutton"
        const url = `${origin}/${pathname}/?url=${youtubeUrl}`
        const r = await fetch(url,{headers:{cookie,referer:urlRedirect,...baseHeaders}})
        if(!r.ok) throw Error(`${r.status} ${r.statusText}\n${await r.text() || '(kosong :v)'}`)
        return { cookie, referer: url }
    },
    async convert(resultValidateCookie, origin, youtubeUrl, baseHeaders, format){
        const { cookie, referer } = resultValidateCookie
        const headers = { "content-type": "application/x-www-form-urlencoded; charset=UTF-8", cookie, referer, origin, "x-requested-with": "XMLHttpRequest", ...baseHeaders }
        delete headers["upgrade-insecure-requests"]
        const payload = { url: youtubeUrl, convert: "gogogo", token_id: this.tools.generateHex(64,{prefix:"t_"}), token_validto: this.tools.generateTokenValidTo() }
        if(format!=="audio") payload.height = format
        const body = new URLSearchParams(payload)
        const pathname = format==="audio"?"convert":"vidconvert"
        const url = `${origin}/${pathname}/`
        const result = await this.tools.mintaJson('convert', url, { headers, body, method: 'POST' })
        if(result.error) throw Error(`gagal convert karena error server \n${result.error}`)
        if(!result.jobid) throw Error('job id kosong >:o')
        return result
    },
    async checkJob(resultValidateCookie,resultConvert,origin,baseHeaders,format,identifier){
        const { cookie, referer } = resultValidateCookie
        const { jobid } = resultConvert
        const usp = new URLSearchParams({ jobid, time: Date.now() })
        const pathname = format==="audio"?"convert":"vidconvert"
        const url = new URL(`${origin}/${pathname}/`)
        url.search = usp
        let data={},attempt=0
        while(attempt<60){
            attempt++
            const r = await fetch(url,{headers:{cookie,referer,"x-requested-with":"XMLHttpRequest",...baseHeaders}})
            data = await r.json()
            if(data.dlurl) return data
            if(data.error) throw Error(`error checkJob ${JSON.stringify(data)}`)
            console.log(`${identifier} check job... ${data.retry || "esperando..."}`)
            await this.tools.delay(5000)
        }
        throw Error('max fetch attempts alcanzado')
    },
    async download(youtubeUrl,userFormat="audio",owner=""){
        this.tools.validateString("youtubeUrl",youtubeUrl)
        const format = this.tools.handleFormat(userFormat)
        const identifier = this.tools.generateHex(4,{prefix:owner?`${owner}-`:owner})
        const origin = this.konstanta.origin
        const headers = this.konstanta.baseHeaders
        const gcookie = await this.getCookieAndRedirectUrl(origin,headers)
        const vcookie = await this.validateCookie(gcookie,origin,youtubeUrl,headers,format)
        const convertData = await this.convert(vcookie,origin,youtubeUrl,headers,format)
        const result = await this.checkJob(vcookie,convertData,origin,headers,format,identifier)
        return {...result, identifier, type: userFormat==="audio"?"audio":"video"}
    },
    async search(search,userFormat="audio",owner=""){
        this.tools.validateString("search",search)
        const format = this.tools.handleFormat(userFormat)
        const r = await fetch("https://keepv.id/62/",{body:new URLSearchParams({search}),method:'POST'})
        const json = await r.json()
        const videoId = json?.[1]?.videoId
        if(!videoId) throw Error('gagal mendapatkan video id')
        return await this.download(`https://www.youtube.com/watch?v=${videoId}`,userFormat,owner)
    }
}

// Plugin WhatsApp
let handler = async (m,{conn,args,usedPrefix,command})=>{
    try{
        if(!args[0]) return m.reply(`⚠️ Uso: ${usedPrefix}${command} <url o keyword>\nEj: ${usedPrefix}${command} blink 182 i miss you`)
        const query = args.join(' ')
        m.reply(`⌛ Buscando video: "${query}" ...`)
        const data = await keepv.search(query,"360p","botuser")
        if(!data.dlurl) throw Error("No se obtuvo dlurl")
        const buffer = await (await fetch(data.dlurl)).arrayBuffer()
        await conn.sendMessage(m.chat,{video:{buffer:Buffer.from(buffer)},caption:`🎬 Video: ${query}\nCalidad: 360p`,mimetype:'video/mp4',fileName:`${query.replace(/[^A-Za-z0-9 ]/g,'').replace(/ +/g,'_')}.mp4`},{quoted:m})
    }catch(e){
        console.log(e)
        m.reply(`🚨 Error al procesar video: ${e.message}`)
    }
}

handler.help = ['video <url o keyword>']
handler.tags = ['descarga','youtube']
handler.command = ['video','vid']

export default handler