import fs from 'fs'

const dbPath = './database.json'
let database = { users: {} }

// Cargar base
if (fs.existsSync(dbPath)) {
  database = JSON.parse(fs.readFileSync(dbPath))
} else {
  fs.writeFileSync(dbPath, JSON.stringify(database, null, 2))
}

const handler = async (m, { text, args }) => {
  const userId = m.sender

  // Ya está registrado
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

  if (isNaN(age) || age < 1) {
    return m.reply('☁︎ ✐ La edad no es válida, bro ✐ ☁︎')
  }

  // Guardar
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
✦ ID: *${userId.split('@')[0]}*`)
}

handler.command = ['reg', 'register']
export default handler
