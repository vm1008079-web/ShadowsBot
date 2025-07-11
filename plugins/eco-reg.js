import fs from 'fs'
const dbPath = './database.json'

const loadDatabase = () => {
  if (!fs.existsSync(dbPath)) return { users: {} }
  const raw = fs.readFileSync(dbPath, 'utf-8')
  if (!raw) return { users: {} }
  try {
    return JSON.parse(raw)
  } catch {
    return { users: {} }
  }
}

const saveDatabase = (db) => {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

const handler = async (m, { conn, args }) => {
  // Cargo la base actualizada
  let database = loadDatabase()

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
✦ Hora de registro: *${fecha.toLocaleTimeString()}*

☄︎ Gracias por usar el bot ☄︎`

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

  // Guardar al user en la base y salvar
  database.users[userId] = {
    name,
    age,
    registeredAt: fechaRegistro
  }

  saveDatabase(database)

  const fecha = new Date(fechaRegistro)
  const replyText =
`☁︎ ✐ Registro exitoso ✐ ☁︎

✦ Nombre: *${name}*
✦ Edad: *${age}*
✦ ID: *${userId.split('@')[0]}*
✦ Fecha de registro: *${fecha.toLocaleDateString()}*`

  let profilePic = await conn.profilePictureUrl(userId, 'image').catch(() => null)

  return await conn.sendMessage(m.chat, {
    image: { url: profilePic || 'https://files.catbox.moe/akyfv4.jpg' },
    caption: replyText
  }, { quoted: m })
}

handler.command = ['reg', 'register']
export default handler
