import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, '❀ Por favor, proporciona el nombre de una canción o artista.', m)
  try {
    const results = await spotifyxv(text)
    if (!results || !results.length) throw '✧ No se encontró la canción.'
    const song = results[0]
    let dlUrl = null
    let cover = song.imagen
    let apiTitle = song.name
    let apiArtist = Array.isArray(song.artista) ? song.artista.join(', ') : song.artista
    let apiAlbum = song.album
    let apiDuration = song.duracion

    try {
      const res = await fetch(`https://api.sylphy.xyz/download/spotify?url=${encodeURIComponent(song.url)}&apikey=sylph-96ccb836bc`)
      if (!res.ok) throw new Error(`Estado ${res.status}`)
      const data = await res.json()
      const payload = data?.data || data?.result || data
      dlUrl = payload?.dl_url || payload?.download_url || payload?.url || payload?.link || null
      cover = payload?.img || payload?.image || payload?.thumbnail || cover
      apiTitle = payload?.title || apiTitle
      apiArtist = payload?.artist || apiArtist
      apiAlbum = payload?.album || apiAlbum
      apiDuration = payload?.duration || apiDuration
    } catch {}

    if (!dlUrl) dlUrl = song.preview_url || null
    if (!dlUrl) throw 'No se pudo obtener el enlace de descarga.'

    const info =
      `「✦」Descargando *<${apiTitle}>*\n\n` +
      `> ✧ Artista » *${apiArtist}*\n` +
      `> ✰ Album » *${apiAlbum}*\n` +
      `> ⴵ Duracion » *${apiDuration}*\n` +
      `> 🜸 Link » ${song.url}`

    await conn.sendMessage(
      m.chat,
      {
        text: info,
        contextInfo: {
          forwardingScore: 9999999,
          isForwarded: false,
          externalAdReply: {
            showAdAttribution: true,
            containsAutoReply: true,
            renderLargerThumbnail: true,
            title: 'Spotify Downloader',
            body: 'Music',
            mediaType: 1,
            thumbnailUrl: cover,
            mediaUrl: song.url,
            sourceUrl: song.url
          }
        }
      },
      { quoted: m }
    )

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: dlUrl },
        fileName: `${sanitizeFilename(apiTitle)}.mp3`,
        mimetype: 'audio/mpeg',
        ptt: false
      },
      { quoted: m }
    )
  } catch (e1) {
    m.reply(`${e1.message || e1}`)
  }
}

handler.help = ['spotify', 'music']
handler.tags = ['downloader']
handler.command = ['spotify', 'splay']
handler.group = true

export default handler

async function spotifyxv(query) {
  const token = await tokens()
  const response = await axios({
    method: 'get',
    url: 'https://api.spotify.com/v1/search?q=' + encodeURIComponent(query) + '&type=track&limit=10',
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
  const tracks = response?.data?.tracks?.items || []
  const results = tracks.map((track) => ({
    name: track?.name || '',
    artista: (track?.artists || []).map((artist) => artist?.name || '').filter(Boolean),
    album: track?.album?.name || '',
    duracion: timestamp(track?.duration_ms || 0),
    url: track?.external_urls?.spotify || '',
    imagen: track?.album?.images?.length ? track?.album?.images[0]?.url : '',
    preview_url: track?.preview_url || ''
  }))
  return results
}

async function tokens() {
  const response = await axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from('acc6302297e040aeb6e4ac1fbdfd62c3:0e8439a1280a43aba9a5bc0a16f3f009').toString('base64')
    },
    data: 'grant_type=client_credentials'
  })
  return response?.data?.access_token
}

function timestamp(time) {
  const t = Number.isFinite(time) ? time : 0
  const minutes = Math.floor(t / 60000)
  const seconds = Math.floor((t % 60000) / 1000)
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
}

async function getBuffer(url, options) {
  try {
    options = options || {}
    const res = await axios({
      method: 'get',
      url,
      headers: {
        DNT: 1,
        'Upgrade-Insecure-Request': 1
      },
      ...options,
      responseType: 'arraybuffer'
    })
    return res.data
  } catch (err) {
    return err
  }
}

async function getTinyURL(text) {
  try {
    const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(text)}`)
    return response.data
  } catch {
    return text
  }
}

function sanitizeFilename(name) {
  return String(name || 'audio').replace(/[\\/:*?"<>|]+/g, '').trim() || 'audio'
}