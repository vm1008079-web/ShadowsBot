import Database from '../lib/database.js'
const db = new Database('./database.json')

const handler = async (m) => {
  const userId = m.sender

  // forzar última versión de base
  db.load()
  await new Promise(res => setTimeout(res, 100)) // tiempo para que se cargue

  if (!db.data.users || !db.data.users[userId]) {
    return m.reply(`☁︎ ✐ No estás registrado ✐ ☁︎\n\nUsa *.reg Nombre Edad* para registrarte.`)
  }

  delete db.data.users[userId]
  db.save()
  await new Promise(res => setTimeout(res, 100)) // tiempo para que termine de guardar

  return m.reply(
`☁︎ ✐ Registro eliminado correctamente ✐ ☁︎

Ya no estás registrado.

☄︎ Puedes volver a registrarte cuando quieras usando *.reg Nombre Edad* ☄︎`)
}

handler.help = ['unreg']
handler.tags = ['eco']
handler.command = ['unreg', 'delete', 'remove']
export default handler