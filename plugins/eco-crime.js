let cooldowns = {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
  let users = global.db.data.users
  let senderId = m.sender
  let senderName = await conn.getName(senderId)

  let tiempo = 5 * 60
  if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < tiempo * 1000) {
    let tiempo2 = segundosAHMS(Math.ceil((cooldowns[senderId] + tiempo * 1000 - Date.now()) / 1000))
    return m.reply(`❐☁︎ Ya te venís usando mucho eso, espera *${tiempo2}* pa volver a usar *#slut*.`)
  }

  cooldowns[senderId] = Date.now()

  let senderCoin = users[senderId].coin || 0
  let randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]
  while (randomUserId === senderId) {
    randomUserId = Object.keys(users)[Math.floor(Math.random() * Object.keys(users).length)]
  }

  let randomUserCoin = users[randomUserId].coin || 0
  let minAmount = 15
  let maxAmount = 50
  let amountTaken = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount
  let randomOption = Math.floor(Math.random() * 3)

  const frases = [
    `☁︎✐ Le agarraste la verga a @${randomUserId.split("@")[0]} y lo dejaste temblando 😩\n➩ Te ganaste *${amountTaken} monedas*.`,
    `❐☄︎ Le diste una nalgada tan fuerte a @${randomUserId.split("@")[0]} que gritó "ay papi" 🔥\n➩ Se suman *${amountTaken} monedas*.`,
    `✎💦 Le hiciste el gawk gawk 3000 a @${randomUserId.split("@")[0]} sin piedad 🤤\n➩ Te pagó *${amountTaken} monedas*.`,
    `☁︎✐ Usaste las dos manos y la boca a la vez con @${randomUserId.split("@")[0]}, quedó mudo 🤯\n➩ Ganaste *${amountTaken} monedas*.`,
    `❐☄︎ Le rebotaste encima a @${randomUserId.split("@")[0]} que ya no sabe si está vivo 💀\n➩ *+${amountTaken} monedas*.`,
  ]

  const frasesFail = [
    `✐☁︎ Le mordiste la verga sin querer y te demandaron 😭\n➩ Perdiste monedas por bruto.`,
    `❐🔥 El cliente te vomitó del asco we, que mal servicio 😂\n➩ Te descontaron monedas.`,
    `☁︎✎ Te resbalaste y caíste encima del cliente, te tocó pagar el hospital 🏥\n➩ *- monedas*.`
  ]

  switch (randomOption) {
    case 0:
      users[senderId].coin += amountTaken
      users[randomUserId].coin -= amountTaken
      conn.sendMessage(m.chat, {
        text: frases.random(),
        mentions: [randomUserId]
      }, { quoted: m })
      break
    case 1:
      let amountSubtracted = Math.min(Math.floor(Math.random() * (senderCoin - minAmount + 1)) + minAmount, maxAmount)
      users[senderId].coin -= amountSubtracted
      m.reply(`${frasesFail.random()}\n\n➩ Se restan *-${amountSubtracted} monedas* a ${senderName}`)
      break
    case 2:
      let smallAmountTaken = Math.min(Math.floor(Math.random() * (randomUserCoin / 2 - minAmount + 1)) + minAmount, maxAmount)
      users[senderId].coin += smallAmountTaken
      users[randomUserId].coin -= smallAmountTaken
      conn.sendMessage(m.chat, {
        text: `❐✐ Te bajaste los calzones frente a @${randomUserId.split("@")[0]} y el vato ni pensó, solo pagó 🤡\n\n➩ *+${smallAmountTaken} monedas* sumadas.`,
        mentions: [randomUserId]
      }, { quoted: m })
      break
  }

  global.db.write()
}

handler.tags = ['eco']
handler.help = ['slut']
handler.command = ['slut', 'protituirse']
handler.register = true
handler.group = true

export default handler

function segundosAHMS(segundos) {
  let minutos = Math.floor((segundos % 3600) / 60)
  let segundosRestantes = segundos % 60
  return `${minutos}m ${segundosRestantes}s`
}

Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)]
}