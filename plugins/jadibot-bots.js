import ws from 'ws'

let handler = async (m, { conn }) => {
  let uniqueUsers = new Map()

  if (!global.conns || !Array.isArray(global.conns)) global.conns = []

  for (const connSub of global.conns) {
    if (connSub.user && connSub.ws?.socket?.readyState !== ws.CLOSED) {
      const jid = connSub.user.jid
      const numero = jid?.split('@')[0]
      let nombre = connSub.user.name
      if (!nombre && typeof conn.getName === 'function') {
        try {
          nombre = await conn.getName(jid)
        } catch {
          nombre = `Usuario ${numero}`
        }
      }

      // Obtenemos uptime del subbot si existe, si no, usamos 0
      const subUptime = connSub.startTime ? Date.now() - connSub.startTime : 0
      uniqueUsers.set(jid, { nombre: nombre || `Usuario ${numero}`, uptime: subUptime })
    }
  }

  const totalUsers = uniqueUsers.size
  let txt = `🌟 *SUBS ACTIVOS* 🌟\n\n`
  txt += `👥 *Total Conectados:* ${totalUsers}\n`

  if (totalUsers > 0) {
    txt += `\n📋 *LISTA DE SUBS*\n\n`
    let i = 1
    for (const [jid, { nombre, uptime }] of uniqueUsers) {
      const numero = jid.split('@')[0]
      txt += `💎 *${i++}.* ${nombre}\n`
      txt += `⏳ *Tiempo Activo:* ${clockString(uptime)}\n`
      txt += `🔗 https://wa.me/${numero}\n\n`
    }
  } else {
    txt += `https://chat.whatsapp.com/HztBH5HP4kpBE86Nbuax4i?mode=ems_copy_c\n⚠️ *No hay subbots conectados actualmente.*`
  }

  await conn.reply(m.chat, txt.trim(), m, global.rcanal)
}

handler.command = ['listjadibot', 'bots']
handler.help = ['bots']
handler.tags = ['serbot']
handler.register = false
export default handler

function clockString(ms) {
  const d = Math.floor(ms / 86400000)
  const h = Math.floor(ms / 3600000) % 24
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return `${d}d ${h}h ${m}m ${s}s`
}