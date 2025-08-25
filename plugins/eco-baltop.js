let handler = async (m, { conn, participants }) => {
  let users = Object.entries(global.db.data.users).map(([jid, data]) => ({
    jid,
    coin: data.coin || 0,
    bank: data.bank || 0
  }))

  
  let sorted = users.sort((a, b) => (b.coin + b.bank) - (a.coin + a.bank))

  let text = `❄ Ranking completo de *${moneda}*:\n\n`
  let mentions = []

  for (let i = 0; i < sorted.length; i++) {
    let user = sorted[i]
    let total = user.coin + user.bank
    let displayName = await conn.getName(user.jid) 

    mentions.push(user.jid)

    text += `🐦‍🔥 ${i + 1} › ${displayName}\n    Total: *${total} ${moneda}*\n\n`
  }

  await conn.reply(m.chat, text.trim(), m, { mentions })
}

handler.help = ['baltop']
handler.tags = ['rpg']
handler.command = ['baltop', 'eboard']
handler.group = false
handler.register = false

export default handler