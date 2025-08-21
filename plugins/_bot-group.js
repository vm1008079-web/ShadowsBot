import axios from 'axios'

const keepv = {
    tools: {
        generateHex: (length = 10, config = { prefix: "" }) => {
            const charSet = "0123456789abcdef"
            const getRandom = (array) => array[Math.floor(Math.random() * array.length)]
            return config.prefix + Array.from({ length }, _ => getRandom(charSet.split(""))).join("")
        },
        generateTokenValidTo: () => (Date.now() + (1000*60*20)).toString().substring(0,10),
        mintaJson: async (desc,url,options) => {
            try { const r = await axios({...options,url}); return r.data } 
            catch(e){ throw new Error(`gagal mintaJson ${desc} -> ${e.message}`)}
        },
        validateString:(desc,v)=>{if(typeof v!=='string'||!v.trim())throw new Error(`${desc} debe ser string y no vacio`)},
        delay: async ms => new Promise(r=>setTimeout(r,ms)),
        handleFormat: f=>{ const valid=["audio","240p","360p","480p","720p","1080p","best_video"]; if(!valid.includes(f)) throw Error(`Formato invalido ${f}`); let r=f.match(/^(\d+)p/)?.[1]; return r?r:(f==="audio"?"audio":"10000") }
    },
    konstanta: {
        origin: "https://keepv.id",
        baseHeaders: {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
    },
    async getCookieAndRedirectUrl(origin, baseHeaders){
        const r = await axios.get(origin,{headers:baseHeaders}); 
        const cookie = r.headers['set-cookie']?.[0]?.split(";")?.[0];
        if(!cookie)throw Error("No cookie encontrado"); 
        return { cookie, urlRedirect: r.request.res.responseUrl }
    },
    async validateCookie({cookie,urlRedirect},origin,youtubeUrl,baseHeaders,format){
        const pathname=format==="audio"?"button":"vidbutton"
        const r=await axios.get(`${origin}/${pathname}/?url=${youtubeUrl}`,{headers:{cookie,referer:urlRedirect,...baseHeaders}}); 
        return { cookie, referer:`${origin}/${pathname}/?url=${youtubeUrl}` }
    },
    async convert({cookie,referer},origin,youtubeUrl,baseHeaders,format){
        const payload={url:youtubeUrl,convert:"gogogo",token_id:this.tools.generateHex(64,{prefix:"t_"}),token_validto:this.tools.generateTokenValidTo()}
        if(format!=="audio")payload.height=format
        const pathname=format==="audio"?"convert":"vidconvert"
        const r=await axios.post(`${origin}/${pathname}/`, new URLSearchParams(payload), {headers:{cookie,referer,origin,"x-requested-with":"XMLHttpRequest",...baseHeaders}});
        if(!r.data.jobid)throw Error("Job id vacio"); return r.data
    },
    async checkJob(resultValidateCookie,resultConvert,origin,baseHeaders,format,identifier){
        const {cookie,referer}=resultValidateCookie
        const {jobid}=resultConvert
        const url=new URL(`${origin}/${format==="audio"?"convert":"vidconvert"}/`); url.search=new URLSearchParams({jobid,time:Date.now()})
        let data={},attempt=0
        while(attempt<60){
            attempt++
            data=(await axios.get(url.toString(),{headers:{cookie,referer,"x-requested-with":"XMLHttpRequest",...baseHeaders}})).data
            if(data.dlurl)return data
            if(data.error)throw Error(`Error keepv ${JSON.stringify(data)}`)
            console.log(`${identifier} check job... ${data.retry||"esperando..."}`)
            await this.tools.delay(5000)
        }
        throw Error("Max fetch attempt alcanzado")
    },
    async download(youtubeUrl,userFormat="audio",owner=""){
        this.tools.validateString("youtubeUrl",youtubeUrl)
        const format=this.tools.handleFormat(userFormat)
        const identifier=this.tools.generateHex(4,{prefix:owner?`${owner}-`:owner})
        const origin=this.konstanta.origin,headers=this.konstanta.baseHeaders
        const gcookie=await this.getCookieAndRedirectUrl(origin,headers)
        const vcookie=await this.validateCookie(gcookie,origin,youtubeUrl,headers,format)
        const convertData=await this.convert(vcookie,origin,youtubeUrl,headers,format)
        return await this.checkJob(vcookie,convertData,origin,headers,format,identifier)
    },
    async search(query,userFormat="audio",owner=""){
        this.tools.validateString("query",query)
        const r=await axios.post("https://keepv.id/62/",new URLSearchParams({search:query}))
        const videoId=r.data?.[1]?.videoId; if(!videoId)throw Error("No se obtuvo videoId")
        return await this.download(`https://www.youtube.com/watch?v=${videoId}`,userFormat,owner)
    }
}

const xbuddyPlugin = async (urlOrKeyword, chosenFormat="360p")=>{
    // aca iria tu código xbuddy adaptado a axios
    // por simplicidad podemos priorizar keepv si funciona, si no xbuddy
    try {
        return await keepv.search(urlOrKeyword,chosenFormat,"botuser")
    } catch(e){
        console.log("keepv fallo, intentar xbuddy fallback..."); 
        // aquí deberías poner la lógica de xbuddy adaptada a axios
        throw e
    }
}

// Plugin WhatsApp
let handler = async (m,{conn,args,usedPrefix,command})=>{
    try{
        if(!args[0])return m.reply(`⚠️ Uso: ${usedPrefix}${command} <URL o keyword>\nEj: ${usedPrefix}${command} blink 182 i miss you`);
        const query=args.join(" ")
        m.reply(`⌛ Buscando video: "${query}" ...`)

        const data=await xbuddyPlugin(query,"360p")
        if(!data.dlurl)throw Error("No se pudo obtener URL de descarga")

        const buffer=(await axios.get(data.dlurl,{responseType:'arraybuffer'})).data
        await conn.sendMessage(m.chat,{video:{buffer:Buffer.from(buffer)},caption:`🎬 Video: ${query}\nCalidad: 360p`,mimetype:'video/mp4',fileName:`${query.replace(/[^A-Za-z0-9 ]/g,'').replace(/ +/g,'_')}.mp4`},{quoted:m})

    }catch(e){
        console.log(e)
        m.reply(`🚨 Error al procesar video: ${e.message}`)
    }
}

handler.help=['video <url o keyword>']
handler.tags=['descarga','youtube']
handler.command=['video','vid']

export default handler