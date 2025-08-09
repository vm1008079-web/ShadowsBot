import ws from 'ws'

// Guarda la hora de inicio globalmente al encender el bot
if (!global.botStartTime) {
  global.botStartTime = Date.now()
}

let handler = async (m, { conn }) => {
  let uniqueUsers = new Map()

  if (!global.conns || !Array.isArray(global.conns)) global.conns = []

  // Agrega los subs activos al mapa
  for (const connSub of global.conns) {
    if (connSub.user && connSub.ws?.socket?.readyState !== ws.CLOSED) {
      const jid = connSub.user.jid
      const numero = jid?.split('@')[0]

      // Intenta obtener el nombre real desde WhatsApp
      let nombre = connSub.user.name
      if (!nombre && typeof conn.getName === 'function') {
        try {
          nombre = await conn.getName(jid)
        } catch {
          nombre = `Usuario ${numero}`
        }
      }

      uniqueUsers.set(jid, nombre || `Usuario ${numero}`)
    }
  }

  // Tiempo real desde que el bot se encendió
  const uptime = Date.now() - global.botStartTime
  const formatUptime = clockString(uptime)
  const totalUsers = uniqueUsers.size

  let txt = `❀ *Subs Activos* ✦\n\n`
  txt += `> ✦ *Actividad total:* ${formatUptime}\n`
  txt += `> ✦ *Subs conectados:* ${totalUsers}\n`

  if (totalUsers > 0) {
    txt += `\n❀ *Lista de Subs Activos* ✦\n\n`
    let i = 1
    for (const [jid, nombre] of uniqueUsers) {
      const numero = jid.split('@')[0]
      txt += `✦ *${i++}.* ${nombre}\n> ❀ wa.me/${numero}\n\n`
    }
  } else {
    txt += `\n> ❀ No hay subbots conectados por ahora.`
  }

  await conn.reply(m.chat, txt.trim(), m, global.rcanal)
}

handler.command = ['listjadibot', 'bots']
handler.help = ['bots']
handler.tags = ['serbot']
handler.register = true
export default handler

function clockString(ms) {
  const d = Math.floor(ms / 86400000) // días
  const h = Math.floor(ms / 3600000) % 24
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return `${d}d ${h}h ${m}m ${s}s`
}