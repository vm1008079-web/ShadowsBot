import axios from 'axios'
import cheerio from 'cheerio'

class WallpaperSearch {
    constructor() {
        this.base = 'https://wallpapersearch.com'
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
        }
    }

    async search(query) {
        if (!query) return '❌ Falta la palabra de búsqueda.'
        try {
            let { data } = await axios.get(`${this.base}/search/?q=${query}`, { headers: this.headers })
            const $ = cheerio.load(data)
            let res = []
            $('.wallpaper-item').each((i, e) => {
                res.push({
                    thumbnail: $(e).find('img').attr('src'),
                    title: $(e).find('.title').text().trim(),
                    url: $(e).find('a').attr('href')
                })
            })
            return res
        } catch (e) {
            return `❌ Error: ${e.message}`
        }
    }
}

let handler = async (m, { conn, args }) => {
    const wallpaper = new WallpaperSearch()
    const tipo = args[0]

    const fkontak = { 
        key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "0@s.whatsapp.net" },
        message: { contactMessage: { displayName: "🍿 Wallpaper Search", vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:🍿 Wallpaper Search\nTEL;TYPE=CELL:0000000000\nEND:VCARD" } } 
    }

    if (!tipo) {
        return conn.sendMessage(m.chat, `🌟 Comandos de Wallpaper Search 🌟

📌 Mostrar wallpapers por categoría:
• .wallpapersearch popular
• .wallpapersearch featured
• .wallpapersearch random
• .wallpapersearch collection

🔍 Buscar wallpaper:
• .wallpapersearch search naturaleza
• .wallpapersearch search autos

📥 Descargar wallpaper:
1. Busca o elige un enlace de los resultados.
2. Luego usa:
• .wallpapersearch dl [enlace]

💡 Nota: Se enviarán enlaces directos para descargar imágenes en alta calidad.`, { quoted: fkontak })
    }

    if (tipo === 'search') {
        if (!args[1]) return m.reply('❌ Escribe una palabra para buscar.\nEjemplo:\n.wallpapersearch search ocean')
        let query = args.slice(1).join(' ')
        let data = await wallpaper.search(query)
        if (typeof data === 'string') return m.reply(data)
        let resultados = data.slice(0, 5).map((item, i) => `*${i + 1}. ${item.title}*\n🔗 ${item.url}`).join('\n\n')
        return conn.sendMessage(m.chat, `🔎 *Resultados de búsqueda:* ${query}\n\n${resultados}\n\n📥 Para descargar usa:\n.wallpapersearch dl [enlace]`, { quoted: fkontak })
    }

    if (tipo === 'dl') {
        if (!args[1]) return m.reply('❌ Envía un enlace válido.\nEjemplo:\n.wallpapersearch dl https://wallpapersearch.com/...')
        let url = args[1]
        let { data } = await axios.get(url, { headers: wallpaper.headers })
        const $ = cheerio.load(data)
        const main = $('.main-image img')
        const title = $('h1.title').text().trim()
        const thumbnail = $(main).attr('src')
        let msg = `✅ *${title}*\n\n🖼 Vista previa:\n${thumbnail}`
        return conn.sendMessage(m.chat, msg, { quoted: fkontak })
    }

    return m.reply('❌ Comando desconocido. Envía `.wallpapersearch` para ver el uso.')
}

handler.help = ['wallpapersearch']
handler.tags = ['search']
handler.command = ['wallpapersearch']

export default handler