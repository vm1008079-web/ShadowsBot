let cooldowns = {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
  let users = global.db.data.users
  let senderId = m.sender
  let senderName = conn.getName(senderId)

  let tiempo = 5 * 60 // 5 min en segundos XD
  if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < tiempo * 1000) {
    let tiempo2 = segundosAHMS(Math.ceil((cooldowns[senderId] + tiempo * 1000 - Date.now()) / 1000))
    return m.reply(`⚠ Ya hiciste un crimen, espera *${tiempo2}* para no acabar en la carcel we.`)
  }
  cooldowns[senderId] = Date.now()

  let senderCoin = users[senderId].coin || 0
  let posiblesVictimas = Object.keys(users).filter(id => id !== senderId)
  if (posiblesVictimas.length === 0) return m.reply(`⚠ No hay víctimas pa' robar.`)

  let randomUserId = posiblesVictimas[Math.floor(Math.random() * posiblesVictimas.length)]
  let randomUserCoin = users[randomUserId].coin || 0

  let minAmount = 15
  let maxAmount = 50
  let amountTaken = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount

  // Frases perronas para cada caso
  const frases = {
    exito: [
      `✧ Le cagaste la vida a @${randomUserId.split("@")[0]} y le arrebataste *${amountTaken} ${moneda}*.`,
      `⚠ Con un machetazo y un susto le quitaste *${amountTaken} ${moneda}* a @${randomUserId.split("@")[0]}.`,
      `❀ Le metiste una buena trompada y le sacaste *${amountTaken} ${moneda}* al desgraciado de @${randomUserId.split("@")[0]}.`,
      `☄︎ Partiste la madre a @${randomUserId.split("@")[0]} y saliste con *${amountTaken} ${moneda}* en los bolsillos.`
    ],
    atrapado: [
      `⚠ Te cazaron en pleno acto y te quitaron *${amountTaken} ${moneda}* por mamón.`,
      `❀ Policía te agarró y perdiste *${amountTaken} ${moneda}*, qué mala onda.`,
      `✧ Te descubrieron y te robaron *${amountTaken} ${moneda}*, eres un desastre.`,
      `☄︎ Te pillaron con las manos en la masa y perdiste *${amountTaken} ${moneda}*.`
    ],
    semi: [
      `⚠ Lograste robar, pero te vieron y solo agarraste *${amountTaken} ${moneda}* de @${randomUserId.split("@")[0]}.`,
      `❀ Hiciste un robo chueco y solo te quedaron *${amountTaken} ${moneda}*, igual bien ganado.`,
      `✧ Le quitaste algo, pero te cacharon y solo te quedaron *${amountTaken} ${moneda}*.`,
      `☄︎ Robaste a medias y sacaste *${amountTaken} ${moneda}* nomás, igual chido.`
    ]
  }

  let randomOption = Math.floor(Math.random() * 3)

  switch (randomOption) {
    case 0: // éxito total
      users[senderId].coin += amountTaken
      users[randomUserId].coin -= amountTaken
      await conn.sendMessage(m.chat, {
        text: `${frases.exito[Math.floor(Math.random() * frases.exito.length)]}`,
        contextInfo: {
          mentionedJid: [randomUserId],
        }
      }, { quoted: m })
      break
    case 1: // atrapado
      let amountSubtracted = Math.min(Math.floor(Math.random() * (senderCoin - minAmount + 1)) + minAmount, maxAmount)
      users[senderId].coin -= amountSubtracted
      await m.reply(`${frases.atrapado[Math.floor(Math.random() * frases.atrapado.length)]}`)
      break
    case 2: // semi exito
      let smallAmountTaken = Math.min(Math.floor(Math.random() * (randomUserCoin / 2 - minAmount + 1)) + minAmount, maxAmount)
      users[senderId].coin += smallAmountTaken
      users[randomUserId].coin -= smallAmountTaken
      await conn.sendMessage(m.chat, {
        text: `${frases.semi[Math.floor(Math.random() * frases.semi.length)]}`,
        contextInfo: {
          mentionedJid: [randomUserId],
        }
      }, { quoted: m })
      break
  }

  global.db.write()
}

handler.tags = ['economy']
handler.help = ['crimen']
handler.command = ['crimen', 'crime']
handler.register = true
handler.group = true

export default handler

function segundosAHMS(segundos) {
  let horas = Math.floor(segundos / 3600)
  let minutos = Math.floor((segundos % 3600) / 60)
  let segundosRestantes = segundos % 60
  return `${minutos} minutos y ${segundosRestantes} segundos`
}