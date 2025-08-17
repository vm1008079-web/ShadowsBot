// antiarabepriv.js
const ownerNumber = "50493732693@s.whatsapp.net" // tu número como owner
const arabicPrefixes = ['212', '20', '971', '965', '966', '974', '973', '962']

const handler = async (m, { conn, command, args }) => {
  if (!global.db.data.settings) global.db.data.settings = {}
  const settings = global.db.data.settings

  if (m.sender !== ownerNumber) return m.reply('❌ Solo el owner puede usar este comando.')

  const option = (args[0] || '').toLowerCase()
  if (!['on', 'off'].includes(option)) {
    return m.reply(`✳️ Usa:\n*.antiarabepriv on* / *.antiarabepriv off*`)
  }

  settings.antiarabepriv = option === 'on'
  return m.reply(`✅ Antiarabe Priv ${option === 'on' ? 'activado' : 'desactivado'}.`)
}

handler.command = ['antiarabepriv']
handler.owner = true
handler.tags = ['owner']
handler.help = ['antiarabepriv on', 'antiarabepriv off']


handler.before = async (m, { conn }) => {
  if (m.isGroup) return
  if (!global.db.data.settings) global.db.data.settings = {}
  const settings = global.db.data.settings

  if (settings.antiarabepriv) {
    const number = m.sender.split('@')[0].replace(/\D/g, '')
    const isArab = arabicPrefixes.some(prefix => number.startsWith(prefix))

    if (isArab) {
      try {
        // opcional: manda aviso antes de bloquear
        await conn.sendMessage(m.chat, { text: "❌ No aceptamos números árabes en privado." })
        await conn.updateBlockStatus(m.sender, 'block')
        console.log(`Bloqueado número árabe: ${m.sender}`)
      } catch (e) {
        console.log('Error al bloquear:', e)
      }
    }
  }
}

export default handler