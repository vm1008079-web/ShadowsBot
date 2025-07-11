import fs from 'fs'
const dbPath = './database.json'

const loadDB = () => fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : { users: {} }
const saveDB = (db) => fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))

const handler = async (m) => {
  const userId = m.sender
  const db = loadDB()

  if (!db.users[userId]) {
    db.users[userId] = {
      name: 'Desconocido',
      money: 0,
      bank: 0,
      level: 1,
    }
  }

  const user = db.users[userId]
  saveDB(db)

  return m.reply(
`💰 *Tu billetera* 💰

👤 Nombre: *${user.name}*
💸 Efectivo: *$${user.money || 0}*
🏦 Banco: *$${user.bank || 0}*
📊 Nivel: *${user.level || 1}*`
  )
}

handler.help = ['bal']
handler.tags = ['eco']
handler.command = ['bal', 'wallet', 'dinero']
export default handler