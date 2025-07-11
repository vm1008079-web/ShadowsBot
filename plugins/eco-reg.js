import fs from 'fs'

const dbPath = './database.json'
let database = { users: {} }

// Verificar si la base está vacía o mala
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

const handler = async (m, { args, command }) => {
  const userId = m.sender

  if (database.users[userId]) {
    const user = database.users[userId]
    return m.reply(
`☁︎ ✐ Ya estás registrado ✐ ☁︎

✦ Nombre: *${user.name}*
✦ Edad: *${user.age}*
✦ Registro: *${new Date(user.registeredAt).toLocaleString()}*

☄︎ Gracias por usar el bot ☄︎`)
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

  // Guardar al usuario
  database.users[userId] = {
    name,
    age,
    registeredAt: new Date().toISOString()
  }

  fs.writeFileSync(dbPath, JSON.stringify(database, null, 2))

  return m.reply(
`☁︎ ✐ Registro exitoso ✐ ☁︎

✦ Nombre: *${name}*
✦ Edad: *${age}*
✦ ID: *${userId.split('@')[0]}*

☄︎ Bienvenido a Chihuahua Bot ☄︎`)
}

handler.command = ['reg', 'register']
export default handler
