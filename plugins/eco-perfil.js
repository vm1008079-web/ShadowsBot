import PhoneNumber from 'awesome-phonenumber'
import moment from 'moment-timezone'
import { createHash } from 'crypto'

let handler = async (m, { conn }) => {
  const user = global.db.data.users[m.sender]
  const nombre = user.name || await conn.getName(m.sender)
  const pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://files.catbox.moe/xr2m6u.jpg')
  const numero = PhoneNumber('+' + m.sender.replace(/[^0-9]/g, '')).getNumber('international')
  const fecha = moment().tz('America/Tegucigalpa')
  const sn = createHash('md5').update(m.sender).digest('hex').slice(0, 20)

  if (!user.registered) {
    return m.reply(`🔰 No estás registrado aún.\n➤ Usa: *.reg ${nombre}.18*`)
  }

  const tiempoRoll = `2 minutos 14 segundos`
  const tiempoClaim = `17 minutos 22 segundos`
  const tiempoVote = `1 hora 11 minutos 56 segundos`

  const personajesReclamados = 4
  const valorTotal = 288
  const personajesTotales = 45353
  const seriesTotales = 3784

  const textoPerfil = `
╭─❍ *❀ Usuario \`${nombre}\`* ❍─╮
│
│ ⴵ *RollWaifu* » ${tiempoRoll}
│ ⴵ *Claim* » ${tiempoClaim}
│ ⴵ *Vote* » ${tiempoVote}
│
│ ♡ *Personajes reclamados* » ${personajesReclamados}
│ ✰ *Valor total* » ${valorTotal}
│
│ ❏ *Personajes totales* » ${personajesTotales}
│ ❏ *Series totales* » ${seriesTotales}
│
│ 🏷 *Número:* ${numero}
│ 🔖 *ID:* ${sn}
│ 📅 *Fecha:* ${fecha.format('DD/MM/YYYY')}
╰──────────────────────────╯
`.trim()

  await conn.sendMessage(m.chat, {
    image: { url: pp },
    caption: textoPerfil,
    ...global.rcanal
  }, { quoted: m })
}

handler.help = ['perfil']
handler.tags = ['info']
handler.command = ['perfil', 'yo', 'miperfil']
export default handler