let handler = async (m, { conn, args, usedPrefix }) => {
  if (!m.isGroup) return m.reply('Este comando solo funciona en grupos we')
  if (!args[0]) return m.reply(`Usa: ${usedPrefix}setprimary <número_sin_codigo> \nEjemplo: ${usedPrefix}setprimary 5049382783`)
  
  let number = args[0].replace(/[^0-9]/g, '') // solo números limpios
  
  // Validación simple para que el número tenga mínimo 5 dígitos (ajusta según necesites)
  if (number.length < 5) return m.reply('Número inválido, pon un número válido we')

  // Cargar base de datos si no está
  if (global.db.data == null) await global.loadDatabase()

  // Guardar el número como primaryBot en el chat
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  global.db.data.chats[m.chat].primaryBot = number

  // Guardar DB (si usas algo para guardar)
  if (global.saveDatabase) await global.saveDatabase()

  m.reply(`El subbot con número *${number}* fue puesto como primario en este grupo`)
}

handler.help = ['setprimary <numero>']
handler.tags = ['owner']
handler.command = ['setprimary', 'primarybot']
handler.rowner = true // solo el creador puede usarlo

export default handler