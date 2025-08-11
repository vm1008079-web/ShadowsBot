let cooldowns = {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
  let users = global.db.data.users
  let senderId = m.sender
  let senderName = conn.getName(senderId)

  let tiempo = 5 * 60 // 5 minutos en segundos
  if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < tiempo * 1000) {
    let tiempo2 = segundosAHMS(Math.ceil((cooldowns[senderId] + tiempo * 1000 - Date.now()) / 1000))
    return m.reply(`🚨 Ya hiciste un crimen, esperá *${tiempo2}* pa no caer preso we.`)
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

  

  const frases = {
  exito: [
    `✧ Le cagaste la vida a @${randomUserId.split("@")[0]} y le arrebataste *${amountTaken} ${moneda}*.`,
    `⚠ Con un machetazo y un susto le quitaste *${amountTaken} ${moneda}* a @${randomUserId.split("@")[0]}.`,
    `❀ Le metiste una buena trompada a @${randomUserId.split("@")[0]} y le sacaste *${amountTaken} ${moneda}*.`,
    `☄︎ Partiste la madre a @${randomUserId.split("@")[0]} y saliste con *${amountTaken} ${moneda}*.`,
    `🔪 Le diste piso a @${randomUserId.split("@")[0]} y te robaste *${amountTaken} ${moneda}*, qué perrote.`,
    `💸 Desvalijaste a @${randomUserId.split("@")[0]} como todo un capo y te pelaste con *${amountTaken} ${moneda}*.`,
    `💀 Atracaste a @${randomUserId.split("@")[0]} en la esquina y saliste con *${amountTaken} ${moneda}*.`,
    `😈 Le hiciste la 13-14 a @${randomUserId.split("@")[0]} y le volaste *${amountTaken} ${moneda}*.`,
    `🧨 Le explotaste la cartera a @${randomUserId.split("@")[0]} y te largaste con *${amountTaken} ${moneda}*.`,
    `🔥 @${randomUserId.split("@")[0]} no supo ni qué pedo y ya le habías quitado *${amountTaken} ${moneda}*.`,
    `🐒 Agarraste de pendejo a @${randomUserId.split("@")[0]} y le tumbaste *${amountTaken} ${moneda}*.`,
    `🎭 Usaste máscara y todo para asaltar a @${randomUserId.split("@")[0]} por *${amountTaken} ${moneda}*.`,
    `🚬 Te le apareciste como sombra a @${randomUserId.split("@")[0]} y lo dejaste sin *${amountTaken} ${moneda}*.`,
    `🏃‍♂️ Le hiciste el pase mágico a @${randomUserId.split("@")[0]} y le bajaste *${amountTaken} ${moneda}*.`,
    `🧤 Le metiste la mano al bolsillo a @${randomUserId.split("@")[0]} y ni cuenta se dio, *${amountTaken} ${moneda}*.`,
    `🕶 Con estilo y facha te tranzaste a @${randomUserId.split("@")[0]} por *${amountTaken} ${moneda}*.`,
    // Nuevas alaver pero claras
    `💥 Le diste un batazo a @${randomUserId.split("@")[0]} y le volaron las ganas de vivir, pero te quedaste con *${amountTaken} ${moneda}*.`,
    `🤯 Le bajaste hasta la dignidad a @${randomUserId.split("@")[0]} y encima te llevaste *${amountTaken} ${moneda}*.`,
    `🪓 Le dejaste la cartera partida en dos a @${randomUserId.split("@")[0]} y saliste corriendo con *${amountTaken} ${moneda}*.`,
    `🩸 Dejaste sangrando a @${randomUserId.split("@")[0]} pero con menos *${amountTaken} ${moneda}*.`
  ],
  atrapado: [
    `⚠ Te cazaron y te quitaron *${amountTaken} ${moneda}* por mamón.`,
    `❀ La policía te agarró y perdiste *${amountTaken} ${moneda}*, qué sad.`,
    `✧ Te descubrieron robando y te quitaron *${amountTaken} ${moneda}*, rata torpe.`,
    `☄︎ Te pillaron con las manos en la masa y perdiste *${amountTaken} ${moneda}*.`,
    `🚓 Te agarraron los tombos y te metieron la macana por robar *${amountTaken} ${moneda}*.`,
    `👮‍♂️ La jura te tundió y te volaron *${amountTaken} ${moneda}*.`,
    `🧱 Te metiste con los duros y te dejaron sin nada.`,
    `🩻 Te cacharon en cámara y te reventaron por *${amountTaken} ${moneda}*.`,
    `🥴 Saliste pa'l hospital y encima sin billete.`,
    `🙃 Te tropezaste huyendo y te quitaron *${amountTaken} ${moneda}*.`,
    `🥵 Se te cayó el botín en plena fuga, qué mamada.`,
    `🚔 Llegó la patrulla y te bajaron con todo.`,
    `💢 Una doña te agarró a bolsazos y perdiste *${amountTaken} ${moneda}*.`,
    // Nuevas alaver pero claras
    `🪦 Te mandaron directo al suelo y encima te volaron *${amountTaken} ${moneda}*.`,
    `🤕 Te dieron hasta con la chancla del 45 y perdiste *${amountTaken} ${moneda}*.`,
    `🗿 Quedaste más tieso que estatua y sin *${amountTaken} ${moneda}*.`,
    `🥶 Te congelaron de un macanazo y adiós *${amountTaken} ${moneda}*.`
  ],
  semi: [
    `⚠ Lograste robar a @${randomUserId.split("@")[0]} pero te vieron y solo agarraste *${amountTaken} ${moneda}*.`,
    `❀ Hiciste un robo chueco a @${randomUserId.split("@")[0]} y solo te quedaron *${amountTaken} ${moneda}*.`,
    `✧ Le quitaste algo a @${randomUserId.split("@")[0]}, pero te cacharon y solo te quedaron *${amountTaken} ${moneda}*.`,
    `☄︎ Robaste a medias a @${randomUserId.split("@")[0]} y sacaste *${amountTaken} ${moneda}*.`,
    `🫥 Te tembló la mano robando a @${randomUserId.split("@")[0]} pero igual agarraste *${amountTaken} ${moneda}*.`,
    `🥷 Medio ninja fuiste con @${randomUserId.split("@")[0]} y te llevaste *${amountTaken} ${moneda}*.`,
    `😬 Lo hiciste todo nervioso con @${randomUserId.split("@")[0]} y te escapaste con *${amountTaken} ${moneda}*.`,
    `💨 Fuiste rápido pero no tanto, le robaste a @${randomUserId.split("@")[0]} *${amountTaken} ${moneda}*.`,
    `🤕 Casi te revientan robando a @${randomUserId.split("@")[0]} pero saliste con *${amountTaken} ${moneda}*.`,
    `👟 Corriste como loco después de robar a @${randomUserId.split("@")[0]} y apenas te quedó *${amountTaken} ${moneda}*.`,
    `🐀 Le agarraste a @${randomUserId.split("@")[0]} lo que pudiste y saliste huyendo.`,
    `😅 Medio robo a @${randomUserId.split("@")[0]}, medio susto, y *${amountTaken} ${moneda}* de ganancia.`,
    `🤡 Estabas por lograrlo con @${randomUserId.split("@")[0]} pero hiciste ruido y saliste con lo que pudiste.`,
    // Nuevas alaver pero claras
    `🩻 Te llevaste algo de @${randomUserId.split("@")[0]} pero quedaste cojeando con *${amountTaken} ${moneda}*.`,
    `🥴 Casi la cagas con @${randomUserId.split("@")[0]} pero alcanzaste a agarrar *${amountTaken} ${moneda}*.`,
    `🪃 El robo a @${randomUserId.split("@")[0]} se te devolvió pero te quedó *${amountTaken} ${moneda}*.`,
    `💀 Le quitaste poquito a @${randomUserId.split("@")[0]} y casi quedas en el piso.`
  ]
}  

  let randomOption = Math.floor(Math.random() * 3)

  switch (randomOption) {
    case 0:
      users[senderId].coin += amountTaken
      users[randomUserId].coin -= amountTaken
      await conn.sendMessage(m.chat, {
        text: frases.exito[Math.floor(Math.random() * frases.exito.length)],
        contextInfo: {
          mentionedJid: [randomUserId],
          ...global.rcanal
        }
      }, { quoted: m })
      break
    case 1:
      let amountSubtracted = Math.min(Math.floor(Math.random() * (senderCoin - minAmount + 1)) + minAmount, maxAmount)
      users[senderId].coin -= amountSubtracted
      await conn.sendMessage(m.chat, {
        text: frases.atrapado[Math.floor(Math.random() * frases.atrapado.length)],
        contextInfo: global.rcanal
      }, { quoted: m })
      break
    case 2:
      let smallAmountTaken = Math.min(Math.floor(Math.random() * (randomUserCoin / 2 - minAmount + 1)) + minAmount, maxAmount)
      users[senderId].coin += smallAmountTaken
      users[randomUserId].coin -= smallAmountTaken
      await conn.sendMessage(m.chat, {
        text: frases.semi[Math.floor(Math.random() * frases.semi.length)],
        contextInfo: {
          mentionedJid: [randomUserId],
          ...global.rcanal
        }
      }, { quoted: m })
      break
  }

  global.db.write()
}

handler.tags = ['eco']
handler.help = ['crime']
handler.command = ['crimen', 'crime']
handler.register = true
handler.group = false

export default handler

function segundosAHMS(segundos) {
  let horas = Math.floor(segundos / 3600)
  let minutos = Math.floor((segundos % 3600) / 60)
  let segundosRestantes = segundos % 60
  return `${minutos} minutos y ${segundosRestantes} segundos`
}