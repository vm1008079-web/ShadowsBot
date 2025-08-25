import axios from 'axios'
import cheerio from 'cheerio'
import qs from 'querystring'

// ========================= //
// Configuración
// ========================= //
const BASE = 'https://www-y2mate.com'
const LOCALE_PATH = '/id20'
const ANALYZE = '/mates/analyzeV2/ajax'
const CONVERT = '/mates/convertV2/index'
const BRAND_FOOTER = 'Hatsune Miku MD v13 by alfat.syah'

const client = axios.create({
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'User-Agent': process.env.Y2MATE_UA || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Origin': BASE,
    'Referer': `${BASE}${LOCALE_PATH}/`
  },
  timeout: 30000,
  validateStatus: s => s >= 200 && s < 300
})

// Bypass opcional de Cloudflare
client.interceptors.request.use(cfg => {
  const cookies = []
  if (process.env.CF_CLEARANCE) cookies.push(`cf_clearance=${process.env.CF_CLEARANCE}`)
  if (cookies.length) cfg.headers.Cookie = cookies.join('; ')
  return cfg
})

const rand = arr => arr[Math.floor(Math.random() * arr.length)]
const REACTS = ['⏳','🕒','⚙️','🔁','🔄','📦','📥','🛠️']

// ========================= //
// Funciones principales
// ========================= //
async function y2mateAnalizar(url, lang = 'id') {
  const data = { k_query: url, k_page: 'home', q_auto: 0, hl: lang }
  const { data: res } = await client.post(ANALYZE, qs.stringify(data))
  if (!res || res.status !== 'ok' || !res.result) throw new Error('Error al analizar la URL')
  return res.result
}

function parsearResultadoAnalisis(html) {
  const $ = cheerio.load(html)
  const title = ($('div.thumbnail .caption > b').text() || $('b:contains("Title")').text() || $('h1,h2,h3').first().text()).trim()
  const thumb = $('div.thumbnail img').attr('src') || $('img').first().attr('src') || null

  const pickList = []
  const scan = (selector, ftype) => {
    $(selector).find('a, button').each((_, el) => {
      const dataVid = $(el).attr('data-vid')
      const dataQ = $(el).attr('data-fquality') || $(el).attr('data-quality')
      const dataK = $(el).attr('data-k') || $(el).attr('data-kt')
      const dataF = $(el).attr('data-ftype') || ftype
      if (dataVid && dataQ) pickList.push({ vid: dataVid, ftype: dataF, fquality: dataQ, k: dataK || '' })
    })
  }

  scan('#mp4', 'mp4')
  scan('#mp3', 'mp3')
  scan('.tab-pane', 'mp4')

  return { title, thumb, picks: pickList }
}

async function y2mateConvertir({ vid, k, ftype, fquality }) {
  const payload = { vid, k, ftype, fquality }
  const { data: res } = await client.post(CONVERT, qs.stringify(payload))
  if (!res || res.status !== 'ok' || !res.result) throw new Error('Error al procesar la conversión')
  const $ = cheerio.load(res.result)
  const link = $('a[href^="http"]').filter((_, el) => /download|redirect|cdn/i.test($(el).attr('href')||'')).first()
  if (!link.attr('href')) throw new Error('No se encontró el enlace de descarga')
  return { url: link.attr('href') }
}

function elegirMejor(picks, tipoDeseado = 'mp4', calidadDeseada) {
  const list = picks.filter(p => p.ftype === tipoDeseado.toLowerCase())
  if (!list.length) return null
  const peso = q => { const m = String(q).match(/(\d+)/); return m ? parseInt(m[1], 10) : 0 }
  if (calidadDeseada) {
    const target = peso(calidadDeseada)
    return list.sort((a,b)=>peso(b.fquality)-peso(a.fquality)).find(x=>peso(x.fquality)<=target) || list[0]
  }
  return list.sort((a,b)=>peso(b.fquality)-peso(a.fquality))[0]
}

async function headSize(url) {
  try {
    const r = await axios.head(url, { maxRedirects: 5 })
    const len = r.headers['content-length'] ? parseInt(r.headers['content-length'],10) : 0
    return len
  } catch { return 0 }
}

function formatBytes(bytes) {
  if (!bytes) return 'Desconocido'
  const u = ['B','KB','MB','GB']
  let i = 0, v = bytes
  while (v >= 1024 && i < u.length-1) { v /= 1024; i++ }
  return `${v.toFixed(2)} ${u[i]}`
}

// ========================= //
// Handler
// ========================= //
let handler = async (m, { conn, args, usedPrefix, command }) => {
  const text = args.join(' ')
  if (!text || !/https?:\/\//i.test(text)) {
    return m.reply(`🚩 Envía el comando con la URL de YouTube.\nEjemplo:\n${usedPrefix}${command} https://youtu.be/xxxx mp4 720p`)
  }

  const url = (text.match(/https?:\/\/\S+/) || [])[0]
  const typeArg = (text.match(/\b(mp3|mp4)\b/i) || [,'mp4'])[1].toLowerCase()
  const qArg = (text.match(/\b(\d{2,4}p|\d{2,4}kbps)\b/i) || [])[0]

  try { await conn.sendMessage(m.chat, { react: { text: rand(REACTS), key: m.key } }) } catch {}

  try {
    const html = await y2mateAnalizar(url, 'id')
    const info = parsearResultadoAnalisis(html)
    if (!info.picks.length) throw new Error('Formato no disponible')

    const pick = elegirMejor(info.picks, typeArg, qArg)
    if (!pick) throw new Error('Calidad no encontrada')

    const { url: dlink } = await y2mateConvertir(pick)
    const size = await headSize(dlink)

    const caption = [
      `📌 Título : ${info.title || '-'}`,
      `🎞 Tipo   : ${pick.ftype.toUpperCase()} ${pick.fquality}`,
      `📦 Tamaño : ${formatBytes(size)}`,
      `🌐 Fuente: www-y2mate.com/id20`,
      '',
      BRAND_FOOTER
    ].join('\n')

    if (pick.ftype === 'mp3') {
      await conn.sendMessage(m.chat, {
        audio: { url: dlink },
        mimetype: 'audio/mpeg',
        fileName: `${info.title || 'audio'}.mp3`,
        contextInfo: info.thumb ? {
          externalAdReply: {
            title: info.title || 'Y2Mate',
            body: BRAND_FOOTER,
            thumbnailUrl: info.thumb,
            sourceUrl: url,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        } : {}
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        video: { url: dlink },
        mimetype: 'video/mp4',
        fileName: `${info.title || 'video'}.mp4`,
        caption,
        contextInfo: info.thumb ? {
          externalAdReply: {
            title: info.title || 'Y2Mate',
            body: BRAND_FOOTER,
            thumbnailUrl: info.thumb,
            sourceUrl: url,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        } : {}
      }, { quoted: m })
    }

  } catch (e) {
    console.error('[Y2Mate]', e)
    return m.reply('❌ Error al procesar. Prueba otro formato/calidad o inténtalo más tarde.')
  }
}

// ========================= //
// Propiedades
// ========================= //
h
handler.command = /^(y2mate)$/i

export default handler