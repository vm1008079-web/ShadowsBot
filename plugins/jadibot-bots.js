import ws from 'ws'

let handler = async (m, { conn }) => {
  let uniqueUsers = new Map()

  if (!global.conns || !Array.isArray(global.conns)) global.conns = []

  // 📌 Agregar subs activos al mapa
  for (const connSub of global.conns) {
    if (connSub.user && connSub.ws?.socket?.readyState !== ws.CLOSED) {
      const jid = connSub.user.jid
      const numero = jid?.split('@')[0]

      // 📌 Obtener nombre real
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

  // ⏳ Tiempo de actividad desde que se encendió el server/bot
  const uptime = process.uptime() * 1000
  const formatUptime = clockString(uptime)
  const totalUsers = uniqueUsers.size

  // 🎨 Diseño bonito y ordenado
  let txt = ` *📡 Subs Activos* 〕\n\n`
  txt += `💠 *Actividad Total:* \`${formatUptime}\`\n`
  txt += `💠 *Subs Conectados:* \`${totalUsers}\`\n`

  if (totalUsers > 0) {
    txt += `\n╭━〔 *📜 Lista de Subs* 〕━╮\n\n`
    let i = 1
    for (const [jid, nombre] of uniqueUsers) {
      const numero = jid.split('@')[0]
      txt += `🔹 *${i++}.* ${nombre}\n`
      txt += `   🔗 wa.me/${numero}\n\n`
    }
    txt += `╰━━━━━━━━━━━━━━━━━━╯`
  } else {
    txt += `\n⚠️ *No hay subbots conectados por ahora.*`
  }

  txt += `\n╰━━━━━━━━━━━━╯`

  await conn.reply(m.chat, txt.trim(), m, global.rcanal)
}

handler.command = ['listjadibot', 'bots']
handler.help = ['bots']
handler.tags = ['serbot']
handler.register = true
export default handler

function clockString(ms) {
  const d = Math.floor(ms / 86400000)
  const h = Math.floor(ms / 3600000) % 24
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return `${d}d ${h}h ${m}m ${s}s`
}