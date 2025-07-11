import fs from 'fs'
const dbPath = './database.json'

// Cargar base actual
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

// Guardar base actual
const saveDatabase = (db) => {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

const handler = async (m) => {
  const userId = m.sender
  let database = loadDatabase() // <-- Esto es lo que arregla el bug 🔥

  if (!database.users[userId]) {
    return m.reply(`☁︎ ✐ No estás registrado ✐ ☁︎\n\nUsa *.reg Nombre Edad* para registrarte.`)
  }

  delete database.users[userId]
  saveDatabase(database)

  return m.reply(
`☁︎ ✐ Registro eliminado correctamente ✐ ☁︎

Ya no estás registrado.

☄︎ Puedes volver a registrarte cuando quieras usando *.reg Nombre Edad* ☄︎`)
}

handler.command = ['unreg', 'delete', 'remove']
export default handler
