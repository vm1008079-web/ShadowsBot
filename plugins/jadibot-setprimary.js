let handler = async (m, { conn, args, usedPrefix }) => {
  if (!m.isGroup) return m.reply('Este comando solo funciona en grupos wey')
  if (!args[0]) return m.reply(`Usa: ${usedPrefix}setprimary <numero_sin_codigo> \nEjemplo: ${usedPrefix}setprimary 5049382783`)

  let number = args[0].replace(/[^0-9]/g, '') // solo números limpios

  if (number.length < 5) return m.reply('Número inválido, pon un número válido we')

  if (global.db.data == null) await global.loadDatabase()

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  global.db.data.chats[m.chat].primaryBot = number

  if (global.saveDatabase) await global.saveDatabase()

  m.reply(`El subbot con número *${number}* fue puesto como primario en este grupo`)
}

handler.help = ['setprimary <numero>']
handler.tags = ['owner']
handler.command = ['setprimary', 'primarybot']
handler.rowner = true // solo creador puede usarlo

export default handler