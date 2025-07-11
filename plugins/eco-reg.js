import Database from '../lib/database.js'
const db = new Database('./database.json')

const handler = async (m, { conn, args }) => {
  const userId = m.sender

  db.load()
  await new Promise(res => setTimeout(res, 100)) // espera para cargar bien

  if (db.data.users?.[userId]) {
    const user = db.data.users[userId]
    const fecha = new Date(user.registeredAt)
    const msg =
`☁︎ ✐ Ya estás registrado ✐ ☁︎

✦ Nombre: *${user.name}*
✦ Edad: *${user.age}*
✦ ID: *${userId.split('@')[0]}*
✦ Fecha: *${fecha.toLocaleDateString()}*
✦ Hora: *${fecha.toLocaleTimeString()}*

☄︎ Gracias por usar el bot ☄︎`

    const pfp = await conn.profilePictureUrl(userId, 'image').catch(() => null)
    return conn.sendMessage(m.chat, {
      image: { url: pfp || 'https://files.catbox.moe/akyfv4.jpg' },
      caption: msg
    }, { quoted: m })
  }

  if (args.length < 2) {
    return m.reply(
`☁︎ ✐ Formato incorrecto ✐ ☁︎

Usa: *.reg Nombre Edad*
Ejemplo: *.reg Adonay 17*

☄︎ Inténtalo de nuevo ☄︎`)
  }

  const name = args[0]
  const age = parseInt(args[1])
  if (isNaN(age) || age < 1) return m.reply('☁︎ ✐ Edad inválida ✐ ☁︎')

  const fechaRegistro = new Date().toISOString()

  if (!db.data.users) db.data.users = {}

  db.data.users[userId] = {
    name,
    age,
    registeredAt: fechaRegistro,
    money: 0,
    bank: 0,
    level: 1
  }

  db.save()
  await new Promise(res => setTimeout(res, 100))

  const fecha = new Date(fechaRegistro)
  const replyText =
`☁︎ ✐ Registro exitoso ✐ ☁︎

✦ Nombre: *${name}*
✦ Edad: *${age}*
✦ ID: *${userId.split('@')[0]}*
✦ Fecha: *${fecha.toLocaleDateString()}*
✦ Hora: *${fecha.toLocaleTimeString()}*

☄︎ Bienvenido ☄︎`

  const pfp = await conn.profilePictureUrl(userId, 'image').catch(() => null)

  return conn.sendMessage(m.chat, {
    image: { url: pfp || 'https://files.catbox.moe/akyfv4.jpg' },
    caption: replyText
  }, { quoted: m })
}

handler.help = ['reg']
handler.tags = ['eco']
handler.command = ['reg', 'register']
export default handler