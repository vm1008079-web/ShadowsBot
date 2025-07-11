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

const handler = async (m, { conn }) => {
  const userId = m.sender

  if (!database.users[userId]) {
    return m.reply(`☁︎ ✐ No estás registrado ✐ ☁︎

Usa *.reg Nombre Edad* para registrarte primero.`)
  }

  delete database.users[userId]

  fs.writeFileSync(dbPath, JSON.stringify(database, null, 2))

  return m.reply(
`☁︎ ✐ Registro eliminado ✐ ☁︎

Ya no estás registrado.

☄︎ Si quieres volver a registrarte usa *.reg Nombre Edad* ☄︎`)
}

handler.command = ['unreg', 'delete', 'remove']
export default handler
