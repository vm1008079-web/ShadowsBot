import Database from '../lib/database.js' // ruta relativa correcta
const db = new Database('./database.json') // usa tu archivo

const handler = async (m) => {
  const userId = m.sender

  // asegúrate de que los datos existen
  if (!db.data.users || !db.data.users[userId]) {
    return m.reply(`☁︎ ✐ No estás registrado ✐ ☁︎\n\nUsa *.reg Nombre Edad* para registrarte.`)
  }

  delete db.data.users[userId] // borrar user
  db.save() // guardar cambios en archivo

  return m.reply(
`☁︎ ✐ Registro eliminado correctamente ✐ ☁︎

Ya no estás registrado.

☄︎ Puedes volver a registrarte cuando quieras usando *.reg Nombre Edad* ☄︎`)
}

handler.help = ['unreg']
handler.tags = ['eco']
handler.command = ['unreg', 'delete', 'remove']
export default handler