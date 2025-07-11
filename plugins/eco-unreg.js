import fs from 'fs'

const dbPath = './database.json'
let database = { users: {} }

// Cargar base de datos seguro
try {
  if (fs.existsSync(dbPath)) {
    const content = fs.readFileSync(dbPath, 'utf-8')
    database = content ? JSON.parse(content) : { users: {} }
    if (!database.users) database.users = {}
  } else {
    fs.writeFileSync(dbPath, JSON.stringify({ users: {} }, null, 2))
  }
} catch (e) {
  console.error('Error leyendo database.json:', e)
  database = { users: {} }
  fs.writeFileSync(dbPath, JSON.stringify(database, null, 2))
}

const handler = async (m) => {
  const userId = m.sender

  if (!database.users[userId]) {
    return m.reply('☁︎ ✐ No estás registrado. Usa *.reg Nombre Edad* para registrarte primero.')
  }

  // Eliminar usuario
  delete database.users[userId]

  // Guardar archivo actualizado
  fs.writeFileSync(dbPath, JSON.stringify(database, null, 2))

  return m.reply('☁︎ ✐ Registro eliminado correctamente. Ya puedes volver a registrarte usando *.reg Nombre Edad* ☁︎')
}

handler.command = ['unreg', 'delete', 'remove']
export default handler
