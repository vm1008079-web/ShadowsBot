import os from 'os'
import process from 'process'

let handler = async (m, { conn }) => {
  let start = Date.now()
  await m.reply('🔄 Obteniendo estadísticas, espera un momento...')

  let ping = Date.now() - start

  // Memoria RAM
  let totalMem = os.totalmem() / 1024 / 1024
  let freeMem = os.freemem() / 1024 / 1024
  let usedMem = totalMem - freeMem
  let memPercent = (usedMem / totalMem) * 100

  // CPU
  let cpus = os.cpus()
  let cpuModel = cpus[0].model
  let cpuCores = cpus.length
  let cpuSpeed = cpus[0].speed
  let loadAvg = os.loadavg()

  // Tiempos
  let uptime = process.uptime()
  let systemUptime = os.uptime()

  const formatTime = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = Math.floor(s % 60)
    return `${h ? h + 'h ' : ''}${m ? m + 'min ' : ''}${sec}s`
  }

  // Info del sistema
  let platform = os.platform()
  let release = os.release()
  let arch = os.arch()
  let hostname = os.hostname()

  // Node info
  let nodeVersion = process.version
  let pid = process.pid
  let cwd = process.cwd()

  // Mensaje formateado
  let text = `
「 *📊 Estado del Bot y Sistema* 

🔁 *Respuesta:* ${ping} ms
🧠 *RAM:* ${usedMem.toFixed(2)} MB / ${totalMem.toFixed(2)} MB (${memPercent.toFixed(2)}%)
🖥️ *CPU:* ${cpuModel}
⚙️ *Núcleos:* ${cpuCores} @ ${cpuSpeed} MHz
📉 *Carga Promedio:* ${loadAvg.map(n => n.toFixed(2)).join(', ')}

⏳ *Uptime Bot:* ${formatTime(uptime)}
🕒 *Uptime Sistema:* ${formatTime(systemUptime)}

💻 *Sistema:*
• Plataforma: ${platform}
• Versión: ${release}
• Arquitectura: ${arch}
• Hostname: ${hostname}

🧩 *NodeJS:*
• Versión: ${nodeVersion}
• PID: ${pid}
• Directorio: ${cwd}

*✨ Bot activo sin miedo al éxito UwU ✨*
`.trim()

  await conn.sendMessage(m.chat, { text, ...global.rcanal }, { quoted: m })
}

handler.command = ['speed', 'status']
handler.help = ['speed']
handler.tags = ['info']

export default handler