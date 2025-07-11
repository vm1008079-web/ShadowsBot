import fs from 'fs'

const dbPath = './database.json'
let database = { users: {} }

try {
  if (fs.existsSync(dbPath)) {
    const content = fs.readFileSync(dbPath)
    database = JSON.parse(content.length ? content : '{}')
    if (!database.users) database.users = {}
  } else {
    fs.writeFileSync(dbPath, JSON.stringify(database, null, 2))
  }
} catch (e) {
  console.error('❌ Error en base de datos:', e)
  database = { users: {} }
  fs.writeFileSync(dbPath, JSON.stringify(database, null, 2))
}

const handler = async (m, { conn, args }) => {
  const userId = m.sender

  if (database.users[userId]) {
    const user = database.users[userId]
    const fecha = new Date(user.registeredAt)
    const text =
`☁︎ ✐ Ya estás registrado ✐ ☁︎

✦ Nombre: *${user.name}*
✦ Edad: *${user.age}*
✦ ID: *${userId.split('@')[0]}*
✦ Fecha de registro: *${fecha.toLocaleDateString()}*
✦ Hora de registro: *${fecha.toLocaleTimeString()}*`

    let pfp = await conn.profilePictureUrl(userId, 'image').catch(() => null)

    return await conn.sendMessage(m.chat, {
      image: { url: pfp || 'https://i.imgur.com/4V6VqZB.png' },
      caption: text
    }, { quoted: m })
  }

  if (args.length < 2) {
    return m.reply(`☁︎ ✐ Formato incorrecto ✐ ☁︎

Usa: *.reg Nombre Edad*
Ejemplo: *.reg Adonay 17*

☄︎ Inténtalo de nuevo ☄︎`)
  }

  const name = args[0]
  const age = parseInt(args[1])

  if (isNaN(age) || age < 1) return m.reply('☁︎ ✐ Edad inválida ✐ ☁︎')

  const fechaRegistro = new Date().toISOString()

  database.users[userId] = {
    name,
    age,
    registeredAt: fechaRegistro
  }

  fs.writeFileSync(dbPath, JSON.stringify(database, null, 2))

  const fecha = new Date(fechaRegistro)
  const replyText =
`☁︎ ✐ Registro exitoso ✐ ☁︎

✦ Nombre: *${name}*
✦ Edad: *${age}*
✦ ID: *${userId.split('@')[0]}*
✦ Fecha de registro: *${fecha.toLocaleDateString()}*
✦ Hora de registro: *${fecha.toLocaleTimeString()}*`

  let profilePic = await conn.profilePictureUrl(userId, 'image').catch(() => null)

  return await conn.sendMessage(m.chat, {
    image: { url: profilePic || 'https://i.imgur.com/4V6VqZB.png' },
    caption: replyText
  }, { quoted: m })
}

handler.command = ['reg', 'register']
export default handler
